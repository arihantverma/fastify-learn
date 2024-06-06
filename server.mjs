import Fastify from "fastify";
import viewEnginePlugin from "@fastify/view";
import fastifyStaticPlugin from "@fastify/static";
import fastifyFormbodyPlugin from "@fastify/formbody";
import handlebars from "handlebars";
import path from "node:path";
import fs from "node:fs/promises";
import { readRecipes } from "./db/crud.mjs";

const __rootDirectoryPath = path.dirname(new URL(import.meta.url).pathname);

// GET THE SERVER INITILIZER BY CALLING FASTIFY, provide any valid options
const fastify = Fastify({
  logger: true,
});

const templatesDirPath = path.join(__rootDirectoryPath, "templates");

// Register the view engine
fastify.register(viewEnginePlugin, {
  engine: {
    handlebars,
  },
  root: templatesDirPath,
  layout: "./layout.hbs",
  viewExt: "hbs",
  propertyName: "render",
});

// Register the static plugin
fastify.register(fastifyStaticPlugin, {
  root: path.join(__rootDirectoryPath, "public"),
  prefix: "/assets",
});

// Register the form body plugin
fastify.register(fastifyFormbodyPlugin);

// SIMPLIFIED IMPLEMENTATION
// fastify.get("/assets/*", async (request, reply) => {
//   const filePath = path.join(__rootDirectoryPath, "public", request.params[0]);
//   const file = await fs.readFile(filePath);
//   reply.type("text/css").send(file);
// });

// ROUTES / END POINTS/ URL HANDLERS
fastify.get("/", async function homePageHandler(request, reply) {
  const { currentRecipesData } = await readRecipes({ retType: "json" });
  return reply.render("./home.hbs", { recipes: currentRecipesData });
});

fastify.post("/", async function homePagePostHandler(request, reply) {
  // STEP 1: read the incoming form data request.body
  const incomingFormDataObject = request.body;
  // STEP 2: read the db/recipes.json file
  const { currentRecipesData, currentRecipesDataFilePath } =
    await readRecipes();

  // "[]" stringified json
  const currentRecipesDataString =
    Buffer.from(currentRecipesData).toString("utf-8");

  // convert stringified json to javascript object
  const currentRecipesArray = JSON.parse(currentRecipesDataString);

  // STEP 3: merge new data with existing recipes data
  // clone the existing data
  const newRecipesArray = structuredClone(currentRecipesArray);
  // add the incoming form data
  newRecipesArray.push(incomingFormDataObject);
  // STEP 4:write the updated data to db/recipes.json
  const contentToWriteJSONString = JSON.stringify(newRecipesArray, null, 2);
  await fs.writeFile(currentRecipesDataFilePath, contentToWriteJSONString);

  // return this same response but with `recipes` array updated

  return reply.render("./home.hbs", { recipes: newRecipesArray });
});

// API ROUTES
fastify.get("/api/recipes", async function getRecipesHandler(request, reply) {
  const { currentRecipesData } = await readRecipes({ retType: "json" });
  // returns json
  return reply.send(currentRecipesData);
});

// START THE SERVER, LISTEN TO REQUESTS
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
