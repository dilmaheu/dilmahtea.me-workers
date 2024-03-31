import env from "./env";

type StrapiCollections = Record<string, any>;

let strapiCollections: StrapiCollections;

export default async function D1Strapi(
  alternateENV?: typeof env,
): Promise<StrapiCollections> {
  if (!strapiCollections) {
    const { results } = await ((env || alternateENV).USERS as D1Database)
      .prepare("SELECT * FROM strapi")
      .all();

    strapiCollections = Object.fromEntries(
      results.map(({ model, data }: any) => [model, JSON.parse(data)]),
    );
  }

  return strapiCollections;
}
