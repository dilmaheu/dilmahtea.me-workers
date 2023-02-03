import Validator from '@chantouchsek/validatorjs';

const query = `
  {        
    checkoutInformation {
      data {
        attributes {
          countries
        }
      }
    }

    crowdfundingPlans {
      data {
        attributes {
          Perk
          Price_EUR_excl_VAT
        }
      }
    }

    checkoutShipping {
      data {
        attributes {
          shipping_methods
        }
      }
    }

    checkoutKindness {
      data {
        attributes {
          Kindness_Causes {
            cause
          }
        }
      }
    }

    checkoutInformation {
      data {
        attributes {
          countries
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
  }
`;

const response = await fetch(CMS_GRAPHQL_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${CMS_ACCESS_TOKEN}`,
  },
  body: JSON.stringify({ query }),
});

const {
  data: {
    checkoutInformation: { data: checkoutInformation },
    crowdfundingPlans: { data: crowdfundingPlans },
    checkoutShipping: { data: checkoutShipping },
    checkoutKindness: { data: checkoutKindness },
    recurringElement: { data: recurringElement },
    i18NLocales: { data: i18NLocales },
    products: { data: productsData },
  },
} = await response.json();

const crowdfundingPerks = {};

crowdfundingPlans.forEach(({ attributes: { Perk, Price_EUR_excl_VAT } }) => {
  crowdfundingPerks[Perk] = Price_EUR_excl_VAT;
});

const countries = checkoutInformation.attributes.countries.split('\n');

const shippingMethods = {};

checkoutShipping.attributes.shipping_methods
  .split('\n')
  .forEach(methodDetails => {
    const [method, cost] = methodDetails.split(' - ');

    shippingMethods[method] = cost;
  });

const kindnessCauses = checkoutKindness.attributes.Kindness_Causes.map(
  ({ cause }) => cause,
);

const locales = i18NLocales.map(({ attributes: { code } }) =>
  code.substring(0, 2),
);

const products = [];

productsData.forEach(({ attributes }) => {
  const { SKU, Price, Weight_tea, Weight_tea_unit, localizations } = attributes;

  const names = {};

  [{ attributes }, ...localizations.data].forEach(
    ({ attributes: { locale, Title } }) => {
      names[locale.substring(0, 2)] = Title;
    },
  );

  const size = Weight_tea + Weight_tea_unit;

  products[SKU] = {
    sku: SKU,
    names,
    price: Price,
    size,
  };
});

const companyName = recurringElement.attributes.Company_name;

const paymentTypes = ['ecommerce', 'crowdfunding'];

export function getValidatedData(data) {
  const isCrowdfundingPayment = data.payment_type === 'crowdfunding';

  Validator.register(
    'cart',
    function(cart) {
      if (isCrowdfundingPayment || !cart) return false;

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
          totalTax = tax * cartProductQuantity;

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
    'Invalid cart data.',
  );

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
      .join(', ');

    [tax, price] = Object.values(cart).reduce(
      ([totalTax, totalPrice], { tax, price }) => [
        totalTax + tax,
        totalPrice + price,
      ],
      [0, 0],
    );

    tax = Math.round(tax * 100) / 100;
    price = Math.round(price * 100) / 100;

    total = price + shipping_cost;
  }

  const validator = new Validator(data, {
    first_name: 'required|string',
    last_name: 'required|string',
    email: 'required|email',
    favorite_tea: [
      'required_if:payment_type,crowdfunding',
      isCrowdfundingPayment ? 'string' : { in: [] },
    ],
    country: [
      'required',
      { in: isCrowdfundingPayment ? 'Netherlands' : countries },
    ],
    city: 'required|string',
    street: 'required|string',
    postal_code: 'required|regex:/^[\\w- ]+$/',
    kindness_cause: [
      'required_if:payment_type,ecommerce',
      { in: isCrowdfundingPayment ? [] : kindnessCauses },
    ],
    shipping_method: [
      'required_if:payment_type,ecommerce',
      { in: isCrowdfundingPayment ? [] : Object.keys(shippingMethods) },
    ],
    shipping_cost: [
      'required_if:payment_type,ecommerce',
      { in: isCrowdfundingPayment ? [] : [+shippingMethods[shipping_method]] },
    ],
    perk: [
      'required_if:payment_type,crowdfunding',
      { in: isCrowdfundingPayment ? Object.keys(crowdfundingPerks) : [] },
    ],
    cart: 'required_if:payment_type,ecommerce|cart',
    product_name: ['required', { in: [companyName] }],
    product_desc: ['required', { in: [product_desc] }],
    price: ['required', { in: [total] }],
    tax: ['required_if:payment_type,ecommerce', { in: [tax] }],
    payment_type: ['required', { in: paymentTypes }],
    locale: ['required', { in: locales }],
    origin_url: 'required|url',
    success_url: 'required|url',
  });

  try {
    return validator.validated();
  } catch ({ message }) {
    const errors = validator.errors.all();

    return {
      message,
      errors,
    };
  }
}
