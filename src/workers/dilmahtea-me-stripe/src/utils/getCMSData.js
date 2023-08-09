const query = `
  {
    crowdfundingPlans {
      data {
        attributes {
          Perk
          Price_EUR_excl_VAT
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
          Stock_amount
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

    countries {
      data {
        attributes {
          name
          code
        }
      }
    }

    kindnessCauses {
      data {
        attributes {
          cause
        }
      }
    }

    shippingMethods {
      data {
        attributes {
          method
          cost
        }
      }
    }

    paymentMethods {
      data {
        attributes {
          method
          supported_countries {
            data {
              attributes {
                name
              }
            }
          }
        }
      }
    }
  }
`;

export default async function getCMSData(env) {
  // process data for validation
  const { data: CMSData } = await fetch(env.CMS_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CMS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  }).then((response) => response.json());

  return CMSData;
}
