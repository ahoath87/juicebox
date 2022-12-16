// grab our client with destructuring from the export in index.js
const {
  client,
  createUser,
  getAllUsers,
  getUserById,
  getAllPosts,
  updatePost,
  updateUser,
  createPost,
  // createTags,
} = require("./index");

//this function should call a query which drops all tables from our database
async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    // have to make sure to drop in correct order
    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("starting to build tables...");
    await client.query(
      `CREATE TABLE users(
        id SERIAL PRIMARY KEY, 
        username varchar(255) UNIQUE NOT NULL, 
        password varchar(255) NOT NULL,
       name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL, 
      active BOOLEAN DEFAULT true
    );`
    );
    await client.query(
      `CREATE TABLE posts(
          id SERIAL PRIMARY KEY,
          "authorId" INTEGER REFERENCES users(id) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true       
              );`
    );
    await client.query(
      `CREATE TABLE tags(
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL
        );`
    );
    await client.query(
      `CREATE TABLE post_tags(
          "postId" INTEGER REFERENCES posts(id) UNIQUE NOT NULL,
          "tagId" INTEGER REFERENCES tags(id) UNIQUE NOT NULL
        );`
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
    await createUser({
      username: "albert",
      password: "bertie99",
      name: "bert",
      location: "paris",
    });
    await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "sandy",
      location: "santa marta",
    });
    await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Jena",
      location: "miami",
    });

    console.log("finished creating users!");
  } catch (error) {
    console.error("error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    console.log("starting to create post");
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "first post",
      content: "this is m first post. I love blogs and stuff.",
    });
    await createPost({
      authorId: sandra.id,
      title: "My only post",
      content: "this is m first post. I love blogs and stuff.",
    });
    await createPost({
      authorId: glamgal.id,
      title: "the only best post",
      content: "this is m first post. I love blogs and stuff.",
    });
    console.log("finished creating posts");
  } catch (error) {
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
  } catch (error) {
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content",
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.log("Error during testDB");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end);
