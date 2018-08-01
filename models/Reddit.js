var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CommentsSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});
var RedditSchema = new Schema({
  subreddit: { 
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    unique: true
  },
  link: {
    type: String,
    required: true
  },
  comments: [CommentsSchema]
  
});

var Reddit = mongoose.model("Reddit", RedditSchema);

module.exports = Reddit;
