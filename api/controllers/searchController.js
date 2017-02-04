// require dependencies
let mongoose = require('mongoose')
let request = require('request-promise')

// require db models
let Movie = require('../models/Movie.js')
let User = require('../models/User.js')

let utils = require('./utils')

var searchController = {}

searchController.checkMovieLinkAnswer = (currentMovie, usedMovies, link, userMovie) => {
  let query = link;
  let verifyHelper = (currMovie, uMovie, movieArr) => {
    console.log('in verifyHelper');
    let foundCurrMovie = false,
        foundUMovie = false;

    movieArr.some((movieObj) => {
      console.log('looking for currMovie, considering: ', movieObj.title);
      if(movieObj.title === currMovie.movie.toLowerCase()) {
        foundCurrMovie = true;
        return true;
      }
      return false;
    });

    movieArr.some((movieObj) => {
      console.log('looking for userMovie, considering:', movieObj.title);
      if(movieObj.title === uMovie.toLowerCase()) {
        console.log();
        foundUMovie = true;
        return true;
      }
      return false;
    });
      console.log('foundCurrMovie and foundUMovie:', foundCurrMovie, foundUMovie);
      return (foundCurrMovie && foundUMovie); 
  }

  let pickNewMovieHelper = (usedMovies, movieArr) => {
    console.log('in pickNewMovieHelper');
    console.log('usedMovies:', usedMovies);
    for(let i = 0; i< movieArr.length; i++) {
      console.log('pickNewMovieHelper is considering', movieArr[i].title);
      console.log('is it picked already?', usedMovies.includes(movieArr[i].title));
      if (!usedMovies.includes(movieArr[i].title)) {
        console.log('pickNewMovieHelper picked ', movieArr[i].title);
        return movieArr[i].title;
      }
    }
  }

  return Movie.find({ actors: query })
  .then(resp => {//get an array of the actor's movies if its in the db
    if (resp.length > 0) {
    //   let tempArr = resp
    //   let length = tempArr.length
    //   console.log('resp  = ', length)
    //   let randomize = respArr => {
    //     return Math.floor(Math.random() * length)
    //   }
    //   let i = 0
    //   let result = []
    //   while (i < 5) {
    //     result.push(tempArr[randomize(tempArr)])
    //     i++
    //   }
    //   console.log('resp after genre = ')
      // return result;
    for (var movie of resp) {
      console.log(movie.title)
    }
      return resp;
    } else {//if not in db, get an array of the actor's movies from the api
      let gbOptions = {
        uri: 'http://api-public.guidebox.com/v2/search?type=person&query=' + query,
        headers: {
          'User-Agent': 'Request-Promise',
          'Authorization': '89ac6323a98e94831ccedd1d51ca3d7ee5d75ce8'
        },
        json: true // Automatically parses the JSON string in the response
      }
      return request(gbOptions)
      .then(function (resp) {
        let gbOptionsID = resp.results[0].id
        gbOptions.uri = 'http://api-public.guidebox.com/v2/person/' + gbOptionsID + '/credits?role=cast&type=movie'
        return utils.addRelatedToDB(gbOptions)
        .then(resp => {
          return resp;
        })
        .catch(error => {
          console.log('verifyError while grabbing movies from api: ', error);
        })
      })
    }
  }).then(arr => {//if there are movies for that actor, return a new movie from that actor (or '')
  console.log('this many actor movies:', arr.length);
    if (arr.length === 0) return '';
    if (verifyHelper(currentMovie, userMovie, arr)) return pickNewMovieHelper(usedMovies, arr);
    return '';
  }).catch(err => {
    console.log('aw jeez: ', err);
  });
}

