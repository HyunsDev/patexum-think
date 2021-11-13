var express = require('express');
var router = express.Router();
const fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
  const instagramBuffer = fs.readFileSync('./data/instagram.json')
  const instagramJson = JSON.parse(instagramBuffer.toString())

  const twitterBuffer = fs.readFileSync('./data/twitter.json')
  const twitterJson = JSON.parse(twitterBuffer.toString())

  res.render('index', {
    instagram: instagramJson.data,
    twitter: twitterJson.data
  })
});

router.get('/v1/uc_think', function(req, res, next) {
  const instagramBuffer = fs.readFileSync('./data/instagram.json')
  const instagramJson = JSON.parse(instagramBuffer.toString())

  const twitterBuffer = fs.readFileSync('./data/twitter.json')
  const twitterJson = JSON.parse(twitterBuffer.toString())

  res.json({
    instagram: instagramJson.data,
    twitter: twitterJson.data
  })
});

module.exports = router;
