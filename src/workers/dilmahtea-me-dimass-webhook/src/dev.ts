import generateNonce from "./utils/generate-nonce";
import { getJson } from "./utils/get-json";

// const headers = new Headers({
//   "Content-Type": "application/json",
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "*",
//   "Access-Control-Allow-Methods": "OPTIONS, POST",
//   "Access-Control-Max-Age": "-1",
// });

/**
 * This is an automatically generated type based on a GET response to `STRAPI/api/products`.
 */
export interface Main {
  data: Datum[];
  meta: Meta;
}

export interface Datum {
  id: number;
  attributes: Attributes;
}

export interface Attributes {
  Title: string;
  Intro_text: string;
  Block_text: string;
  Price: number;
  Currency: Currency;
  SKU: string;
  Weight: number | null;
  Weight_unit: WeightUnit;
  Weight_tea: number;
  Weight_tea_unit: WeightUnit;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  locale: Locale;
  Price_breakdown_text: null | string;
  Transparency_text: null | string;
  Impact_text: null | string;
  GTIN_Barcode: string;
  In_stock_date: Date | null;
  Stock_out: null;
  Stock_amount: string;
  Water_temperature: WaterTemperature | null;
  Brewing_time: BrewingTime | null;
  Water_temperature_unit: WaterTemperatureUnit | null;
  Brewing_time_unit: BrewingTimeUnit | null;
}

export enum BrewingTime {
  The23 = "2-3",
  The35 = "3-5",
}

export enum BrewingTimeUnit {
  Minute = "minute",
}

export enum Currency {
  Eur = "EUR",
}

export enum WaterTemperature {
  The7080 = "70-80",
  The95100 = "95-100",
}

export enum WaterTemperatureUnit {
  Degree = "degree",
}

export enum WeightUnit {
  Gm = "gm",
}

export enum Locale {
  En = "en",
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

/**
 * I am not sure about the KV values
 */
export interface Env {
  // KV 
  CROWDFUNDING_EMAIL: any;
  "__landing-workers_sites_assets_preview": any;
  ECOMMERCE_PAYMENTS: any;
  MAILS: any;
  BASEROW_STATS: any;
  ECOMMERCE_PAYMENTS_DEV: any;
  CROWDFUNDINGS_DEV: any;
  PRODUCTS: any;
  CROWDFUNDINGS: any;
  "landing-THEE": any;
  "landing-THEE_preview": any;
  // `.env` / `.dev.vars`
  DIMASS_APIKEY: string;
  DIMASS_SIGNATURE: string;
  STRAPI_APIKEY: string;
}

export default {
  async fetch(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // const dimasHeaders = new Headers({
    //   Accept: "*/*",
    //   apikey: env.DIMASS_APIKEY,
    //   signature: env.DIMASS_SIGNATURE,
    //   nonce: generateNonce(9),
    //   timestamp: new Date().toISOString(),
    // });
    // const res = await fetch("https://uat.supportplaza.nl/papi/stock/1.0", {
    //   method: "POST",
    //   headers: dimasHeaders,
    //   body: "",
    // });
    // console.log(res);


    const strapiHeaders = new Headers({
      Accept: "*/*",
      Authorization: `Bearer ${env.STRAPI_APIKEY}`,
    });
    const strapiRes = await getJson<Main>(
      "https://cms.dilmahtea.me/api/products",
      strapiHeaders
    );
    return new Response(JSON.stringify(strapiRes, null, 2), {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  },
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log(`Hello World!`);
  },
};
