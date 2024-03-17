// @ts-ignore
import fs from "node:fs";

const queriesDir = "./src/queries/";

const files = fs.readdirSync(queriesDir),
  filesContent = Object.fromEntries(
    await Promise.all(
      files.map(async (file) => [
        file.slice(0, -8),
        await fs.promises.readFile(queriesDir + file, "utf8"),
      ]),
    ),
  );

fs.writeFileSync("./src/GraphQLQueries.json", JSON.stringify(filesContent));
