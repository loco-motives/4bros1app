// require dependencies
let mongoose = require('mongoose')
let request = require('request-promise')

// require db models
let Movie = require('../models/Movie.js')
let User = require('../models/User.js')

let saveMovieToUser = (req, res) => {
  User.update({email: req.body.email}, {
  	$push: {
      saved: (req.body.movie)
    }
  })
  .then(function(resp){
    res.status(200).send()
  })
  .catch(function(err){
    console.log('error is', err)
  })
}

module.exports = saveMovieToUser
