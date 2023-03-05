import { marked } from "marked";

const query = `
  {
    products {
      data {
        attributes {
          locale
          Title
          SKU
          Price
          Weight_tea
          Weight_tea_unit
          Intro_blob {
            data {
              attributes {
                formats
              }
            }
          }
          localizations(filters: { publishedAt: { ne: null } }) {
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

  const products = Object.fromEntries(
    response.data.products.data.map(({ attributes }) => {
      const { SKU: sku, Price } = attributes;

      const tax = Math.round(Price * 9) / 100,
        price = Price + tax,
        size = attributes.Weight_tea + attributes.Weight_tea_unit,
        image = attributes.Intro_blob.data.attributes.formats.thumbnail.url;

      const names = JSON.stringify(
        Object.fromEntries(
          [
            { attributes },
            ...attributes.localizations.data,
          ].map(({ attributes: { locale, Title } }) => [
            locale.substring(0, 2),
            Title,
          ])
        )
      );

      return [sku, { sku, tax, price, size, image, names }];
    })
  );

  await PRODUCTS.put("index", JSON.stringify(products));

  return reply(JSON.stringify({ message: `'PRODUCTS' KV Updated` }), 200);
}
