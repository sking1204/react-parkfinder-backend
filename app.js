"use strict";

/** Express app for parkfinder. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const {authenticateJWT} = require("./middleware/auth")

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const parkRoutes = require("./routes/parks")




 


const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT) // this is applied globally for all routes

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/parks", parkRoutes);



/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
