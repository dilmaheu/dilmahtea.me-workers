// @ts-check

import throwExtendedError from "../../../utils/throwExtendedError";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function getAddToCartEventProps({ SKU, Quantity }, env) {
  const query = `
    {      
      products(filters: { SKU: { eq: "${SKU}" } }) {
        data {
          attributes {
            Title
            Price

            brand {
              data {
                attributes {
                  Brand_name
                }
              }
            }

            category {
              data {
                attributes {
                  Title
                }
              }
            }

            sub_category {
              data {
                attributes {
                  Title
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(env.STRAPI_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.STRAPI_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  }).then((response) => response.json());

  const { attributes: productData } = response.data.products.data[0];

  const subTotal = productData.Price * Quantity,
    tax = subTotal * 0.09,
    Price = Math.round((subTotal + tax) * 100) / 100;

  const productDetails = {
    Title: productData.Title,
    Price,
    Brand: productData.brand.data.attributes.Brand_name,
    Category: productData.category.data.attributes.Title,
    "Sub-category": productData.sub_category.data?.attributes.Title,
  };

  return productDetails;
}

async function handlePOST(request, env) {
  const { event, originURL, props } = await request.json();

  switch (event) {
    case "add_to_cart":
      const responseHeaders = new Headers(request.headers);

      responseHeaders.set("Content-Type", "application/json");

      const eventProps = await getAddToCartEventProps(props, env);

      const response = await fetch("https://plausible.io/api/event", {
        method: "POST",
        headers: responseHeaders,
        body: JSON.stringify({
          name: "Add to Cart",
          url: originURL,
          domain: "dilmahtea.me",
          props: eventProps,
        }),
      });

      if (!response.ok) {
        await throwExtendedError({
          response,
          requestData: props,
          subject: "Plausible: Failed to register Add to Cart event",
          bodyText:
            "Failed to register Add to Cart event. Please look into the issue.",
        });
      }

      return reply("Add to Cart event registered", 200);

    default:
      return reply(JSON.stringify({ error: `Invalid event` }), 400);
  }
}

handlePOST.retry = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
