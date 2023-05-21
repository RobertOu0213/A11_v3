const express = require("express");
const app = express();
const hbs = require("express-handlebars");
const generatePassword = require("./randomPassword");
const URL = require("./models/url");
const port = 3000;

require("./config/mongoose");

app.engine("handlebars", hbs.engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

//寫法一
app.post("/", (req, res) => {
  if (!req.body.originalURL) return res.redirect("/");
  const shortURL = generatePassword();

  URL.findOne({ originalURL: req.body.originalURL })
    .then((data) => {
      if (data) return data;
      else
        return URL.create({
          shortURL,
          originalURL: req.body.originalURL,
        });
    })
    .then((result) => res.render("index", { shortURL: result.shortURL }))
    .catch((error) => console.log(error));
});

//寫法二
// app.post("/", (req, res) => {
//   if (!req.body.originalURL) return res.redirect("/");
//   const shortURL = generatePassword();

//   URL.findOne({ originalURL: req.body.originalURL })
//     .then((data) =>
//       data ? data : URL.create({ shortURL, originalURL: req.body.originalURL })
//     )
//     .then((data) =>
//       res.render("index", {
//         shortURL: data.shortURL,
//       })
//     )
//     .catch((error) => console.error(error));
// });

app.get("/:shortURL", (req, res) => {
  const { shortURL } = req.params;

  URL.findOne({ shortURL })
    .then((data) => {
      if (!data) {
        return res.render("error", {
          errorURL: req.headers.host + "/" + shortURL,
        });
      }

      res.redirect(data.originalURL);
    })
    .catch((error) => console.error(error));
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
