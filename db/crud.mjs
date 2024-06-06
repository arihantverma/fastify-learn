/**File Description: To read ds/recipes.json file */
import path from "node:path";
import fs from "node:fs/promises";

// this function export is a 'named' export
// meaning it has be imported with exactly the name `readRecipes`
// with curl braces
// a nanmed export is an export of any value or function in js
// which doesn't have a 'default' keyword after 'export'
export async function readRecipes(options) {
  const { retType = "buffer" } = options ?? {};

  // read root directory path
  const __currentDir = path.dirname(new URL(import.meta.url).pathname);

  // read the db/recipes.json file path
  const currentRecipesDataFilePath = path.join(__currentDir, "recipes.json");

  console.info({
    debug: currentRecipesDataFilePath,
  });

  // read the content of file (buffer/bindary type)
  let currentRecipesData = await fs.readFile(currentRecipesDataFilePath);

  if (retType === "json") {
    // buffer/binary -> json string
    currentRecipesData = Buffer.from(currentRecipesData).toString("utf-8");

    // json string -> json object
    currentRecipesData = JSON.parse(currentRecipesData);
  }

  return {
    currentRecipesData,
    currentRecipesDataFilePath,
  };
}
