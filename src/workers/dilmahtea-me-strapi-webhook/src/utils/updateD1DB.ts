import pluralize from "pluralize";
import { parse, print } from "graphql";

import env from "../env";

import GraphQLQueries from "../GraphQLQueries.json";

export default async function updateD1DB(
  model: string,
): Promise<undefined | boolean> {
  model = model.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  if (!GraphQLQueries[model]) {
    model = pluralize(model);

    if (!GraphQLQueries[model]) return;
  }

  // array format is used to add shared fragments easily in the future
  const queries = [GraphQLQueries[model]];

  const parsedQueries = [],
    parsedFragments = [];

  queries.forEach((query) => {
    const graphqlDocument = parse(query);

    graphqlDocument.definitions.forEach((definition) => {
      if (definition.kind === "OperationDefinition") {
        parsedQueries.push(
          print(definition).slice(parsedQueries.length === 0 ? 0 : 1, -1),
        );
      } else if (definition.kind === "FragmentDefinition") {
        parsedFragments.push(print(definition));
      }
    });
  });

  parsedQueries[parsedQueries.length - 1] += "}";

  const fullQuery =
    parsedQueries.join("") + "\n\n" + parsedFragments.join("\n\n");

  const response = await fetch(env.STRAPI_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.STRAPI_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: fullQuery }),
  }).then((res) => res.json<any>());

  const data = response.data[model];

  await env.USERS.prepare("UPDATE strapi SET data = ? WHERE model = ?")
    .bind(JSON.stringify(data), model)
    .run();

  console.log("Updated 'strapi' table in database");

  return true;
}
