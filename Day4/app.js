const CosmosClient = require("@azure/cosmos").CosmosClient;
const express = require("express");
var bodyParser = require("body-parser");
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const port = 3000;

const config = require("./config");

const endpoint = config.endpoint;
const key = config.key;

const client = new CosmosClient({ endpoint, key });

const HttpStatusCodes = { NOTFOUND: 404 };

const databaseId = config.database.id;
const containerId = config.container.id;
const partitionKey = { kind: "Hash", paths: ["/Country"] };

/**
 * Create the database if it does not exist
 */
async function createDatabase() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId
  });
  // console.log(`Created database:\n${database.id}\n`);
}

/**
 * Read the database definition
 */
async function readDatabase() {
  const { resource: databaseDefinition } = await client
    .database(databaseId)
    .read();
  // console.log(`Reading database:\n${databaseDefinition.id}\n`);
}

/**
 * Create the container if it does not exist
 */

async function createContainer() {
  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists(
      { id: containerId },
      { offerThroughput: 400 }
    );
  // console.log(`Created container:\n${config.container.id}\n`);
}

/**
 * Read the container definition
 */
async function readContainer() {
  const { resource: containerDefinition } = await client
    .database(databaseId)
    .container(containerId)
    .read();
  // console.log(`Reading container:\n${containerDefinition.id}\n`);
}

/**
 * Exit the app with a prompt
 * @param {message} message - The message to display
 */
function exit(message) {
  console.log(message);
  console.log("Press any key to exit");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", process.exit.bind(process, 0));
}

// createDatabase()
//   .then(() => readDatabase())
//   .then(() => createContainer())
//   .then(() => readContainer())
//   .then(() => {
//     exit(`Completed successfully`);
//   })
//   .catch(error => {
//     exit(`Completed with error ${JSON.stringify(error)}`);
//   });

/**
 * Query the container using SQL
 */
async function queryContainer() {
  console.log(`Querying container:\n${config.container.id}`);

  // query to return all children in a family
  //   const querySpec = {
  //      query: "SELECT VALUE r.children FROM root r WHERE r.lastName = @lastName",
  //      parameters: [
  //          {
  //              name: "@lastName",
  //              value: "Andersen"
  //          }
  //      ]
  //  };

  const querySpec = {
    query: "SELECT * FROM root r"
  };

  const { resources } = await client
    .database(databaseId)
    .container(containerId)
    .items.query(querySpec, { enableCrossPartitionQuery: true })
    .fetchAll();
  let returnString = "";
  for (var queryResult of resources) {
    let resultString = JSON.stringify(queryResult.item);
    console.log(`\tQuery returned ${resultString}\n`);
    if (returnString !== "") {
      returnString = `${returnString}\n${resultString}`;
    } else {
      returnString = resultString;
    }
  }
  return returnString;
}

/**
 * Create item
 */
async function createItem(itemBody) {
  const { item } = await client
    .database(databaseId)
    .container(containerId)
    .items.upsert(itemBody);
  console.log(`Created item with id:\n${itemBody.id}\n`);
}

async function replaceItem(itemBody) {
  const { item } = await client
    .database(databaseId)
    .container(containerId)
    .item(itemBody.id)
    .replace(itemBody);
  console.log(`Updated item with id:\n${itemBody.id}\n`);
}

async function deleteItem(itemBody) {
  await client
    .database(databaseId)
    .container(containerId)
    .item(itemBody.id)
    .delete(itemBody);
  console.log(`Deleted item:\n${itemBody.id}\n`);
}

app.get("/", async (req, res) => {
  const items = await queryContainer();
  res.send(`Here's the list: ${items}`);
});

// POST method route
app.post("/", (req, res) => {
  createItem(req.body);
  res.send("POST request to the homepage");
});

// PUT method route
app.put("/", (req, res) => {
  replaceItem(req.body);
  res.send("PUT request to the homepage");
});

// DELETE method route
app.delete("/", (req, res) => {
  deleteItem(req.body);
  res.send("DELETE request to the homepage");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
