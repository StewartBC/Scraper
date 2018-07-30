var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var RedditSchema = new Schema({
  subreddit: { 
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  comments: []
});

var Reddit = mongoose.model("Reddit", RedditSchema);

module.exports = Reddit;
