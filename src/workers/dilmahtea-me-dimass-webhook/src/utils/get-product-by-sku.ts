import { StrapiResponse } from "../types";

/**
 * The SKU of the product without the 'DIMA' specifier.
 *
 * NOTE: Dimass adds a 'DIMA ' to the SKU, strapi does not.
 */
interface ProductType {
  id: string;
  quantity: string;
}

export default async function(products: ProductType[]): Promise<void> {
  // const strapiBaseUrl = `https://cms.dilmahtea.me/api/`;
  // const strapiQuery = `products?filters[SKU][$in]=${skus}`;
  // const strapiUrl = `${strapiBaseUrl}${strapiQuery}`;
  const graphqlUrl = "https://cms.dilmahtea.me/graphql";

  const strapiResponses = await Promise.all(
    products.map(async (product) => {
      const graphqlQuery = JSON.stringify({
        query: ` mutation {
      updateProduct(
        id: ${product.id},
        data: {
          quantity: ${product.quantity}
        }
        )
      }`,
      });
      const strapiResponse = await fetch(graphqlUrl, {
        method: "PUT",
        body: JSON.stringify({ mutation: ` mutation: ` }),
      });

      return strapiResponse;
    })
  );
}
