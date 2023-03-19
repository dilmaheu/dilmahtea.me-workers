import Validator from "@chantouchsek/validatorjs";

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

export async function getValidatedData(data, env) {
  // process data for validation
  const CMSData = await fetch(env.CMS_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CMS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  }).then((response) => response.json());

  const {
    data: {
      crowdfundingPlans: { data: crowdfundingPlans },
      recurringElement: { data: recurringElement },
      i18NLocales: { data: i18NLocales },
      products: { data: productsData },
    },
  } = CMSData;

  const crowdfundingPerks = {};

  crowdfundingPlans.forEach(({ attributes: { Perk, Price_EUR_excl_VAT } }) => {
    crowdfundingPerks[Perk] = Price_EUR_excl_VAT;
  });

  const locales = i18NLocales.map(({ attributes: { code } }) =>
    code.substring(0, 2)
  );

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

    const size = Weight_tea + Weight_tea_unit;

    products[SKU] = {
      sku: SKU,
      names,
      price: Price,
      size,
    };
  });

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

  const companyName = recurringElement.attributes.Company_name;

  const paymentTypes = ["ecommerce", "crowdfunding"];

  Validator.register(
    "cart",
    function (cart) {
      if (!cart) return false;

      cart = JSON.parse(cart);

      for (const id in cart) {
        const productData = products[id];

        if (!productData) return false;

        const { sku, names, price, size } = productData,
          tax = Math.round(price * 9) / 100,
          {
            sku: cartProductSKU,
            tax: cartProductTax,
            size: cartProductSize,
            price: cartProductPrice,
            quantity: cartProductQuantity,
          } = cart[id];

        const cartProductNames = JSON.parse(cart[id].names);

        if (cartProductQuantity <= 0 || !Number.isInteger(cartProductQuantity))
          return false;

        const taxIncludedPrice = (price + tax) * cartProductQuantity,
          totalTax = Math.round(tax * cartProductQuantity * 100) / 100;

        if (
          cartProductSKU !== sku ||
          cartProductSize !== size ||
          cartProductTax !== totalTax ||
          cartProductPrice !== taxIncludedPrice
        )
          return false;

        for (const locale in cartProductNames) {
          if (cartProductNames[locale] !== names[locale]) return false;
        }
      }

      return true;
    },
    "Invalid cart data."
  );

  // validate data
  const isCrowdfundingPayment = data.payment_type === "crowdfunding";

  data.tax &&= +data.tax;
  data.price = +data.price;
  data.shipping_cost &&= +data.shipping_cost;

  const { perk, locale, shipping_method } = data;

  let tax, total, price, product_desc, shipping_cost;

  if (isCrowdfundingPayment) {
    product_desc = `${perk} Plan`;
    total = +crowdfundingPerks[perk];
  } else {
    const cart = JSON.parse(data.cart);

    shipping_cost = +shippingMethods[shipping_method];

    product_desc = Object.values(cart)
      .map(({ names, quantity }) => `${quantity}x ${JSON.parse(names)[locale]}`)
      .join(", ");

    [tax, price] = Object.values(cart).reduce(
      ([totalTax, totalPrice], { tax, price }) => [
        totalTax + tax,
        totalPrice + price,
      ],
      [0, 0]
    );

    tax = Math.round(tax * 100) / 100;
    price = Math.round(price * 100) / 100;

    total = price + shipping_cost;
  }

  const validator = new Validator(data, {
    first_name: "required|string",
    last_name: "required|string",
    email: "required|email",
    favorite_tea: [
      "required_if:payment_type,crowdfunding",
      isCrowdfundingPayment ? "string" : { in: [] },
    ],
    country: [
      "required",
      { in: isCrowdfundingPayment ? "Netherlands" : countries },
    ],
    city: "required|string",
    street: "required|string",
    postal_code: "required|regex:/^[\\w- ]+$/",
    kindness_cause: [
      "required_if:payment_type,ecommerce",
      { in: isCrowdfundingPayment ? [] : kindnessCauses },
    ],
    shipping_method: [
      "required_if:payment_type,ecommerce",
      { in: isCrowdfundingPayment ? [] : Object.keys(shippingMethods) },
    ],
    shipping_cost: [
      "required_if:payment_type,ecommerce",
      { in: isCrowdfundingPayment ? [] : [+shippingMethods[shipping_method]] },
    ],
    perk: [
      "required_if:payment_type,crowdfunding",
      { in: isCrowdfundingPayment ? Object.keys(crowdfundingPerks) : [] },
    ],
    cart: [
      "required_if:payment_type,ecommerce",
      isCrowdfundingPayment ? { in: [] } : "cart",
    ],
    product_name: ["required", { in: [companyName] }],
    product_desc: ["required", { in: [product_desc] }],
    price: ["required", { in: [total] }],
    tax: ["required_if:payment_type,ecommerce", { in: [tax] }],
    payment_type: ["required", { in: paymentTypes }],
    locale: ["required", { in: locales }],
    origin_url: "required|url",
    success_url: "required|url",
  });

  try {
    return validator.validated();
  } catch ({ message }) {
    const errors = validator.errors.all();

    return { message, errors };
  }
}
