export type StringTuple = [string, ...string[]];

export interface ENV {
  STRIPE_SECRET_KEY: string;
  CMS_GRAPHQL_ENDPOINT: string;
  CMS_ACCESS_TOKEN: string;
  CROWDFUNDINGS: KVNamespace;
  ECOMMERCE_PAYMENTS: KVNamespace;
}

export interface CMSData {
  data: {
    crowdfundingPlans: {
      data: {
        attributes: {
          Perk: string;
          Price_EUR_excl_VAT: number;
        };
      }[];
    };

    recurringElement: {
      data: {
        attributes: {
          Company_name: string;
        };
      };
    };

    i18NLocales: {
      data: {
        attributes: {
          code: string;
        };
      }[];
    };

    products: {
      data: {
        attributes: {
          locale: string;
          SKU: string;
          Title: string;
          Price: number;
          localizations: {
            data: {
              attributes: {
                locale: string;
                Title: string;
              };
            }[];
          };
        };
      }[];
    };

    countries: {
      data: {
        attributes: {
          name: string;
        };
      }[];
    };

    kindnessCauses: {
      data: {
        attributes: {
          cause: string;
        };
      }[];
    };

    shippingMethods: {
      data: {
        attributes: {
          method: string;
          cost: number;
        };
      }[];
    };
  };
}
