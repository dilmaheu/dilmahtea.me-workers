import QueryString from "qs";
import { Env, StrapiResponse, WebhookResponseData } from "./types";
import { StrapiResponseProduct, StrapiResponseProducts } from "./types/strapi";
import getProductBySku from "./utils/get-product-by-sku";
import getStockDimass from "./utils/get-stock-dimass";

type ProductsToUpdateType = {
  id?: string;
  SKU: string;
  quantity: string;
  originalSku: string;
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method === "POST") {
      const webhookData = await request.json<WebhookResponseData>();

      const dimassRes = await getStockDimass(env, webhookData.order_date);

      const productsToUpdate: ProductsToUpdateType[] = dimassRes.map((p) => ({
        id: "",
        SKU: p.SKU,
        quantity: typeof p.availableStock === "string" ? p.availableStock : "0",
        originalSku: p.code,
      }));

      // array of SKU's to query Strapi
      const skus = productsToUpdate.map((product) => product.SKU);

      // query params for Strapi REST API endpoint
      const query = QueryString.stringify({
        filters: {
          SKU: {
            $in: skus,
          },
        },
        publicationState: "preview",
      });
      const restUrl = `https://cms.dilmahtea.me/api/products?${query}`;

      // get ID's to update the stock off
      const idsFromStrapiResponse = await fetch(restUrl, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization:
            "Bearer e52e38edadb1d868ea22dfd2f43bb4c19e5a5d9af8114baf8e7581f8ca48f03c39d7a96fc4a204d31d964e3f2b0bb501bd8f825339e3630c9937862f1b7e13f5f04a184a438b03c184403d3927b2670b77883fef656a835ed0320cf2984b99c89ff6046643e08fead2a798bd9468e32e3f0d92c98e5f1f9f4a212faaa55c1662",
        },
      });
      const idsFromStrapiData: StrapiResponseProducts = await idsFromStrapiResponse.json();

      // co-locating the SKU's and id's so that we can update the quantity for the correct SKU + id
      // - the `id` necessary to update strapi
      // - the `SKU` is necessary to know what the updated quantity is
      const productIds = idsFromStrapiData.data.map((product) => ({
        id: product.id,
        SKU: product.attributes.SKU,
      }));

      // Update the products with a PUT request and return the response object
      const responses = await Promise.all(
        productIds.map(async ({ id, SKU }) => {
          return await fetch(`https://cms.dilmahtea.me/api/products/${id}`, {
            headers: {
              "content-type": "application/json",
              Authorization:
                "Bearer e52e38edadb1d868ea22dfd2f43bb4c19e5a5d9af8114baf8e7581f8ca48f03c39d7a96fc4a204d31d964e3f2b0bb501bd8f825339e3630c9937862f1b7e13f5f04a184a438b03c184403d3927b2670b77883fef656a835ed0320cf2984b99c89ff6046643e08fead2a798bd9468e32e3f0d92c98e5f1f9f4a212faaa55c1662",
            },
            method: "PUT",
            body: JSON.stringify({
              data: {
                Stock_amount: productsToUpdate.find(
                  (product) => product.SKU === SKU
                )?.quantity,
              },
            }),
          });
        })
      );

      // parse the data from the responses and return this; maybe not necessary
      const data: StrapiResponseProduct[] = await Promise.all(
        responses.map(async (response) => {
          return await response.json();
        })
      );

      // filter it so you have a summarized overview per product
      const filteredData = data.map((productResponse) => ({
        id: productResponse.data.id,
        SKU: productResponse.data.attributes.SKU,
        Stock_amount: productResponse.data.attributes.Stock_amount,
      }));

      // to test this feature working properly! SHOULD BE REMOVED!
      await env.TEST_STRAPI_UPDATES.put(new Date().toISOString(), filteredData);

      return new Response(JSON.stringify(filteredData, null, 2), {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    }

    const dimassRes = await getStockDimass(env, "2023-03-26T15:00:21+01:00");

    const productsToUpdate: ProductsToUpdateType[] = dimassRes.map((p) => ({
      id: "",
      SKU: p.SKU,
      quantity: typeof p.availableStock === "string" ? p.availableStock : "0",
      originalSku: p.code,
    }));

    const skus = productsToUpdate.map((product) => product.SKU);
    // console.log(skus);
    // console.log(productsToUpdate);
    // const smth = [
    //   {
    //     id: "119",
    //     attributes: {
    //       SKU: "80105-012-R00",
    //       Stock_amount: 0,
    //       Title: "Earl Grey | 25 Individually Wrapped Tea Bags | Gourmet",
    //       Intro_text:
    //         "Hand-picked and artisanally made in the Ratnapura region of Sri Lanka. Strong and fragrant, infused with bergamot.",
    //       Block_text: "Pure Ceylon Black tea with Bergamot flavour ",
    //     },
    //   },
    //   {
    //     id: "121",
    //     attributes: {
    //       SKU: "80274-012-R00",
    //       Stock_amount: 0,
    //       Title: "Ginger and Honey | 20 Individually Wrapped Tea Bag | Fun Tea",
    //       Intro_text:
    //         "An aromatic combination with a prominent honey note tempered with spicy ginger. Fragrant, slightly sweet and spicy. A lively tea.",
    //       Block_text:
    //         "Ceylon Black tea with Lychee flavours : Ceylon black tea with Lychee 6% flavours",
    //     },
    //   },
    //   {
    //     id: "123",
    //     attributes: {
    //       SKU: "81224-006-FS0",
    //       Stock_amount: 0,
    //       Title:
    //         "Natural Ceylon Ginger Tea | 20 Luxury Leaf Tea Bags in Tin | t-Series",
    //       Intro_text:
    //         "Ceylon was famous for centuries for the quality of her spices and her tea. This is an energetic and authentic combination of the two.The spice ‘hotness’ of Ginger partners beautifully with a Ceylon Single Region Tea grown at an elevation of 5,000 feet, to offer a deliciously different and refreshing tea. Ceylon Ginger with its prominent flavour is prized as a digestive aid and as a ‘pick me up’. The tea and spice are in authentic harmony with the fresh tea,balancing the piquancy of the Ginger to produce a reviving and enjoyable tea.",
    //       Block_text: "Pure Ceylon Black tea with Ginger flavour",
    //     },
    //   },
    //   {
    //     id: "124",
    //     attributes: {
    //       SKU: "80237-012-R00",
    //       Stock_amount: 0,
    //       Title: "Peach | 20 Individually Wrapped Tea Bags | Fun Tea",
    //       Intro_text:
    //         "Juicy, with a sweet and tangy peach flavour, a balanced and lively tea.",
    //       Block_text:
    //         "Ceylon Black tea with Peach flavour : Ceylon black tea with Peach 6% flavour",
    //     },
    //   },
    //   {
    //     id: "127",
    //     attributes: {
    //       SKU: "80086-012-R00",
    //       Stock_amount: 0,
    //       Title:
    //         "English Breakfast | 25 Individually Wrapped Tea Bags | Gourmet",
    //       Intro_text:
    //         "The Dimbula Valley consists of estates in and around Talawakelle, around 1,500 metres elevation. Tea from this region is known for the combination of strength, character and brightness, the perfect Breakfast Tea.",
    //       Block_text: "Pure Ceylon Black tea, no additives : Black tea 100%",
    //     },
    //   },
    //   {
    //     id: "130",
    //     attributes: {
    //       SKU: "80271-012-R00",
    //       Stock_amount: 0,
    //       Title: "Blackcurrant | 20 Individually Wrapped Tea Bags | Fun Tea",
    //       Intro_text:
    //         "The lightly tart, tangy and yet sweet Berry flavour of Blackcurrant beautifully combines with a Ceylon Single Region tea to offer an aromatic and pleasing tea.",
    //       Block_text:
    //         "Ceylon Black tea with Blackcurrant flavour. : Black tea with Blackcurrant Flavour 3% flavour\n\n## Summary\n\n* Stimulate yourself with this Ceylon tea grown at altitude with its refined taste of blackcurrants\n* Do your bit for the preservation of cultural heritage\n* Turn your tea into a blue mocktail that surprises you\n\n## Refined Blackcurrant Flavour\n\nYour bright and tingling black Ceylon tea comes from the provinces of Nuwara Eliya and Uva Highland. A medium strength Ceylon tea grown at altitude with the refined taste of blackcurrants. A pungent tea with a sweet aftertaste. The grade of this tea is called Broken Orange Pekoe Fannings (B.O.P.F). Sri Lankan tea leaves are qualified in 4 main grades, Leaf, Broken, Fannings and Dust, where Leaf is the category with complete leaves and Dust the most fine pieces of tea. BOPF is a tea grade that stands for Broken Orange Pekoe Fannings. Fannings are smaller particles of the Broken Orange Pekoe, and is one grade larger than dust. This tea grade therefore has a relatively large surface area that comes into contact with the water.\n\n## Tea for preservation of cultural heritage\n\nBy paying a fair price for the tea, you contribute to initiatives of the Dilmah Conservation, such as the Veddah Community Upliftment Programme.\n\nAs with many indigenous communities around the world, the Veddah community consists of traditional hunter-gatherers, but deforestation and national development have contributed greatly to the shrinkage of their traditional lands. This has led to a gradual decline in their numbers and the community is at risk of losing its ancient traditions that have been passed down from generation to generation. In keeping with Dilmah's commitment to empowering the community and supporting the environment, [Dilmah Conservation has stepped forward to help the indigenous Veddah community of Sri Lanka preserve their cultural identity.](https://www.dilmahconservation.org/initiatives/heritage/conserve-vedda-community.html)\n\n## Turn this tea into a surprising blue mocktailÂ \n\nThis mocktail recipe Blackcurrant Sapphire Milky Tea was developed during The Dilmah immunity challenge in 2021, where we challenged professionals to develop recipes with tea that boost your immunity. [This was the entire entry by Natthinee Sirapongkulpoj from Thailand](https://competitions.dilmahtea.com/immunity-inspired-by-tea-challenge/consolation-winners/shortlisted-entries.html#beverage-item-50). In this mocktail recipe, she uses an herb called Butterfly pea. For centuries, Butterfly pea tea has been used in Southeast Asia as a caffeine-free herbal drink (as well as a vegetable food and clothing dye). The Butterfly pea tea is made from the Clitoria ternatea plant / butterfly pea plant). By combining this herb with strongly brewed blackcurrant tea and adding almond milk and honey, you get a blue mocktail that surprises. Here you can find the exact recipe to make it yourself.\n\n## Tea grade\n\nBroken Orange Pekoe Fannings (B.O.P.F)\n\n## Label information\n\n* Ingredients: Black Ceylon tea with blackcurrant flavour\n* Net Weight: 40g\n* 20 individually wrapped tea bags\n* Grown and packed in Sri Lanka\n* Keep cool, dry and airtight",
    //     },
    //   },
    //   {
    //     id: "135",
    //     attributes: {
    //       SKU: "80373-012-R00",
    //       Stock_amount: 0,
    //       Title:
    //         "Green Tea Moroccan Mint | 20 Individually Wrapped Tea Bags | Green Tea Selection",
    //       Intro_text: "",
    //       Block_text:
    //         "Green tea with natural Peppermint & Spearmint leaves : Green tea with natural Peppermint 10% and Spearmint 10% leaves",
    //     },
    //   },
    //   {
    //     id: "141",
    //     attributes: {
    //       SKU: "80372-012-R00",
    //       Stock_amount: 0,
    //       Title:
    //         "Jasmine | 20 Individually Wrapped Tea Bags | Green Tea Selection",
    //       Intro_text:
    //         "A mild green tea with the traditional, natural Jasmine flavour. The perfume of Jasmine is added using petals of Jasmine, a process several thousand years old. Uplifting & aromatic.",
    //       Block_text:
    //         "Green tea with Jasmine Petals : Green tea with Jasmine Petals 1 %",
    //     },
    //   },
    //   {
    //     id: "142",
    //     attributes: {
    //       SKU: "80371-012-R00",
    //       Stock_amount: 0,
    //       Title:
    //         "Pure Green | 20 Individually Wrapped Tea Bags | Green Tea Selection",
    //       Intro_text:
    //         "Pale infusion yielding a light, slightly smoky brew. Pure green tea from China with hints of herb, a touch of spice and a pleasingly mild finish.",
    //       Block_text: "100% Pure Green tea, no additives : Green tea 100%",
    //     },
    //   },
    //   {
    //     id: "145",
    //     attributes: {
    //       SKU: "80434-012-R00",
    //       Stock_amount: 0,
    //       Title:
    //         "Peppermint | 20 Individually Wrapped Tea Bags | Herbal Infusion",
    //       Intro_text:
    //         "Invigorating, rounded with a gentleness that leaves the palate refreshed and clean. Light, with a sharp minty character and an olive green liquor.",
    //       Block_text:
    //         "Peppermint leaves, no additives. : Peppermint leaves 100%",
    //     },
    //   },
    //   {
    //     id: "146",
    //     attributes: {
    //       SKU: "80241-012-R00",
    //       Stock_amount: 0,
    //       Title: "Forest Berry | 20 Individually Wrapped Tea Bags | Fun Tea",
    //       Intro_text: "",
    //       Block_text:
    //         "Ceylon Black tea with Strawberry flavour, Hibiscus , Cinnamon bark , Sweet blackberry leaves , Natural flavourings , Blackcurrant flavour, Orange peels , Ginger root %, Cardamom , Elderberries, Lemon peels , Nutmeg, Raspberry flavour, Sunflower flowers : Ceylon black tea with Strawberry 3.8% flavour, Hibiscus 2.4%, Cinnamon bark 0.6%, Sweet blackberry leaves 0.5%, Natural flavourings 0.4%, Blackcurrant0.3% flavour, Orange peels 0.3%, Ginger root 0.2%, Cardamom 0.1%, Elderberries0.1%, Lemon peels 0.1%, Nutmeg 0.1%, Raspberry 0.05% flavour, Sunflower flowers 0.05%",
    //     },
    //   },
    //   {
    //     id: "150",
    //     attributes: {
    //       SKU: "80433-012-R00",
    //       Stock_amount: 0,
    //       Title:
    //         "Chamomile | 20 Individually Wrapped Tea Bags | Herbal Infusion",
    //       Intro_text:
    //         "Inspiringly light, delicate and golden, chamomile flowers are gentle and aromatic. The clear infusion is tinged with a fruity note to offer a sophisticated infusion.",
    //       Block_text:
    //         "Chamomile flowers, no additives. : Chamomile flowers 100%",
    //     },
    //   },
    //   {
    //     id: "166",
    //     attributes: {
    //       SKU: "80281-012-R00",
    //       Stock_amount: 0,
    //       Title: "Strawberry | 20 Individually Wrapped Tea Bags | Fun Tea",
    //       Intro_text:
    //         "The gentle sweetness of ripe strawberry with a lightly tangy note produces a mild and fragrant tea. A delightful, refine, fragrant and delicious tea.",
    //       Block_text:
    //         "Ceylon black tea with Raspberry flavour : Ceylon black tea with Strawberry 6% flavour",
    //     },
    //   },
    //   {
    //     id: "167",
    //     attributes: {
    //       SKU: "80275-012-R00",
    //       Stock_amount: 0,
    //       Title: "Lemon | 20 Individually Wrapped Tea Bag | Fun Tea",
    //       Intro_text:
    //         "A juicy lemon note with a touch of sweetness yields a mildly tangy and fragrant tea.",
    //       Block_text:
    //         "Ceylon Black tea with Lemon flavour : Ceylon black tea with Lemon 7% flavour",
    //     },
    //   },
    //   {
    //     id: "181",
    //     attributes: {
    //       SKU: "81322-006-FS0",
    //       Stock_amount: 0,
    //       Title:
    //         "The First Ceylon Souchong | 75g loose leaf tea in tin | t-Series VSRT",
    //       Intro_text:
    //         "To the Chinese Lapsang Souchong, with its distinctive, oakey flavour, was a prized tea and the penalty for divulging its secret was death. Having somehow avoided this penalty, First Ceylon Souchong is a uniquely Ceylon Souchong, offering the same strong, smoky character, but with an interesting difference. Ceylon Souchong is a Single Estate Tea produced in the Galle District, and gently panfired using Cinnamon wood. The result a prominent woodsmoke note with a touch of juiciness and sweetness in its finish.",
    //       Block_text: "Pure Ceylon Black tea, no additives : Black tea 100%",
    //     },
    //   },
    // ];
    // console.log(smth.length);
    // console.log(skus.length);
    // const skusSet = new Set(skus);
    // console.log(skusSet.size);
    // console.log(`how is this? [${skus}]`);
    // const graphqlUrl = "https://cms.dilmahtea.me/graphql";
    // const restUrl = `https://cms.dilmahtea.me/api/products?filters[SKU][$in]${skus}`;
    // const restUrl = `https://cms.dilmahtea.me/api/products?publicationState=preview`;
    // const restUrl = `https://cms.dilmahtea.me/api/products?publicationState=preview&`;
    // const idsFromStrapi = await fetch(graphqlUrl, {
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/json",
    //     Authorization:
    //       "Bearer e52e38edadb1d868ea22dfd2f43bb4c19e5a5d9af8114baf8e7581f8ca48f03c39d7a96fc4a204d31d964e3f2b0bb501bd8f825339e3630c9937862f1b7e13f5f04a184a438b03c184403d3927b2670b77883fef656a835ed0320cf2984b99c89ff6046643e08fead2a798bd9468e32e3f0d92c98e5f1f9f4a212faaa55c1662",
    //   },
    //   body: JSON.stringify(
    //     {
    //       query: ` query ($skus: Array!) {
    //       products(publicationState: PREVIEW, filters: {
    //         SKU: {
    //           in: $skus
    //         }
    //         }) {
    //         data {
    //           id
    //           attributes {
    //             SKU
    //             Stock_amount
    //           }
    //         }
    //       }
    //     }
    //   }`,
    //       variables: {
    //         skus,
    //       },
    //     },
    //     null,
    //     2
    //   ),
    // });

    // const strapieGraphQlResponse = await idsFromStrapi.json();

    // const testStrapiFetch = await getProductBySku(dimassRes);

    // return new Response(JSON.stringify(strapiGraphResponse, null, 2), {
    //   headers: {
    //     "content-type": "application/json;charset=UTF-8",
    //   },
    // });
    const query = QueryString.stringify({
      filters: {
        SKU: {
          $in: skus,
        },
      },
      publicationState: "preview",
    });
    const restUrl = `https://cms.dilmahtea.me/api/products?${query}`;

    const idsFromStrapi = await fetch(restUrl, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization:
          "Bearer e52e38edadb1d868ea22dfd2f43bb4c19e5a5d9af8114baf8e7581f8ca48f03c39d7a96fc4a204d31d964e3f2b0bb501bd8f825339e3630c9937862f1b7e13f5f04a184a438b03c184403d3927b2670b77883fef656a835ed0320cf2984b99c89ff6046643e08fead2a798bd9468e32e3f0d92c98e5f1f9f4a212faaa55c1662",
      },
    });

    const strapiRestResponse: StrapiResponseProducts = await idsFromStrapi.json();

    const productIds = strapiRestResponse.data.map((product) => ({
      id: product.id,
      SKU: product.attributes.SKU,
    }));

    // console.log(productIds);

    const responses = await Promise.all(
      productIds.map(async ({ id, SKU }) => {
        return await fetch(`https://cms.dilmahtea.me/api/products/${id}`, {
          headers: {
            "content-type": "application/json",
            Authorization:
              "Bearer e52e38edadb1d868ea22dfd2f43bb4c19e5a5d9af8114baf8e7581f8ca48f03c39d7a96fc4a204d31d964e3f2b0bb501bd8f825339e3630c9937862f1b7e13f5f04a184a438b03c184403d3927b2670b77883fef656a835ed0320cf2984b99c89ff6046643e08fead2a798bd9468e32e3f0d92c98e5f1f9f4a212faaa55c1662",
          },
          method: "PUT",
          body: JSON.stringify({
            data: {
              Stock_amount: productsToUpdate.find(
                (product) => product.SKU === SKU
              )?.quantity,
            },
          }),
        });
      })
    );

    const data = await Promise.all(
      responses.map(async (response) => {
        return await response.json();
      })
    );

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  },
};
