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
    variant {
      data {
        attributes {
          Name
        }
      }
    }
    size {
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

  {
    catalog {
      data {
        attributes {
          Products {
            Title
            products {
              data {
                attributes {
                  ...productsFragment
                  localizations(filters: { variant : { Name: { ne: null } } }) {
                    data {
                      attributes {
                        ...productsFragment
                      }
                    }
                  }
                }
              }
            }
          }
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

  const catalog = response.data.catalog.data.attributes;

  const ProxyHandler = {
    get: (target, key) => {
      if (!(key in target)) {
        target[key] = [];
      }

      return target[key];
    },
  };

  const products = new Proxy({}, ProxyHandler),
    IntroTextHTMLCache = new Map();

  catalog.Products.forEach(({ Title, products: variants }) => {
    const variantsPerProduct = new Proxy({}, ProxyHandler);

    variants.data.forEach(({ attributes: { localizations, ...product } }) => {
      [
        product,
        ...localizations.data.map(({ attributes }) => attributes),
      ].forEach((product) => {
        const locale = product.locale.substring(0, 2),
          size = product.size.data.attributes.Size,
          variant = product.variant.data.attributes.Name;

        variantsPerProduct[locale].push([variant + " | " + size, product]);
        variantsPerProduct[locale + " | " + size].push([variant, product]);
        variantsPerProduct[locale + " | " + variant].push([size, product]);

        products[locale + " | " + variant + " | " + size].push(product);

        // parse Intro_text markdown
        product.Intro_text_HTML =
          IntroTextHTMLCache.get(product.Intro_text) ??
          marked(product.Intro_text);

        // delete unnecessary attributes
        delete product.size;
        delete product.variant;
        delete product.Intro_text;
      });
    });

    Object.keys(variantsPerProduct).forEach((key) => {
      products[key].push([Title, variantsPerProduct[key]]);
    });
  });

  const existingProductsKeys = await PRODUCTS.list();

  await Promise.all(
    existingProductsKeys.keys.map(({ name }) => PRODUCTS.delete(name))
  );

  await Promise.all(
    Object.entries(products).map(([productsKey, filteredProducts]) =>
      PRODUCTS.put(productsKey, JSON.stringify(filteredProducts))
    )
  );

  return reply(JSON.stringify({ message: `'PRODUCTS' KV Updated` }), 200);
}
