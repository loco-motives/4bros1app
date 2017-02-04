let request = require('request-promise')
let Promise = require('bluebird')

// require db models
let Movie = require('../models/Movie.js')

let utils = {}

utils.addToDb = gbOptions => {
  return new Promise(function (resolve, reject) {
    request(gbOptions)
      .then(function (resp) {
        var movieObj = {
          title: resp.title.toLowerCase(),
          description: resp.overview.toLowerCase(),
          poster: resp.poster_400x570,
          thumbnail: resp.poster_120x171,
          mpaa: resp.rating,
          runtime: resp.duration / 60,
          year: resp.release_year,
          guideboxId: resp.id,
          imdbId: resp.imdb
        }
        if (resp.trailers.web.length > 0) {
          movieObj.trailer = resp.trailers.web[0].embed
        }
        movieObj.alternativeTitles = []
        for (let title of resp.alternate_titles) {
          movieObj.alternativeTitles.push(title.toLowerCase())
        }
        movieObj.directors = []
        for (let director of resp.directors) {
          movieObj.directors.push(director.name.toLowerCase())
        }

        movieObj.actors = []
        for (let actor of resp.cast) {
          movieObj.actors.push(actor.name.toLowerCase())
        }

        movieObj.genres = []
        for (let genre of resp.genres) {
          movieObj.genres.push(genre.title.toLowerCase())
        }

        for (let sub of resp.tv_everywhere_web_sources) {
          if (sub.source === 'hbo') {
            movieObj.hbo = true
          }
        }
        for (let sub of resp.subscription_web_sources) {
          if (sub.source === 'netflix') {
            movieObj.netflix = true
            movieObj.netflixLink = sub.link
          } else if (sub.source === 'amazon_prime') {
            movieObj.amazon = true
            movieObj.amazonLink = sub.link
          } else if (sub.source === 'hulu_plus') {
            movieObj.hulu = true
            movieObj.huluLink = sub.link
          }
        }

        for (let sub of resp.purchase_web_sources) {
          if (sub.source === 'itunes') {
            movieObj.appleBuy = true
            movieObj.appleBuyLink = sub.link
            if (sub.formats.length > 0) {
              movieObj.appleBuyPrice = sub.formats[0].price
            }
          }
          if (sub.source === 'amazon_buy') {
            console.log('amazon price details = ', sub)
            movieObj.amazonBuy = true
            movieObj.amazonBuyLink = sub.link
            if (sub.formats.length > 0) {
              movieObj.amazonBuyPrice = sub.formats[0].price
            }
          }
        }

        movieObj.keywords = []
        for (let keyword of resp.tags) {
          movieObj.keywords.push(keyword.tag.toLowerCase())
        }
        gbOptions.uri = 'http://api-public.guidebox.com/v2/movies/' + movieObj.guideboxId + '/images'

        request(gbOptions)
        .then(function (resp) {
          if (resp.results.banners) {
            movieObj.banner = resp.results.banners[0].xlarge.url
          } else {
            console.log('did not add banner')
          }
          let omdb = {
            uri: 'http://www.omdbapi.com/?i=' + movieObj.imdbId + '&tomatoes=true',
            headers: {
              'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
          }
          request(omdb)
          .then(function (resp) {
            movieObj.rottenTomatoes = parseInt(resp.tomatoMeter, 10)
            movieObj.imdb = parseFloat(resp.imdbRating)
            movieObj.metaCritic = parseInt(resp.Metascore, 10)
            if (resp.tomatoMeter === 'N/A') {
              movieObj.rottenTomatoes = null
            }
            if (resp.Metascore === 'N/A') {
              movieObj.metaCritic = null
            }
            if (resp.imdbRating === 'N/A') {
              movieObj.imdb = null
            }
            console.log(movieObj)
            Movie.create(movieObj)
            .then(function (resp) {
              if (resp) {
                resolve(resp)
              }
            })
        .catch(error => {
          console.log('error in adding to db = ', error)
        })
          })
        })
      })
  })
}

utils.addShowToDb = gbOptions => {
  return new Promise(function (resolve, reject) {
    request(gbOptions)
      .then(function (resp) {
        var movieObj = {
          title: resp.title.toLowerCase(),
          description: resp.overview,
          mpaa: resp.rating,
          runtime: resp.duration,
          guideboxId: resp.id,
          imdbId: resp.imdb_id,
          type: 'show'
        }
        movieObj.actors = []
        for (let actor of resp.cast) {
          movieObj.actors.push(actor.name)
        }

        movieObj.genres = []
        for (let genre of resp.genres) {
          movieObj.genres.push(genre.title)
        }

        movieObj.keywords = []
        for (let keyword of resp.tags) {
          movieObj.keywords.push(keyword.tag)
        }
        gbOptions.uri = 'http://api-public.guidebox.com/v2/shows/' + movieObj.guideboxId + '/images'

        request(gbOptions)
        .then(function (resp) {
          // add in thumbnail image
          if (resp.results.banners) {
            movieObj.banner = resp.results.banners[0].xlarge.url
          } else {
            console.log('did not add banner')
          }
          if (resp.results.posters) {
            movieObj.thumbnail = resp.results.posters[0].small.url
            movieObj.poster = resp.results.posters[0].large.url
          } else {
            console.log('did not add thumbnail')
          }
          let omdb = {
            uri: 'http://www.omdbapi.com/?i=' + movieObj.imdbId + '&tomatoes=true',
            headers: {
              'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
          }
          request(omdb)
          .then(function (resp) {
            movieObj.rottenTomatoes = parseInt(resp.tomatoMeter, 10)
            movieObj.imdb = parseFloat(resp.imdbRating, 10)
            movieObj.metaCritic = parseInt(resp.Metascore, 10)
            movieObj.directors = []
            movieObj.directors.push(resp.Writer)
            if (resp.tomatoMeter === 'N/A') {
              movieObj.rottenTomatoes = null
            }
            if (resp.Metascore === 'N/A') {
              movieObj.metaCritic = null
            }
            if (resp.imdbRating === 'N/A') {
              movieObj.imdb = null
            }
            Movie.create(movieObj)
            .then(function (resp) {
              if (resp) {
                resolve(resp)
              }
            })
        .catch(error => {
          console.log('error in adding to db = ', error)
        })
          })
        })
      })
  })
}

utils.addRelatedToDB = gbOptions => {
  return new Promise(function (resolve, reject) {
    let relatedArr = []
    let length = 5
    let checkForResolve = array => {
      if (array.length === 5 || array.length === length) {
        resolve(relatedArr)
      }
    }

    request(gbOptions)
    .then(resp => {
      let tempArr = resp.results
      length = tempArr.length
      tempArr = tempArr.slice(0, 5)
      tempArr.forEach(mov => {
        Movie.find({guideboxId: mov.id})
        .then(resp => {
          if (resp.length > 0) {
            relatedArr.push(resp[0])
            checkForResolve(relatedArr)
            console.log('in forEach found in db')
          } else {
            let movOptions = {
              uri: 'http://api-public.guidebox.com/v2/movies/' + mov.id,
              headers: {
                'User-Agent': 'Request-Promise',
                'Authorization': '89ac6323a98e94831ccedd1d51ca3d7ee5d75ce8'
              },
              json: true
            }
            utils.addToDb(movOptions)
            .then(resp => {
              relatedArr.push(resp)
              checkForResolve(relatedArr)
            })
            .catch(error => {
              reject(error)
            })
          }
        })
      })
    })
  })
}
module.exports = utils
