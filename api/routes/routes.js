// require dependencies
const passport = require('passport');
let express = require('express');

// require controllers
let searchController = require('../controllers/searchController.js')
let detailsController = require('../controllers/detailsController')
let findFirstFive = require('../controllers/findFirstFive.js')
let sortByGenre = require('../controllers/sortByGenre.js')
let saveMovieToUser = require('../controllers/saveMovieToUser.js')
let savedMovies = require('../controllers/savedMovies.js')
let staffRecs = require('../controllers/staffRecs.js')

const AuthenticationController = require('../controllers/authentication_controller');
const passportService = require('../../services/passport');

var requireAuth = passport.authenticate('jwt', {session: false});
var requireLogin = passport.authenticate('local', {session: false});
let router = express.Router();

router
    .route('/searchByMovieTitle')
    .get(searchController.byMovieTitle)
router
    .route('/searchByActor')
    .get(searchController.byActor)
router
    .route('/searchByDirector')
    .get(searchController.byDirector)
router
    .route('/searchByShowTitle')
    .get(searchController.byShowTitle)

router
    .route('/searchByGenre')
    .get(searchController.byGenre)

router
    .route('/searchByRelated')
    .get(searchController.byRelated)
router
    .route('/searchByKeyword')
    .get(searchController.byKeyword)
    
router
    .route('/searchByMovieTitle/:id')
    .get(detailsController.movieGetOne)

router
    .route('/movies')
    .get(detailsController.moviesGetAll)
router
    .route('/movies/:id')
    .get(detailsController.movieGetOne)

router
    .route('/getFirstFive')
    .get(findFirstFive)

router
    .route('/getStaffRecs')
    .get(staffRecs)

router
    .route('/sortByGenre')
    .get(sortByGenre)

router
    .route('/saveMovieToUser')
    .post(saveMovieToUser)

router
    .route('/savedMovies')
    .get(savedMovies)

router.route('/signup', function () {
  console.log('THIS ROUTE /api/signup')
})
  .post(AuthenticationController.signup);

  
router.route('/signin', function () {
  console.log('THIS ROUTE /api/signin')
})
  .post([requireLogin, AuthenticationController.signin]);

// app.get('*', function (request, response){
//   response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
// })


router
    .route('*')
    .get(function (req,res) { res.send('hello world') } )
    
  

module.exports = router