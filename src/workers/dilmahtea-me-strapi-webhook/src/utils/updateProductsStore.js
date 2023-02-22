import { marked } from "marked";

const query = `
  {
    products(locale: "all") {
      data {
        attributes {
          locale
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
          Variant {
            data {
              attributes {
                Name
              }
            }
          }          
          Size {
            data {
              attributes {
                Size
              }
            }
          }
          Meta {
            URL_slug
          }
        }
      }
    }

    productSizes(locale: "all") {
      data {
        attributes {
          locale
          Size
        }
      }
    }

    productVariants(locale: "all") {
      data {
        attributes {
          locale
          Name
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
    const productsKey = locale.substring(0, 2),
      filteredProducts = products.filter(
        ({ attributes }) => attributes.locale === locale
      );

    productsMap.set(productsKey, filteredProducts);

    localizedProductSizes[locale].forEach(({ attributes: { Size } }) => {
      const productsKey = [locale.substring(0, 2), Size].join(" | "),
        filteredProducts = products.filter(({ attributes }) => {
          const productLocale = attributes.locale,
            productSize = attributes.Size.data?.attributes?.Size;

          return productLocale === locale && productSize === Size;
        });

      productsMap.set(productsKey, filteredProducts);
    });

    localizedProductVariants[locale].forEach((Variant) => {
      const VariantName = Variant.attributes.Name,
        productsKey = [locale.substring(0, 2), VariantName].join(" | "),
        filteredProducts = products.filter(({ attributes }) => {
          const productLocale = attributes.locale,
            productVariantName = attributes.Variant.data?.attributes?.Name;

          return productLocale === locale && productVariantName === VariantName;
        });

      productsMap.set(productsKey, filteredProducts);

      localizedProductSizes[locale].forEach(({ attributes: { Size } }) => {
        const {
          attributes: { Name: VariantName },
        } = Variant;

        const productsKey = [locale.substring(0, 2), VariantName, Size].join(
          " | "
        );

        const filteredProducts = products.filter(({ attributes }) => {
          const productLocale = attributes.locale,
            productVariantName = attributes.Variant.data?.attributes?.Name,
            productSize = attributes.Size.data?.attributes?.Size;

          return (
            productLocale === locale &&
            productVariantName === VariantName &&
            productSize === Size
          );
        });

        productsMap.set(productsKey, filteredProducts);
      });
    });
  });

  products.forEach((product) => {
    product.attributes.Intro_text_HTML = marked.parse(
      product.attributes.Intro_text
    );

    delete product.attributes.Intro_text;
    delete product.attributes.Variant;
    delete product.attributes.Size;
  });

  const productsMapEntries = [...productsMap.entries()];

  const existingProductsKeys = await PRODUCTS.list();

  await Promise.all(
    existingProductsKeys.keys.map(({ name }) => PRODUCTS.delete(name))
  );

  await Promise.all(
    productsMapEntries.map(([productsKey, filteredProducts]) =>
      PRODUCTS.put(productsKey, JSON.stringify(filteredProducts))
    )
  );

  return reply(JSON.stringify({ message: `'PRODUCTS' KV Updated` }), 200);
}
