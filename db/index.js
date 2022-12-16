const { Client } = require("pg");

const client = new Client("postgres://localhost:5432/juicebox-dev");

// utility functions for the rest of the application
// we can call them from seed file but also the main application

async function createUser({ username, password, name, location }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `INSERT INTO users(username, password, name, location) 
      VALUES ($1, $2, $3, $4)
       ON CONFLICT (username)
      DO NOTHING RETURNING *;
      `,
      [username, password, name, location]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  console.log("these are our update fields", fields);
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(",");

  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    UPDATE users
    SET ${setString}
    WHERE id = ${id}
    RETURNING *;
    `,
      Object.values(fields)
    );
    console.log("WTF", user);
    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location FROM users;`
  );
  return rows;
}

async function createPost({ authorId, title, content }) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `INSERT INTO posts("authorId", title, content)
            VALUES ($1, $2, $3)
      RETURNING *;
            `,
      [authorId, title, content]
    );
    console.log(post);
    return post;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  console.log("these are our update fields", fields);
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(",");

  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [post],
    } = await client.query(
      `
    UPDATE posts
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );
    console.log("WFT", post);
    return post;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(`SELECT * FROM posts;`);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"= ${userId};
      `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(`
          SELECT id, password, username, name, location FROM users WHERE id = ${userId};
            `);
    delete user.password;

    if (user.length === 0) {
      return null;
    }
    user.post = await getPostsByUser(user.id);
    return user;
  } catch (error) {
    throw error;
  }
}

async function createTags(tagList) {
  if (tagList.length === 0) {
    return;
  }
  const insertValues = tagList.map((_, index) => `$${index + 1}`).join("), (");
  const selectValues = tagList.map((_, index) => `$${index + 1}`).join(", ");
  try {
    await client.query(
      `
    INSERT INTO tags(name)
    VALUES (${insertValues})
    ON CONFLICT (name) DO NOTHING RETURNING *;`,
      tagList
    );
    const {
      rows: [tag],
    } = await client.query(
      `
    SELECT * FROM tags 
    WHERE name
    IN (${selectValues});`,
      tagList
    );

    console.log("this is tags", tag);
    return tag;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  getAllPosts,
  createUser,
  updateUser,
  updatePost,
  createPost,
  getPostsByUser,
  getUserById,
  createTags,
};
