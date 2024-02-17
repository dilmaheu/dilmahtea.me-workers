// @ts-check

import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import getPaymentMethodTypes from "./getPaymentMethodTypes";

export default async function getValidatedData(paymentData, CMSData) {
  // process data for validation
  const {
    crowdfundingPlans: { data: crowdfundingPlans },
    i18NLocales: { data: i18NLocales },
    products: { data: productsData },
  } = CMSData;

  const crowdfundingPerks = {};

  crowdfundingPlans.forEach(({ attributes: { Perk, Price_EUR_excl_VAT } }) => {
    crowdfundingPerks[Perk] = Price_EUR_excl_VAT;
  });

  const locales = i18NLocales.map(({ attributes: { code } }) =>
    code.substring(0, 2),
  );

  const products = [];

  productsData.forEach(({ attributes }) => {
    const { SKU, Price, VatPercentage, Stock_amount } = attributes;

    products[SKU] = {
      sku: SKU,
      Price,
      VatPercentage,
      stockAmount: Stock_amount,
    };
  });

  const countries = CMSData.countries.data.map(
    ({ attributes: { name } }) => name,
  );

  const shippingMethods = {};

  CMSData.shippingMethods.data.forEach(({ attributes: { method, cost } }) => {
    shippingMethods[method] = cost;
  });

  const paymentMethodNames = getPaymentMethodTypes(
    paymentData.billing_country,
    CMSData,
  );

  // validate data
  paymentData.tax &&= +paymentData.tax;
  paymentData.price &&= +paymentData.price;
  paymentData.shipping_cost &&= +paymentData.shipping_cost;
  paymentData.cart &&= JSON.parse(paymentData.cart);

  const BasePaymentIntentSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    city: z.string(),
    street: z.string(),
    postal_code: z.string().regex(/^[\w- ]+$/),
    billing_first_name: z.string(),
    billing_last_name: z.string(),
    billing_city: z.string(),
    billing_street: z.string(),
    billing_postal_code: z.string().regex(/^[\w- ]+$/),
    locale: z.enum(locales),
    origin_url: z.string().url(),
    success_url: z.string().url(),
  });

  const CrowdfundingPaymentIntentSchema = BasePaymentIntentSchema.extend({
    payment_type: z.literal("crowdfunding"),
    country: z.literal("Netherlands"),
    billing_country: z.literal("Netherlands"),
    favorite_tea: z.string(),
    payment_method_name: z.enum(paymentMethodNames),
    // @ts-ignore
    stripeToken: z.string(),
    perk: z.enum(Object.keys(crowdfundingPerks)),
    product_desc: z
      .string()
      .refine((value) => value === `${paymentData.perk} Plan`),
    price: z
      .number()
      .refine((value) => value === crowdfundingPerks[paymentData.perk]),
  });

  const EcommercePaymentIntentSchema = BasePaymentIntentSchema.extend({
    payment_type: z.literal("ecommerce"),
    country: z.enum(countries),
    billing_country: z.enum(countries),
    payment_method_name: z.enum(paymentMethodNames),
    // @ts-ignore
    stripeToken: z.string(),
    shipping_method: z.enum(Object.keys(shippingMethods)),
    shipping_cost: z
      .number()
      .refine(
        (value) => value === shippingMethods[paymentData.shipping_method],
      ),
    cart: z.record(
      // @ts-ignore
      z.enum(Object.keys(products)),
      z
        .object({
          names: z.string(),
          sku: z.string(),
          tax: z.number(),
          price: z.number(),
          quantity: z.number().min(1).int(),
        })
        .refine(({ sku, tax, price, quantity }) => {
          const product = products[sku];

          const subTotal = product.Price * quantity,
            calculatedTax = Math.round(subTotal * product.VatPercentage) / 100,
            calculatedPrice =
              Math.round((subTotal + calculatedTax) * 100) / 100;

          return (
            tax === calculatedTax &&
            price === calculatedPrice &&
            quantity <= product.stockAmount
          );
        }),
    ),
    product_desc: z.string().refine(
      (value) =>
        value ===
        Object.values(paymentData.cart)
          .map(
            ({ names, quantity }) =>
              `${quantity}x ${JSON.parse(names)[paymentData.locale]}`,
          )
          .join(", "),
    ),
    price: z
      .number()
      .refine(
        (value) =>
          value ===
          Math.round(
            (Object.values(paymentData.cart).reduce(
              (total, { price }) => total + price,
              0,
            ) +
              paymentData.shipping_cost) *
              100,
          ) /
            100,
      ),
    tax: z
      .number()
      .refine(
        (value) =>
          value ===
          Math.round(
            Object.values(paymentData.cart).reduce(
              (total, { tax }) => total + tax,
              0,
            ) * 100,
          ) /
            100,
      ),
  });

  const PaymentIntentSchema =
    paymentData.payment_type === "crowdfunding"
      ? CrowdfundingPaymentIntentSchema
      : EcommercePaymentIntentSchema;

  try {
    return PaymentIntentSchema.parse(paymentData);
  } catch (error) {
    return {
      message: "Validation error!",
      errors: fromZodError(error).toString().slice(18).split(";"),
    };
  }
}
