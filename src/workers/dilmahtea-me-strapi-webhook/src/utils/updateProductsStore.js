import { marked } from "marked";

const query = `
  fragment productsFragment on Product {
    locale
    createdAt
    Title
    Intro_text
    Stock_amount
    In_stock_date
    Intro_blob {
      data {
        attributes {
          url
          alternativeText
        }
      }
    }
    Meta {
      URL_slug
    }
  }

  {
    products(locale: "all") {
      data {
        id
        attributes {
          ...productsFragment
        }
      }
    }

    productSizes(locale: "all") {
      data {
        attributes {
          locale
          Size
          products(filters: { publishedAt: { ne: null } }) {
            data {
              id
              attributes {
                ...productsFragment
              }
            }
          }
        }
      }
    }

    productVariants(locale: "all") {
      data {
        attributes {
          locale
          Name
          products(filters: { publishedAt: { ne: null } }) {
            data {
              id
              attributes {
                ...productsFragment
              }
            }
          }
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
  }
`;

export async function updateProductsStore(model, reply) {
  const response = await fetch(CMS_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CMS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query,
    }),
  }).then((response) => response.json());

  const {
    data: {
      products: { data: products },
      productSizes: { data: productSizes },
      productVariants: { data: productVariants },
    },
  } = response;

  const i18NLocales = response.data.i18NLocales.data.map(
    ({ attributes: { code } }) => code
  );

  const localizedProductVariants = Object.fromEntries(
    i18NLocales.map((locale) => [
      locale,
      productVariants.filter(
        ({ attributes: { locale: productVariantLocale } }) =>
          productVariantLocale === locale
      ),
    ])
  );

  const localizedProductSizes = Object.fromEntries(
    i18NLocales.map((locale) => [
      locale,
      productSizes.filter(
        ({ attributes: { locale: productSizeLocale } }) =>
          productSizeLocale === locale
      ),
    ])
  );

  const productsMap = new Map();

  i18NLocales.forEach((locale) => {
    const shortLocale = locale.substring(0, 2),
      filteredProducts = products.filter(
        ({ attributes }) => attributes.locale === locale
      );

    productsMap.set(shortLocale, filteredProducts);

    localizedProductSizes[locale].forEach(
      ({ attributes: { Size, products } }) => {
        const productsKey = [shortLocale, Size].join(" | ");

        productsMap.set(productsKey, products.data);
      }
    );

    localizedProductVariants[locale].forEach((Variant) => {
      const VariantName = Variant.attributes.Name,
        productsKey = [shortLocale, VariantName].join(" | "),
        productsPerVariant = Variant.attributes.products.data;

      productsMap.set(productsKey, productsPerVariant);

      const productIDs = productsPerVariant.map(({ id }) => id);

      localizedProductSizes[locale].forEach(
        ({
          attributes: {
            Size,
            products: { data: productsPerSize },
          },
        }) => {
          const productsKey = [shortLocale, VariantName, Size].join(" | ");

          const filteredProducts = productsPerSize.filter(({ id }) =>
            productIDs.includes(id)
          );

          productsMap.set(productsKey, filteredProducts);
        }
      );
    });
  });

  const productsMapEntries = [...productsMap.entries()];

  const existingProductsKeys = await PRODUCTS.list();

  await Promise.all(
    existingProductsKeys.keys.map(({ name }) => PRODUCTS.delete(name))
  );

  const IntroTextHTMLCache = new Map();

  productsMapEntries.forEach(([productsKey, filteredProducts]) => {
    filteredProducts.forEach((product) => {
      if (product.attributes.Intro_text) {
        product.attributes.Intro_text_HTML =
          IntroTextHTMLCache.get(product.attributes.Intro_text) ??
          marked(product.attributes.Intro_text);
      }

      delete product.attributes.Intro_text;
    });

    filteredProducts.sort(
      (a, b) =>
        new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
    );

    return PRODUCTS.put(productsKey, JSON.stringify(filteredProducts));
  });

  await Promise.all(
    productsMapEntries.map(([productsKey, filteredProducts]) =>
      PRODUCTS.put(productsKey, JSON.stringify(filteredProducts))
    )
  );

  return reply(JSON.stringify({ message: `'PRODUCTS' KV Updated` }), 200);
}
