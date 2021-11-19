var express = require('express');
var router = express.Router();
const fs = require('fs')
require("dotenv").config()

/* GET home page. */
router.get('/', function (req, res, next) {
  const instagramBuffer = fs.readFileSync('./data/instagram.json')
  const instagramJson = JSON.parse(instagramBuffer.toString())

  const twitterBuffer = fs.readFileSync('./data/twitter.json')
  const twitterJson = JSON.parse(twitterBuffer.toString())

  res.render('index', {
    instagram: instagramJson.data,
    twitter: twitterJson.data
  })
});

router.get('/admin', function (req, res, next) {
  const instagramBuffer = fs.readFileSync('./data/instagram.json')
  const instagramJson = JSON.parse(instagramBuffer.toString())
  
  const twitterBuffer = fs.readFileSync('./data/twitter.json')
  const twitterJson = JSON.parse(twitterBuffer.toString())

  res.render('admin', {
    instagram: instagramJson.data,
    twitter: twitterJson.data
  })
});

router.post('/admin/delete/instagram', function (req, res, next) {
  const code = req.body.shortCode || null;
  if (req.body.password !== process.env.PATEXUM_PASSWORD) {
    res.json({
      status: "password"
    })
    return
  } 

  if (!code) {
    res.json({
      status: "more_args"
    })
    return
  } 

  const instagramBuffer = fs.readFileSync('./data/instagram.json')
  const instagramJson = JSON.parse(instagramBuffer.toString())
  const newJson = instagramJson.data.filter(e => {
    if (e.shortcode !== code) {
      return true
    }
  })
  const totalData = {
    ids: instagramJson.ids,
    data: newJson
}
  fs.writeFileSync('./data/instagram.json', JSON.stringify(totalData))
  res.json({
    status: "deleted"
  })
});

router.post('/admin/delete/twitter', function (req, res, next) {
  const code = req.body.url || null;
  if (req.body.password !== process.env.PATEXUM_PASSWORD) {
    res.json({
      status: "password"
    })
    return
  } 

  if (!code) {
    res.json({
      status: "more_args"
    })
    return
  } 

  const twitterBuffer = fs.readFileSync('./data/twitter.json')
  const twitterJson = JSON.parse(twitterBuffer.toString())
  const newJson = twitterJson.data.filter(e => {
    if (e.url !== code) {
      return true
    }
  })
  const totalData = {
    urls: twitterJson.urls,
    data: newJson
}
  fs.writeFileSync('./data/twitter.json', JSON.stringify(totalData))
  res.json({
    status: "deleted"
  })
});

router.get('/v1/patexum/hello', function (req, res, next) {
  if (req.query.password == process.env.PATEXUM_PASSWORD) {
    const instagramBuffer = fs.readFileSync('./data/instagram.json')
    const instagramJson = JSON.parse(instagramBuffer.toString())
    
    const twitterBuffer = fs.readFileSync('./data/twitter.json')
    const twitterJson = JSON.parse(twitterBuffer.toString())

    res.send({
      check: "true",
      data: {
        instagram: instagramJson,
        twitter: twitterJson
      }
    })
  } else {
    res.send({
      check: "false"
    })
  }
});

router.get('/v1/uc_think', function (req, res, next) {
  const instagramBuffer = fs.readFileSync('./data/instagram.json')
  const instagramJson = JSON.parse(instagramBuffer.toString())

  const twitterBuffer = fs.readFileSync('./data/twitter.json')
  const twitterJson = JSON.parse(twitterBuffer.toString())

  res.json({
    instagram: instagramJson,
    twitter: twitterJson
  })
});

module.exports = router;