searchController.byMovieTitle = (req, res) => {
  let query = req.headers.query.toLowerCase()
  console.log('search query was', query);

  Movie.find({
      title: query
    })
    .then(function (resp) {
      if (resp.length > 0) {
        console.log('found in database')
        var searchResult = resp
        let genre = resp[0].genres[0]
        Movie.find({
            genres: genre
          })
          .then(function (resp) {
            let tempArr = resp
            let length = tempArr.length
            console.log('resp  = ', length)
            let randomize = respArr => {
              return Math.floor(Math.random() * length)
            }
            let i = 0
            while (i < 4) {
              searchResult.push(tempArr[randomize(tempArr)])
              i++
            }
            console.log('resp after genre = ')
            console.log('YURIY CONSOLE');
            console.log('req.session', req.session);
            res.status(200).send(searchResult)
          })
      } else {
        let gbOptions = {
          uri: 'http://api-public.guidebox.com/v2/search?type=movie&field=title&query=' + query,
          headers: {
            'User-Agent': 'Request-Promise',
            'Authorization': '89ac6323a98e94831ccedd1d51ca3d7ee5d75ce8'
          },
          json: true // Automatically parses the JSON string in the response
        }
        request(gbOptions)
          .then(function (resp) {
            let gbOptionsID = resp.results[0].id
            gbOptions.uri = 'http://api-public.guidebox.com/v2/movies/' + gbOptionsID
            utils.addToDb(gbOptions)
              .then(resp => {
                console.log('added to database = ', resp)
                var searchRes = []
                searchRes.push(resp)
                let genre = resp.genres[0]
                Movie.find({
                    genres: genre
                  })
                  .then(function (resp) {
                    let tempArr = resp
                    let length = tempArr.length
                    console.log('resp  = ', length)
                    let randomize = respArr => {
                      return Math.floor(Math.random() * length)
                    }
                    let i = 0
                    while (i < 4) {
                      searchRes.push(tempArr[randomize(tempArr)])
                      i++
                    }
                    console.log('resp after genre = ')
                    console.log('YURIY CONSOLE');
                    console.log('req.session', req.session);
                    res.status(200).send(searchRes)
                  })
              })
          })
      }
    })
    .catch(function (error) {
      console.log(error)
    })
}

searchController.byShowTitle = (req, res) => {
  console.log('is this firing?')
  let query = req.headers.query.toLowerCase()

  Movie.find({
      title: query
    })
    .then(function (resp) {
      if (resp.length > 0) {
        console.log('found in database')
        var searchResult = resp
        let genre = resp[0].genres[0]
        Movie.find({
            genres: genre
          })
          .then(function (resp) {
            let tempArr = resp
            let length = tempArr.length
            console.log('resp  = ', length)
            let randomize = respArr => {
              return Math.floor(Math.random() * length)
            }
            let i = 0
            while (i < 4) {
              searchResult.push(tempArr[randomize(tempArr)])
              i++
            }
            console.log('resp after genre = ')
            res.status(200).send(searchResult)
          })
      } else {
        let gbOptions = {
          uri: 'http://api-public.guidebox.com/v2/search?type=show&field=title&query=' + query,
          headers: {
            'User-Agent': 'Request-Promise',
            'Authorization': '89ac6323a98e94831ccedd1d51ca3d7ee5d75ce8'
          },
          json: true // Automatically parses the JSON string in the response
        }
        request(gbOptions)
          .then(function (resp) {
            let gbOptionsID = resp.results[0].id
            gbOptions.uri = 'http://api-public.guidebox.com/v2/shows/' + gbOptionsID
            utils.addShowToDb(gbOptions)
              .then(resp => {
                console.log('added to database = ', resp)
                var searchRes = []
                searchRes.push(resp)
                let genre = resp.genres[0]
                Movie.find({
                    genres: genre
                  })
                  .then(function (resp) {
                    let tempArr = resp
                    let length = tempArr.length
                    console.log('resp  = ', length)
                    let randomize = respArr => {
                      return Math.floor(Math.random() * length)
                    }
                    let i = 0
                    while (i < 4) {
                      searchRes.push(tempArr[randomize(tempArr)])
                      i++
                    }
                    console.log('resp after genre = ')
                    res.status(200).send(searchRes)
                  })
              })
          })
      }
    })
    .catch(function (error) {
      console.log(error)
    })
}

searchController.byGenre = (req, res) => {
  let query = req.headers.genre
  console.log('you asked to find movies with genre:', genre)

  Movie.find({
      genres: query
    })
    .then(function (resp) {
      let tempArr = resp
      let length = tempArr.length
      console.log('resp  = ', length)
      let randomize = respArr => {
        return Math.floor(Math.random() * length)
      }
      let i = 0
      let result = []
      while (i < 5) {
        result.push(tempArr[randomize(tempArr)])
        i++
      }
      console.log('resp after genre = ')
      res.status(200).send(result)
    })
    .catch(function (err) {
      res.status(500).send(err)
      console.log('error is', err)
    })
}

searchController.byKeyword = (req, res) => {
  let query = req.headers.keyword.toLowerCase()
  console.log('you asked to find movies with genre:', query)

  Movie.find({
      keywords: query
    })
    .then(function (resp) {
      let tempArr = resp
      let length = tempArr.length
      console.log('resp  = ', length)
      let randomize = respArr => {
        return Math.floor(Math.random() * length)
      }
      let i = 0
      let result = []
      while (i < 5) {
        result.push(tempArr[randomize(tempArr)])
        i++
      }
      console.log('resp after genre = ')
      res.status(200).send(result)
    })
    .catch(function (err) {
      res.status(500).send(err)
      console.log('error is', err)
    })
}

