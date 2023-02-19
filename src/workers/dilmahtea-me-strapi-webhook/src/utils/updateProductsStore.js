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
    localizedProductVariants[locale].forEach((Variant) => {
      localizedProductSizes[locale].forEach(({ attributes: { Size } }) => {
        const {
          attributes: { Name: VariantName },
        } = Variant;

        const productKey = [locale, VariantName, Size].join(" | ");

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

        productsMap.set(productKey, JSON.stringify(filteredProducts));
      });
    });
  });

  const productsMapEntries = [...productsMap.entries()];

  await Promise.all(
    productsMapEntries.map(([productKey, productValue]) =>
      PRODUCTS.put(productKey, productValue)
    )
  );

  return reply(JSON.stringify({ message: `'PRODUCTS' KV Updated` }), 200);
}
