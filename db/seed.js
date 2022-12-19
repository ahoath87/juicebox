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
  getPostsByUser,
  createTags,
  createPostTag,
  addTagsToPost,
  getPostById,
  getPostsByTagName,

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
          "postId" INTEGER REFERENCES posts(id),
          "tagId" INTEGER REFERENCES tags(id),
          UNIQUE ("postId", "tagId")
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

// in db/seed.js
async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    console.log("Starting to create posts...");
    await createPost({
      authorId: albert.id,
      title: "First Post",
      content:
        "This is my first post. I hope I love writing blogs as much as I love writing them.",
      tags: ["#happy", "#youcandoanything"],
    });

    await createPost({
      authorId: sandra.id,
      title: "How does this work?",
      content: "Seriously, does this even do anything?",
      tags: ["#happy", "#worst-day-ever"],
    });

    await createPost({
      authorId: glamgal.id,
      title: "Living the Glam Life",
      content: "Do you even? I swear that half of you are posing.",
      tags: ["#happy", "#youcandoanything", "#canmandoeverything"],
    });
    console.log("Finished creating posts!");
  } catch (error) {
    console.log("Error creating posts!");
    throw error;
  }
}

// async function createInitialTags() {
//   try {
//     console.log("Starting to create tags...");

//     const [happy, sad, inspo, catman] = await createTags([
//       "#happy",
//       "#worst-day-ever",
//       "#youcandoanything",
//       "#catmandoeverything",
//     ]);

//     const [postOne, postTwo, postThree] = await getAllPosts();

//     console.log(postOne.id);

//     await addTagsToPost(postOne.id, [happy, inspo]);
//     await addTagsToPost(postTwo.id, [sad, inspo]);
//     const post = await addTagsToPost(postThree.id, [happy, catman, inspo]);
//     console.log("this is post in createinitialtags", post);
//     console.log("Finished creating tags!");
//   } catch (error) {
//     console.log("Error creating tags!");
//     throw error;
//   }
// }

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
    // await createInitialTags();
  } catch (error) {
    console.log("error during rebuilDB");
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

    console.log("Calling updatePost on posts[1], only updating tags");
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ["#youcandoanything", "#redfish", "#bluefish"],
    });
    console.log("Result:", updatePostTagsResult);

    console.log("Calling getPostsByTagName with #happy");
    const postsWithHappy = await getPostsByTagName("#happy");
    console.log("Result:", postsWithHappy);

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
