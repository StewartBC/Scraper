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
mongoose.connect("mongodb://localhost/scraper");

app.get("/scrapes/:subreddit", function (req, res) {
  const subreddit = req.params.subreddit;
  const results = [];
  request(`https://old.reddit.com/r/${subreddit}`, function (error, response, html) {
    const C = cheerio.load(html);
    console.log(C);
    C("p.title").each(function (i, element) {
      let link = "";
      if (C(element).children().attr("href").startsWith("/r/")) {
        link = `https://old.reddit.com${C(element).children().attr("href")}`;
      } else {
        link = C(element).children().attr("href");
      }
      console.log(link);
      const title = C(element).text();
      console.log(title);
      const elementObject = {
        subreddit: subreddit,
        title: title,
        link: link
      }
      results.push(elementObject);
    })
    Reddit.find({}).then(function (reddits) {
      const titles = [];
      reddits.forEach(function (reddit) {
        titles.push(reddit.title);
      });
      for (let i = 0; i < results.length; i++) {
        if (titles.indexOf(results[i].title) > 0) {
          results.splice(i, 1);
        }
      }
    });
  }).then(function () {
    results.forEach(function (article) {
      Reddit.create(article).then(function () {
        Reddit.find({ subreddit: subreddit }).then(function (dbReddits) {
          res.json(dbReddits);
        });
      });
    });
  });
});

app.post("/scrapes", function (req, res) {
  console.log(req.body);
  Reddit.findOneAndUpdate({ title: req.body.title }, { $push: { comments: req.body } });
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});