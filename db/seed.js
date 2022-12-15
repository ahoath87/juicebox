// grab our client with destructuring from the export in index.js
const { client, createUser, getAllUsers } = require("./index");

//this function should call a query which drops all tables from our database
async function dropTables() {
  try {
    console.log("starting to drop tables...");
    await client.query(`DROP TABLE IF EXISTS users;`);
    console.log("finished dropping tables!");
  } catch (error) {
    console.error("error dropping tables");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("starting to build tables...");
    await client.query(
      `CREATE TABLE users(id SERIAL PRIMARY KEY, username varchar(255) UNIQUE NOT NULL, password varchar(255) NOT NULL);`
    );
    console.log("finished building tables!");
  } catch (error) {
    console.error("error building tables");
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("starting to create user...");
    const sandra = await createUser({
      username: "sandra",
      password: "glamgal",
    });
    console.log(sandra);
    const albert = await createUser({
      username: "albert",
      password: "bertie99",
    });
    console.log(albert);

    console.log("finished creating users!");
  } catch (error) {
    console.error("error creating users!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (error) {
    console.error(error);
  }
}

async function testDB() {
  try {
    // connect the client to the database, finally
    console.log("starting to test database...");

    // queries are promises, so we can await them
    const users = await getAllUsers();
    console.log("getAllUsers", users);
    // for now, logging is a fine way to see what's up
    console.log("finish database tests!");
  } catch (error) {
    console.error("Error testing database!");
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end);
