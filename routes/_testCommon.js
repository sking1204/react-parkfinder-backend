"use strict";

const db = require("../db.js");
const User = require("../models/users"); 
const { createToken } = require("../helpers/tokens"); 

async function commonBeforeAll() { 
  console.log("commonBeforeAll: Cleaning up users before all tests");
  await db.query("DELETE FROM users");
}

async function commonBeforeEach() {
  console.log("commonBeforeEach: Starting transaction and registering users");
  await db.query("BEGIN");
  
  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
}

async function commonAfterEach() {
  console.log("commonAfterEach: Rolling back transaction");
  await db.query("ROLLBACK");
  console.log("commonAfterEach: Deleting users");
  await db.query("DELETE FROM users");
}

async function commonAfterAll() {  
  console.log("commonAfterAll: Cleaning up users after all tests");
  await db.query("DELETE FROM users");
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,  
};






// "use strict";

// const db = require("../db.js");
// const User = require("../models/users"); 
// const { createToken } = require("../helpers/tokens"); 



// async function commonBeforeAll() { 

//   // noinspection SqlWithoutWhere
//   await db.query("DELETE FROM users");
// }

  

// async function commonBeforeEach() {
//   await db.query("BEGIN");
//   await User.register({
//     username: "u1",
//     firstName: "U1F",
//     lastName: "U1L",
//     email: "user1@user.com",
//     password: "password1",
//     isAdmin: false,
//   });
//   await User.register({
//     username: "u2",
//     firstName: "U2F",
//     lastName: "U2L",
//     email: "user2@user.com",
//     password: "password2",
//     isAdmin: false,
//   });
//   await User.register({
//     username: "u3",
//     firstName: "U3F",
//     lastName: "U3L",
//     email: "user3@user.com",
//     password: "password3",
//     isAdmin: false,
//   });


//   // Commit the transaction
//   await db.query("COMMIT");
// }


// async function commonAfterEach() {
//   await db.query("DELETE FROM users");
// }

// async function commonAfterAll() {  
//   await db.end();
// }

// const u1Token = createToken({ username: "u1", isAdmin: false });
// const u2Token = createToken({ username: "u2", isAdmin: false });
// const adminToken = createToken({ username: "admin", isAdmin: true });

// module.exports = {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
//   u1Token,
//   u2Token,
//   adminToken,  
// };


// "use strict";

// const db = require("../db.js");
// const User = require("../models/users"); 
// const { createToken } = require("../helpers/tokens"); 



// async function commonBeforeAll() {
//   // Start a transaction
//   await db.query("BEGIN");

//   // noinspection SqlWithoutWhere
//   await db.query("DELETE FROM users");
// }

  

// async function commonBeforeEach() {
//   // await db.query("BEGIN");
//   await User.register({
//     username: "u1",
//     firstName: "U1F",
//     lastName: "U1L",
//     email: "user1@user.com",
//     password: "password1",
//     isAdmin: false,
//   });
//   await User.register({
//     username: "u2",
//     firstName: "U2F",
//     lastName: "U2L",
//     email: "user2@user.com",
//     password: "password2",
//     isAdmin: false,
//   });
//   await User.register({
//     username: "u3",
//     firstName: "U3F",
//     lastName: "U3L",
//     email: "user3@user.com",
//     password: "password3",
//     isAdmin: false,
//   });


//   // Commit the transaction
//   await db.query("COMMIT");
// }


// async function commonAfterEach() {
//   await db.query("DELETE FROM users");
// }

// async function commonAfterAll() {  
//   await db.end();
// }

// const u1Token = createToken({ username: "u1", isAdmin: false });
// const u2Token = createToken({ username: "u2", isAdmin: false });
// const adminToken = createToken({ username: "admin", isAdmin: true });

// module.exports = {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
//   u1Token,
//   u2Token,
//   adminToken,  
// };