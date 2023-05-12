import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const query = `
  {
    crowdfundingPlans {
      data {
        attributes {
          Perk
          Price_EUR_excl_VAT
        }
      }
    }

    recurringElement {
      data {
        attributes {
          Company_name
        }
      }
    }

    i18NLocales {
      data {
        attributes {
          code
        }
      }
    }

    products {
      data {
        attributes {
          locale
          SKU
          Title
          Price
          Weight_tea
          Weight_tea_unit
          localizations {
            data {
              attributes {
                locale
                Title
              }
            }
          }
        }
      }
    }

    countries {
      data {
        attributes {
          name
        }
      }
    }

    kindnessCauses {
      data {
        attributes {
          cause
        }
      }
    }

    shippingMethods {
      data {
        attributes {
          method
          cost
        }
      }
    }
  }
`;

export async function getValidatedData(paymentData, env) {
  console.log(paymentData);
  console.log("typeof paymentData", typeof paymentData);
  // process data for validation
  const CMSData = await fetch(env.CMS_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CMS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  })
    .then((response) => {
      console.log(JSON.stringify(response, null, 2));
      return response.json();
    })
    .catch((e) => {
      console.log("error", e);
      throw new Error(e);
    });

  const {
    data: {
      crowdfundingPlans: { data: crowdfundingPlans },
      recurringElement: { data: recurringElement },
      i18NLocales: { data: i18NLocales },
      products: { data: productsData },
    },
  } = CMSData;

  console.log("1");
  const crowdfundingPerks = {};

  crowdfundingPlans.forEach(({ attributes: { Perk, Price_EUR_excl_VAT } }) => {
    crowdfundingPerks[Perk] = Price_EUR_excl_VAT;
  });

  console.log("2");

  const locales = i18NLocales.map(({ attributes: { code } }) =>
    code.substring(0, 2)
  );

  console.log("3");

  const products = [];

  productsData.forEach(({ attributes }) => {
    const { SKU, Price, Weight_tea, Weight_tea_unit, localizations } =
      attributes;

    const names = {};

    [{ attributes }, ...localizations.data].forEach(
      ({ attributes: { locale, Title } }) => {
        names[locale.substring(0, 2)] = Title;
      }
    );

    const size = Weight_tea + Weight_tea_unit,
      tax = Math.round(Price * 9) / 100;

    products[SKU] = {
      sku: SKU,
      names,
      price: Price,
      tax,
      size,
    };
  });

  console.log("4");

  const countries = CMSData.data.countries.data.map(
      ({ attributes: { name } }) => name
    ),
    kindnessCauses = CMSData.data.kindnessCauses.data.map(
      ({ attributes: { cause } }) => cause
    );

  const shippingMethods = {};

  CMSData.data.shippingMethods.data.forEach(
    ({ attributes: { method, cost } }) => {
      shippingMethods[method] = cost;
    }
  );

  console.log("5");
  const companyName = recurringElement.attributes.Company_name;

  // validate data

  paymentData.tax = +paymentData.tax;
  paymentData.price = +paymentData.price;
  paymentData.shipping_cost = +paymentData.shipping_cost;
  paymentData.cart = JSON.parse(paymentData.cart);

  const BasePaymentIntentSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    city: z.string(),
    street: z.string(),
    postal_code: z.string().regex(/^[\w- ]+$/),
    product_name: z.literal(companyName),
    locale: z.enum(locales),
    origin_url: z.string().url(),
    success_url: z.string().url(),
  });
  console.log("6");

  const CrowdfundingPaymentIntentSchema = BasePaymentIntentSchema.extend({
    payment_type: z.literal("crowdfunding"),
    country: z.literal("Netherlands"),
    favorite_tea: z.string(),
    perk: z.enum(Object.keys(crowdfundingPerks)),
    product_desc: z
      .string()
      .refine((value) => value === `${paymentData.perk} Plan`),
    price: z
      .number()
      .refine((value) => value === crowdfundingPerks[paymentData.perk]),
  });
  console.log("7");

  const EcommercePaymentIntentSchema = BasePaymentIntentSchema.extend({
    payment_type: z.literal("ecommerce"),
    country: z.enum(countries),
    kindness_cause: z.enum(kindnessCauses),
    shipping_method: z.enum(Object.keys(shippingMethods)),
    shipping_cost: z
      .number()
      .refine(
        (value) => value === shippingMethods[paymentData.shipping_method]
      ),
    cart: z.record(
      z.enum(Object.keys(products)),
      z
        .object({
          names: z.string(),
          sku: z.string(),
          tax: z.number(),
          price: z.number(),
          quantity: z.number().min(1).int(),
        })
        .refine(({ names, sku, tax, price, quantity }) => {
          const product = products[sku];

          return (
            names === JSON.stringify(product.names) &&
            tax === Math.round(product.tax * quantity * 100) / 100 &&
            price ===
              Math.round((product.price + product.tax) * quantity * 100) / 100
          );
        })
    ),
    product_desc: z.string().refine(
      (value) =>
        value ===
        Object.values(paymentData.cart)
          .map(
            ({ names, quantity }) =>
              `${quantity}x ${JSON.parse(names)[paymentData.locale]}`
          )
          .join(", ")
    ),
    price: z
      .number()
      .refine(
        (value) =>
          value ===
          Math.round(
            (Object.values(paymentData.cart).reduce(
              (total, { price }) => total + price,
              0
            ) +
              paymentData.shipping_cost) *
              100
          ) /
            100
      ),
    tax: z
      .number()
      .refine(
        (value) =>
          value ===
          Math.round(
            Object.values(paymentData.cart).reduce(
              (total, { tax }) => total + tax,
              0
            ) * 100
          ) /
            100
      ),
  });
  console.log("8");

  const PaymentIntentSchema = z.union([
    CrowdfundingPaymentIntentSchema.strict(),
    EcommercePaymentIntentSchema.strict(),
  ]);

  console.log("9");

  try {
    console.log("paymentData", paymentData);
    return PaymentIntentSchema.parse(paymentData);
  } catch (error) {
    console.log("errored here!");
    return {
      message: "Validation error!",
      errors: fromZodError(error).toString().slice(18).split(";"),
    };
  }
}
