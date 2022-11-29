const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const HttpError = require("./http-error");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json (luckych8080)
app.use(bodyParser.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  return res.json({ status: "working!" });
});

app.get("/api", async (req, res, next) => {
  let url = "https://api.jdoodle.com/v1/execute";
  let config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let output;
  try {
    let code = JSON.parse(req.query.data);
    let program = {
      clientId: "8807988d7b1adca89464ac789413210f",
      clientSecret: "7a6c09cc1f3cd000dcb32d143fa6bebd37c66a30ce9f1d1fe4a88b354d41695f",
      ...code,
    };
    console.log(program);

    await axios
      .post(url, program, config)
      .then((response) => {
        output = response.data.output;
      })
      .catch((err) => {
        console.log("error in app.js axios ", err);
      });
  } catch (err) {
    console.log("Error catch in app.js ", err);
  }

  res.json({ output });
});

// error handling in unsupported route
app.use((req, res, next) => {
  const error = new HttpError("Could not found this route!", 404);
  throw error;
});

const port = process.env.PORT || 5000;

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

app.listen(port, () => {
  console.log("Running at port: ", port);
});
