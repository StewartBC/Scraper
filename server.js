const cheerio = require("cheerio");
const request = require("request-promise");
const logger = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const db = require("./models");
const PORT = 3000;
const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/scraper");

app.get("/scrapes/:subreddit", function(req, res) {
  const subreddit = req.params.subreddit;
  request(`https://old.reddit.com/r/${subreddit}`, function (error, response, html) {
    const C = cheerio.load(html);
    console.log(C);
    const results = [];
    const comments = [];
    C("p.title").each(function (i, element) {
      const link = `https://old.reddit.com${C(element).children().attr("href")}`;
      console.log(link);
      const title = C(element).text();
      console.log(title);
      const elementObject = {
        name: "",
        text: ""
      }
      request(link, function (error, response, html) {
        console.log(html);
        const c = cheerio.load(html);
        c("div.md").each(function (i, element) {
          elementObject.text = element.children("p").text();
        });
        c("a.author").each(function (i, element) {
          elementObject.name = element.text();
        });
      }).then(function () {
        console.log(elementObject);
        comments.push(elementObject);
        results.push({
          subreddit: subreddit,
          title: title,
          link: link,
          topComment: comments[0]
        });
      }).then(function () {
        db.Reddit.find({}).then(function (reddits) {
          const titles = [];
          reddits.forEach(function (reddit) {
            titles.push(reddit.title);
          });
          results.forEach(function (index) {
            for (let j = 0; j < titles.length; j++) {
              if (index.title === titles[j]) {
                results.splice(j, 1);
              }
            }
          });
        });
      });
    }).then(function () {
      results.forEach(function (article) {
        db.Reddit.create(article).then(function () {
          db.Reddit.find({ subreddit: subreddit }).then(function (dbReddits) {
            res.json(dbReddits);
          });
        });
      });
    });
  });
});

app.post("/scrapes/:subreddit", function(req, res) {
  db.Reddit.update({ title: req.body.title} , { $push: { comments: userComment } });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});