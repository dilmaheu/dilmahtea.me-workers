import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function getProductDetails(SKU, env) {
  const query = `
    {      
      products(filters: { SKU: { eq: "${SKU}" } }) {
        data {
          attributes {
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

  const response = await fetch(env.CMS_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CMS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  }).then((response) => response.json());

  const [productData] = response.data.products.data,
    productDetails = {
      Category: productData.attributes.category.data.attributes.Title,
      "Sub-category":
        productData.attributes.sub_category.data?.attributes.Title,
    };

  return productDetails;
}

async function handlePOST(request, env) {
  const { event, originURL, props } = await request.json();

  const productDetails = await getProductDetails(props.SKU, env);

  switch (event) {
    case "add_to_cart":
      const responseHeaders = new Headers(request.headers);

      responseHeaders.set("Content-Type", "application/json");

      return await fetch("https://plausible.io/api/event", {
        method: "POST",
        headers: responseHeaders,
        body: JSON.stringify({
          name: "Add to Cart",
          url: originURL,
          domain: "dilmahtea.me",
          props: {
            ...props,
            ...productDetails,
          },
        }),
      })
        .then(async (res) => reply(await res.text(), res.ok ? 200 : res.status))
        .catch((error) => reply(error.message, 500));

    default:
      return reply(JSON.stringify({ error: `Invalid event` }), 400);
  }
}

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
