const cheerio = require("cheerio");
const request = require("request-promise");
const logger = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const db = require("./models");
const Reddit = require("./models/Reddit.js");
const PORT = process.env.PORT || 3000;
const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


app.get("/scrapes/:subreddit", function (req, res) {
  const subreddit = req.params.subreddit;
  const results = [];
  request(`https://old.reddit.com/r/${subreddit}`, function (error, response, html) {
    const C = cheerio.load(html);
    C("p.title").each(function (i, element) {
      if (C(element).children().attr("href")) {
      console.log(C(element).children().attr("href"));
      let link = "";
      if (C(element).children().attr("href").startsWith("/r/")) {
        link = `https://old.reddit.com${C(element).children().attr("href")}`;
      } else {
        link = C(element).children().attr("href");
      }
      const title = C(element).text();
      const elementObject = {
        subreddit: subreddit,
        title: title,
        link: link
      }
      results.push(elementObject);
    }
    });
  }).then(function () {
    results.forEach(function (article, index) {
      Reddit.create(article).then(function () {
        Reddit.find({ subreddit: subreddit }).then(function (dbReddit) {
          if (index === results.length - 1) {
          res.json(dbReddit);
          }
        });
      }).catch(function (err) {
        Reddit.find({ subreddit: subreddit }).then(function (dbReddits) {
          if (index === results.length - 1) {
            res.json(dbReddits);
            }
        });
      });
    });
  });
});

app.post("/scrapes", function (req, res) {
  Reddit.findOne({ title: req.body.title }, function (err, result) {
    result.comments.push(req.body);
    result.save(function (err) {
      // if (err) return console.log(err);
      // console.log('Success!');
      res.end();
    })
  });
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});