searchController.byRelated = (req, res) => {
  let query = req.headers.query.toLowerCase()
  Movie.find({
      title: query
    })
    .then(resp => {
      if (resp.length > 0) {
        console.log('already in database')
        let gbOptions = {
          uri: 'http://api-public.guidebox.com/v2/movies/' + resp[0].guideboxId + '/related',
          headers: {
            'User-Agent': 'Request-Promise',
            'Authorization': '89ac6323a98e94831ccedd1d51ca3d7ee5d75ce8'
          },
          json: true // Automatically parses the JSON string in the response
        }
        utils.addRelatedToDB(gbOptions)
          .then(resp => {
            res.status(200).send(resp)
          })
          .catch(error => {
            res.status(404).send(error)
          })
      } else {
        let gbOptions = {
          uri: 'http://api-public.guidebox.com/v2/search?type=movie&field=title&query=' + query,
          headers: {
            'User-Agent': 'Request-Promise',
            'Authorization': '89ac6323a98e94831ccedd1d51ca3d7ee5d75ce8'
          },
          json: true // Automatically parses the JSON string in the response
        }
        request(gbOptions)
          .then(function (resp) {
            let gbOptionsID = resp.results[0].id
            gbOptions.uri = 'http://api-public.guidebox.com/v2/movies/' + gbOptionsID
            utils.addToDb(gbOptions)
              .then(resp => {
                gbOptions = {
                  uri: 'http://api-public.guidebox.com/v2/movies/' + resp.guideboxId + '/related',
                  headers: {
                    'User-Agent': 'Request-Promise',
                    'Authorization': '89ac6323a98e94831ccedd1d51ca3d7ee5d75ce8'
                  },
                  json: true // Automatically parses the JSON string in the response
                }
                utils.addRelatedToDB(gbOptions)
                  .then(resp => {
                    res.status(200).send(resp)
                  })
                  .catch(error => {
                    res.status(404).send(error)
                  })

                // call util here
              })
          })
      }
    })
}

searchController.byActor = (req, res) => {
  let query = req.headers.actor.toLowerCase()
  Movie.find({
      actors: query
    })
    .then(resp => {
      if (resp.length > 4) {
        let tempArr = resp
        let length = tempArr.length
        console.log('resp  = ', length)
        let randomize = respArr => {
          return Math.floor(Math.random() * length)
        }
        let i = 0
        let result = []
        while (i < 5) {
          result.push(tempArr[randomize(tempArr)])
          i++
        }
        console.log('resp after genre = ')
        res.status(200).send(result)
      } else {
        let gbOptions = {
          uri: 'http://api-public.guidebox.com/v2/search?type=person&query=' + query,
          headers: {
            'User-Agent': 'Request-Promise',
            'Authorization': '89ac6323a98e94831ccedd1d51ca3d7ee5d75ce8'
          },
          json: true // Automatically parses the JSON string in the response
        }
        request(gbOptions)
          .then(function (resp) {
            let gbOptionsID = resp.results[0].id
            gbOptions.uri = 'http://api-public.guidebox.com/v2/person/' + gbOptionsID + '/credits?role=cast&type=movie'
            utils.addRelatedToDB(gbOptions)
              .then(resp => {
                res.status(200).send(resp)
              })
              .catch(error => {
                res.status(404).send(error)
              })
          })
      }
    })
}

searchController.byDirector = (req, res) => {
  let query = req.headers.director.toLowerCase()
  Movie.find({
      directors: query
    })
    .then(resp => {
      if (resp.length > 4) {
        let tempArr = resp
        let length = tempArr.length
        console.log('resp  = ', length)
        let randomize = respArr => {
          return Math.floor(Math.random() * length)
        }
        let i = 0
        let result = []
        while (i < 5) {
          result.push(tempArr[randomize(tempArr)])
          i++
        }
        console.log('resp after genre = ')
        res.status(200).send(result)
      } else {
        let gbOptions = {
          uri: 'http://api-public.guidebox.com/v2/search?type=person&query=' + query,
          headers: {
            'User-Agent': 'Request-Promise',
            'Authorization': '89ac6323a98e94831ccedd1d51ca3d7ee5d75ce8'
          },
          json: true // Automatically parses the JSON string in the response
        }
        request(gbOptions)
          .then(function (resp) {
            let gbOptionsID = resp.results[0].id
            gbOptions.uri = 'http://api-public.guidebox.com/v2/person/' + gbOptionsID + '/credits?role=crew&type=movie'
            utils.addRelatedToDB(gbOptions)
              .then(resp => {
                res.status(200).send(resp)
              })
              .catch(error => {
                res.status(404).send(error)
              })
          })
      }
    })
}

module.exports = searchController