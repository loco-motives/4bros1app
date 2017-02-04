import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import reduxThunk from 'redux-thunk'

import AppMain from './components/app'
import Signin from './components/auth/signin'
import Signout from './components/auth/signout'
import Signup from './components/auth/signup'
import Feature from './components/feature'
import RequireAuth from './components/auth/require_auth'
import Welcome from './components/welcome'
import reducers from './reducers'
import {AUTH_USER} from './actions/types'

import MovieList from './movieList.jsx'
import QuizMovieList from './quizMovieList.jsx'
import SearchMovieList from './searchMovieList.jsx'
import MovieDescription from './movieDescription.jsx'
import Screening from './screening.jsx'
import CountdownTimer from './timer.jsx'
import {Modal} from 'react-bootstrap'
import {DropdownButton} from 'react-bootstrap'
import {Button} from 'react-bootstrap'
import {ButtonGroup} from 'react-bootstrap'
import {Grid} from 'react-bootstrap'
import {Row} from 'react-bootstrap'
import {Col} from 'react-bootstrap'

import {MenuItem} from 'react-bootstrap'
import axios from 'axios'

const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore)
const store = createStoreWithMiddleware(reducers)

const token = localStorage.getItem('token')
// If we have a token, consider the user to be signed in
if (token) {
  // we need to update application state
  store.dispatch({type: AUTH_USER})
}

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      movies: [
        'movieObject1', 'movieObject2', 'movieobject3', 'moveiobject4', 'movieobjec5'
      ],
      staffMovies: [
        'movieObject1', 'movieObject2', 'movieobject3', 'moveiobject4', 'movieobjec5'
      ],
      quizMovies: [
        'movieObject3',
        '4ma;dsfjas;',
        '5ds;afjds;lfakj',
        '6laksdjf;adslk',
        '324',
        'the sixth item'
      ],
      searchResult: [],
      user: 'osaki.daniel@gmail.com',
      showSearchModal: false,
      showSuggestModal: false,
      showGameQuizModal: false,
      showPrivateScreeningsModal: false,
      showScreeningView: false,
      showMovieLinksModal: false,
      showQuizResults: false,
      showDetails: false,
      showSearchResults: false,
      detailMovie: null,
      showSpinner: true,
      linksAnswers: [{movie: 'Eternal Sunshine of the Spotless Mind', link: 'Mark Ruffalo', user: 'Admin'}],
      movieLinksStarters: [
        {movie: 'The Avengers', link: 'Chris Evans', user: 'Admin'},
        {movie: 'The Expendables', link: 'Sylvester Stallone', user: 'Admin'},
        {movie: 'Love Actually', link: 'Hugh Grant', user: 'Admin'},
        {movie: 'The Grand Budapest Hotel', link: 'Ralph Fiennes', user: 'Admin'},
        {movie: "Ocean's Elevent", link: 'George Clooney', user: 'Admin'}
      ],
      currentChallengeMovie: {movie: 'Eternal Sunshine of the Spotless Mind', link: 'Mark Ruffalo', user: 'Admin'},
      movieLinksUsedMovies: ['eternal sunshine of the spotless mind'],
      showTimer: false,
      movieLinksStarted: false,
      movieLinksEndMsg: '',
      timerTime: 30
    }

    this.openSearch = this.openSearch.bind(this)
    this.closeSearch = this.closeSearch.bind(this)
    this.openSuggest = this.openSuggest.bind(this)
    this.closeSuggest = this.closeSuggest.bind(this)
    this.openGameQuiz = this.openGameQuiz.bind(this)
    this.closeGameQuiz = this.closeGameQuiz.bind(this)
    this.openMovieLinks = this.openMovieLinks.bind(this)
    this.closeMovieLinks = this.closeMovieLinks.bind(this)
    this.restartMovieLinks = this.restartMovieLinks.bind(this)
    this.movieLinksEnd = this.movieLinksEnd.bind(this)
    this.handleAnswerSubmit = this.handleAnswerSubmit.bind(this)
    this.handleNewAnswer = this.handleNewAnswer.bind(this)
    this.submitQuiz = this.submitQuiz.bind(this)
    this.homePage = this.homePage.bind(this)
    this.submitSearch = this.submitSearch.bind(this)
    this.submitShowSearch = this.submitShowSearch.bind(this)
    this.openDetails = this.openDetails.bind(this)
    this.submitGenreSearch = this.submitGenreSearch.bind(this)
    this.submitRelatedSearch = this.submitRelatedSearch.bind(this)
    this.submitKeywordSearch = this.submitKeywordSearch.bind(this)
    this.submitActorSearch = this.submitActorSearch.bind(this)
    this.submitDirectorSearch = this.submitDirectorSearch.bind(this)
    this.openPrivateScreenings = this.openPrivateScreenings.bind(this)
    this.closePrivateScreenings = this.closePrivateScreenings.bind(this)
    this.enterScreening = this.enterScreening.bind(this)
  }

  handleAnswerSubmit(ev) {
    ev.preventDefault();
    this.setState({showTimer: false});

    let answerObj = {} 
    answerObj.userMovie = document.getElementById('movieAnswer').value.toLowerCase();
    answerObj.link = document.getElementById('linkAnswer').value.toLowerCase();
    answerObj.user = this.currentUser;
    answerObj.usedMovies = this.state.movieLinksUsedMovies;
    answerObj.currentMovie = this.state.currentChallengeMovie;
    this.state.movieLinksUsedMovies.push(answerObj.userMovie = document.getElementById('movieAnswer').value.toLowerCase());
    console.log('current user is: ', this.currentUser);
    console.log('answerObj is ', answerObj);
    console.log('usedMovies is', this.movieLinksUsedMovies);
    console.log('currentMovie is ', this.state.currentChallengeMovie);
    socket.emit('answerSubmit', answerObj);
    document
      .getElementById('movieAnswer')
      .value = '';
    document
      .getElementById('linkAnswer')
      .value = '';
  }

  handleNewAnswer() {
    let answers = this.state.linksAnswers;
    let usedMovies = this.state.movieLinksUsedMovies;
    socket.on('sendBackAnswer', responseObj => {
      if(responseObj.movie){
        this.state.currentChallengeMovie = responseObj.movie;
        usedMovies.push(responseObj.movie);
        responseObj.user = 'Admin';
        console.log('handleNewAnswer listener: ', responseObj);
        answers.push(responseObj);
        console.log('answers:', answers);
        console.log('responseObj is now: ', responseObj);
        this.setState({
          showTimer: true,
          timerTime: 30,
          linksAnswers: answers, 
          currentChallengeMovie: responseObj,
          movieLinksUsedMovies: usedMovies
        });
      } else {
        this.movieLinksEnd('wrong');
      }
      console.log('this.state.linksAnswers: ', this.state.linksAnswers);
    });
  }

  restartMovieLinks() {
    console.log('timerTime is now: ', this.state.timerTime);
    let randomMovie = this.state.movieLinksStarters[Math.floor(Math.random() * 4)];

    this.setState({
      movieLinksStarted: true,
      showTimer: true,
      movieLinksUsedMovies: [],
      currentChallengeMovie: randomMovie,
      linksAnswers: [randomMovie],
      movieLinksEndMsg: '',
      timerTime: 30
    });
  }

  movieLinksEnd(type) {
    if(type === 'timeout') {
      this.setState({
        movieLinksEndMsg: "time's up!",
        movieLinksStarted: false,
        showtimer: false
      });
    } else {
      this.setState({
        movieLinksEndMsg: "invalid movie / link!",
        movieLinksStarted: false,
        showTimer: false
      });
    }
  }

  openSearch() {
    this.setState({showSearchModal: true})
  }

  closeSearch() {
    console.log('clsoing seearch box')
    this.setState({showSearchModal: false})
  }

  openSuggest() {
    this.setState({showSuggestModal: true})
  }

  closeSuggest() {
    this.setState({showSuggestModal: false})
  }
  openGameQuiz() {
    this.setState({showGameQuizModal: true})
  }

  openMovieLinks() {
    this.setState({showMovieLinksModal: true})
  }
  closeGameQuiz() {
    this.setState({showGameQuizModal: false})
  }
  closeMovieLinks() {
    this.setState({
      showMovieLinksModal: false,
      linksAnswers: [],
      movieLinksEndMsg: '',
      movieLinksStarted: false,
      showTimer: false,
      movieLinksUsedMovies: []
    })
  }

  showLanding() {
    this.setState({showLanding: true})
  }

  submitQuiz(event) {
    // prevent submission from reloading page
    event.preventDefault()
    this.setState({showSpinner: true, showQuizResults: false, quizMovies: null})
    var context = this
    this.closeSuggest()
    this.closeGameQuiz()
    var quizResults = []
    var genre = document
      .getElementById('genre')
      .value
    if (genre === 'Blue') {
      genre = 'comedy'
    } else if (genre === 'Green') {
      genre = 'action'
    } else if (genre === 'Red') {
      genre = 'romance'
    } else if (genre === 'Purple') {
      genre = 'drama'
    } else if (genre === "I'm colorblind") {
      genre = 'indifferent'
    }

    var era = document
      .getElementById('era')
      .value
    var provider = document
      .getElementById('sort')
      .value
    if (provider === 'Cat') {
      provider = 'amazon'
    } else if (provider === 'Doggo') {
      provider = 'netflix'
    } else if (provider === 'Hamster') {
      provider = 'hulu'
    } else if (provider === 'Fish') {
      provider = 'hbo'
    } else if (provider === "Don't like animals") {
      provider = 'search all'
    }
    console.log('the genre you selected is', genre, era, provider)
    // default to return everything
    var test = function () {
      return true
    }
    if (era === 'Classic(1970-2000)' || era === 'Teenager') {
      test = function (year) {
        if (year >= 1970 && year <= 2000) {
          return true
        } else 
          return false
      }
    } else if (era === 'Modern(Post-2000)' || era === 'Child') {
      test = function (year) {
        if (year > 2000) {
          return true
        } else 
          return false
      }
    } else if (era === 'New(2015-Now)' || era === 'Adult') {
      test = function (year) {
        if (year >= 2015) {
          return true
        } else 
          return false
      }
    } else if (era === 'Old(pre-1970)' || era === 'Senior') {
      test = function (year) {
        if (year < 1970) {
          return true
        } else 
          return false
      }
    }
    // exampel of how to order by imdb rating if(sortBy === 'Rating') {   order =
    // function(a,b) {     return b.imdb - a.imdb   } }

    axios
      .get('/api/sortByGenre', {
      headers: {
        genre: genre
      }
    })
      .then(resp => {
        console.log('quiz submitted, movies that matched "' + genre + '" are :' + resp.data.map((movie) => movie.title))
        console.log('you want to see', provider)
        if (provider === 'search all') {
          for (var i = 0; i < resp.data.length; i++) {
            if (test(resp.data[i].year)) {
              quizResults.push(resp.data[i])
            }
          }
        } else {
          for (var i = 0; i < resp.data.length; i++) {
            if (test(resp.data[i].year) && resp.data[i][provider]) {
              quizResults.push(resp.data[i])
            }
          }
        }
        context.setState({
          showSpinner: false,
          showQuizResults: true,
          quizMovies: [quizResults[0], quizResults[1], quizResults[2], quizResults[3], quizResults[4]]
        })
      })
      .catch(error => {
        console.log('error in fetching quiz results', error)
      })
  }

  homePage() {
    this.setState({showQuizResults: false, showSearchResults: false, showDetails: false})
  }

  openDetails(movie) {
    var context = this
    this.setState({showSearchResults: false, showDetails: true, showSearchResults: false, showQuizResults: false, detailMovie: movie})
    this.saveForLater(movie)
    // axios.get('api/movies/') .then(result => {   context.setState({     movies:
    // result.data,   })   console.log('movie details data set to',
    // context.state.movies); }) .catch(err => {   console.log('error in component
    // did mount in index', err) })
  }

  saveForLater(movie) {
    axios
      .post('/api/saveMovieToUser', {
        email: localStorage.currUser+'@gmail.com',
        movie: movie
    })
      .then(resp => {
        console.log('success in saving movie to database', resp)
      })
      .catch(err => {
        console.log('error in saving movie to user', err)
      })
  }

  submitSearch(event) {
    this.setState({showSpinner: true, showSearchResults: false, searchResult: []})
    var context = this
    event.preventDefault()
    this.closeSearch()
    var query = ''
    query = document
      .getElementById('movieTitle')
      .value
    axios
      .get('/api/searchByMovieTitle', {
      headers: {
        query: query
      }
    })
      .then(resp => {
        // let searchArr =[]; searchArr.push(resp.data);
        context.setState({searchResult: resp.data, showSpinner: false, showSearchResults: true, showQuizResults: false})
      })
  }

  submitShowSearch(event) {
    this.setState({showSpinner: true, showSearchResults: false, searchResult: []})
    var context = this
    event.preventDefault()
    this.closeSearch()
    var query = ''
    query = document
      .getElementById('showTitle')
      .value
    axios
      .get('/api/searchByShowTitle', {
      headers: {
        query: query
      }
    })
      .then(resp => {
        // let searchArr =[]; searchArr.push(resp.data);
        context.setState({searchResult: resp.data, showSearchResults: true, showSpinner: false})
      })
  }

  submitGenreSearch(event) {
    this.setState({showSpinner: true, showSearchResults: false, searchResult: []})
    var context = this
    event.preventDefault()
    this.closeSearch()
    var genre = ''
    genre = document
      .getElementById('genre')
      .value
    axios
      .get('/api/searchByGenre', {
      headers: {
        genre: genre
      }
    })
      .then(resp => {
        // let searchArr =[]; searchArr.push(resp.data);
        context.setState({searchResult: resp.data, showSearchResults: true, showSpinner: false})
      })
  }

  submitRelatedSearch(event) {
    this.setState({showSpinner: true, showSearchResults: false, searchResult: []})
    var context = this
    event.preventDefault()
    this.closeSearch()
    var query = ''
    query = document
      .getElementById('related')
      .value
    axios
      .get('/api/searchByRelated', {
      headers: {
        query: query
      }
    })
      .then(resp => {
        // let searchArr =[]; searchArr.push(resp.data);
        context.setState({searchResult: resp.data, showSearchResults: true, showSpinner: false})
      })
  }

  submitKeywordSearch(event) {
    this.setState({showSpinner: true, showSearchResults: false, searchResult: []})
    var context = this
    event.preventDefault()
    this.closeSearch()
    var keyword = ''
    keyword = document
      .getElementById('keyword')
      .value
    axios
      .get('/api/searchByKeyword', {
      headers: {
        keyword: keyword
      }
    })
      .then(resp => {
        // let searchArr =[]; searchArr.push(resp.data);
        context.setState({searchResult: resp.data, showSearchResults: true, showSpinner: false})
      })
  }

  submitActorSearch(event) {
    this.setState({showSpinner: true, showSearchResults: false, searchResult: []})
    var context = this
    event.preventDefault()
    this.closeSearch()
    var actor = ''
    actor = document
      .getElementById('actor')
      .value
    axios
      .get('/api/searchByActor', {
      headers: {
        actor: actor
      }
    })
      .then(resp => {
        // let searchArr =[]; searchArr.push(resp.data);
        context.setState({searchResult: resp.data, showSearchResults: true, showSpinner: false})
      })
  }

  submitDirectorSearch(event) {
    this.setState({showSpinner: true, showSearchResults: false, searchResult: []})
    var context = this
    event.preventDefault()
    this.closeSearch()
    var director = ''
    director = document
      .getElementById('director')
      .value
    axios
      .get('/api/searchByDirector', {
      headers: {
        director: director
      }
    })
      .then(resp => {
        // let searchArr =[]; searchArr.push(resp.data);
        context.setState({searchResult: resp.data, showSearchResults: true, showSpinner: false})
      })
  }

  openPrivateScreenings(event) {
    this.setState({showPrivateScreeningsModal: true})
  }

  closePrivateScreenings(event) {
    this.setState({showPrivateScreeningsModal: false})
  }

  enterScreening(event) {
    this.setState({showPrivateScreeningsModal: false})
    this.setState({showScreeningView: true})
  }

  componentDidMount() {
    var context = this;

    this.socket = io('/');

    this.handleNewAnswer();

    this.currentUser = localStorage.currentUser;

    axios
      .get('/api/getFirstFive')
      .then(result => {
        context.setState({movies: result.data})
        console.log('movie data set to', context.state.movies)
        axios
          .get('/api/getStaffRecs')
          .then(result => {
            context.setState({staffMovies: result.data, showSpinner: false})
            console.log('movie data set to', context.state.staffMovies)
          })
          .catch(err => {
            console.log('error in component did mount in index', err)
          })
      })
      .catch(err => {
        console.log('error in component did mount in index', err)
      })
  }

  render() {
    return (
      <div>
        <div className='padding'></div>

        {this.state.showSpinner
          ? <img
              className="spin"
              src='https://68.media.tumblr.com/345127a42a4baf76158920730f808f3b/tumblr_nak5muSmwi1r2geqjo1_500.gif'/>
          : this.state.showQuizResults
            ? <QuizMovieList movies={this.state.quizMovies} openDetails={this.openDetails}/>
            : this.state.showSearchResults
              ? <SearchMovieList
                  movies={this.state.searchResult}
                  openDetails={this.openDetails}/>
              : this.state.showScreeningView
                ? <Screening/>
                : this.state.showDetails
                  ? <MovieDescription movie={this.state.detailMovie}/>
                  : <MovieList
                    staffMovies={this.state.staffMovies}
                    movies={this.state.movies}
                    openDetails={this.openDetails}
                    user={this.state.user}/>}
        <div>
          <footer
            class='content-footer'
            style={{
            backgroundColor: '#343434',
            padding: 50,
            color: 'white'
          }}>
            <Grid>
              <Row>
                <Col xs={6} md={4}>
                  <Button
                    bsStyle='default'
                    onClick={() => {
                    this.homePage()
                  }}>
                    Back
                  </Button>

                </Col>
                <Col xs={6} md={4}>

                  <Button
                    Button
                    bsStyle='default'
                    onClick={() => {
                    this.openSearch()
                  }}>
                    Search
                  </Button>

                  <Modal show={this.state.showSearchModal} onHide={this.closeSearch}>
                    <Modal.Header closeButton>
                      <Modal.Title>Find a film!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <form>
                        <label>
                          Movie Title:
                          <input type='text' id='movieTitle'/>
                        </label>
                        <button onClick={this.submitSearch}>Search!</button>
                      </form>
                      <form>
                        <label>
                          TV Show Title:
                          <input type='text' id='showTitle'/>
                        </label>
                        <button onClick={this.submitShowSearch}>Search!</button>
                      </form>
                      <form>
                        <label>
                          Keyword:
                          <input type='text' id='keyword'/>
                        </label>
                        <button onClick={this.submitKeywordSearch}>Search!</button>
                      </form>
                      <form>
                        <label>
                          Actor:
                          <input type='text' id='actor'/>
                        </label>
                        <button onClick={this.submitActorSearch}>Search!</button>
                      </form>
                      <form>
                        <label>
                          Director:
                          <input type='text' id='director'/>
                        </label>
                        <button onClick={this.submitDirectorSearch}>Search!</button>
                      </form>
                      <form>
                        <label>
                          Search Movies Related To:
                          <input type='text' id='related'/>
                        </label>
                        <button onClick={this.submitRelatedSearch}>Search!</button>
                      </form>
                      <p>
                        <label>
                          Choose Genre
                          <select id='genre'>
                            <option>action</option>
                            <option>comedy</option>
                            <option>drama</option>
                            <option>romance</option>
                            <option>horror</option>
                          </select>
                        </label>
                        <button onClick={this.submitGenreSearch}>Search!</button>
                      </p>
                    </Modal.Body>
                  </Modal>

                </Col>

                <Col xs={6} md={4}>
                  <Button
                    className="pickAFlick"
                    bsStyle='default'
                    onClick={() => {
                    this.openSuggest()
                  }}>
                    Pick a Flick
                  </Button>

                  <Modal show={this.state.showSuggestModal} onHide={this.closeSuggest}>
                    <Modal.Header closeButton>
                      <Modal.Title>Let us help you!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <p>Fill out some quiz</p>

                      <form onSubmit={this.submitQuiz}>
                        <p>
                          <label>
                            What genre do you want to watch?
                            <select id='genre'>
                              <option>action</option>
                              <option>comedy</option>
                              <option>drama</option>
                              <option>romance</option>
                              <option>indifferent</option>
                            </select>
                          </label>
                        </p>

                        <p>
                          <label>
                            What era?
                            <select id='era'>
                              <option>Classic(1970-2000)</option>
                              <option>Modern(Post-2000)</option>
                              <option>New(2015-Now)</option>
                              <option>Old(pre-1970)</option>
                              <option>Indifferent</option>
                            </select>
                          </label>
                        </p>

                        <p>
                          <label>
                            What streaming service do you use?(note: make this a radio button)
                            <select id='sort'>
                              <option>amazon</option>
                              <option>hbo</option>
                              <option>hulu</option>
                              <option>netflix</option>
                              <option>search all</option>

                            </select>
                          </label>
                        </p>
                        <input type='submit' value='Submit'/>
                      </form>
                    </Modal.Body>
                  </Modal>
                  <Button
                    className='MovieLinks'
                    bsStyle='default'
                    onClick={() => {
                    this.openMovieLinks()
                  }}>
                    Let's play a movie link game!
                  </Button>
                  <Modal show={this.state.showMovieLinksModal} onHide={this.closeMovieLinks}>
                    <Modal.Header closeButton>
                      <Modal.Title>When it's your turn, submit a Movie title, and the actor that Links it to the current movie!</Modal.Title>
                      <Modal.Body>
                      <Button bsStyle='default' onClick={ () => this.restartMovieLinks()}>Ready to play?</Button>
                        {
                          this.state.showTimer && 
                          <CountdownTimer secondsRemaining={this.state.timerTime} timerDone={this.movieLinksEnd}/>
                        }
                          {this.state.movieLinksStarted && this
                            .state
                            .linksAnswers
                            .map(answer => {
                              return <div className='chatMessage'>
                                <div>
                                  The next movie is {answer.movie}, with link {answer.link}
                                </div>
                              </div>
                            })}
                          <form onSubmit={this.handleAnswerSubmit}>
                            <label>
                              Pick a related movie!
                              <input type='text' id='movieAnswer' placeholder='related movie'/>
                              <input type='text' id='linkAnswer' placeholder='link'/>
                            </label>
                            <input type='submit' value='Submit'/>
                            <div>{this.state.movieLinksEndMsg}</div>
                          </form>
                      </Modal.Body>
                    </Modal.Header>
                  </Modal>
                  <Button
                    className="playAGame"
                    bsStyle='default'
                    onClick={() => {
                    this.openGameQuiz()
                  }}>
                    Play a game?
                  </Button>

                  <Modal show={this.state.showGameQuizModal} onHide={this.closeGameQuiz}>
                    <Modal.Header closeButton>
                      <Modal.Title>Play a game and let us choose!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                      <form onSubmit={this.submitQuiz}>
                        <p>
                          <label>
                            What's your favorite color?
                            <select id='genre'>
                              <option>Blue</option>
                              <option>Green</option>
                              <option>Red</option>
                              <option>Purple</option>
                              <option>I'm colorblind</option>
                            </select>
                          </label>
                        </p>

                        <p>
                          <label>
                            How old are you?
                            <select id='era'>
                              <option>Child</option>
                              <option>Teenager</option>
                              <option>Adult</option>
                              <option>Senior</option>
                              <option>Age is a social construct</option>
                            </select>
                          </label>
                        </p>

                        <p>
                          <label>
                            Favorite Pet?
                            <select id='sort'>
                              <option>Cat</option>
                              <option>Doggo</option>
                              <option>Hamster</option>
                              <option>Fish</option>
                              <option>Don't like animals</option>
                            </select>
                          </label>
                        </p>
                        <input type='submit' value='Submit'/>
                      </form>
                    </Modal.Body>
                  </Modal>
                  <Button
                    bsStyle='default'
                    onClick={() => {
                    this.openPrivateScreenings()
                  }}>
                    Private Screenings
                  </Button>
                  <Modal
                    show={this.state.showPrivateScreeningsModal}
                    onHide={this.closePrivateScreenings}>
                    <Modal.Header closeButton>
                      <Modal.Title>Private Screenings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <p>
                        <label>Dog Day Afternoon: Feb 4nd 1pm PST</label>
                        <button className="live-btn btn" onClick={this.enterScreening}>Live Now!</button>
                      </p>
                      <p>
                        <label>Something's Gotta Give: Feb 12th 9pm PST</label>
                      </p>
                      <p>
                        <label>Pink Floyd's The Wall: Feb 14th 10pm PST</label>
                      </p>
                      <p>
                        <label>Transformers: Feb 20th 8pm PST</label>
                      </p>
                      <p>
                        <label>They Live: March 3rd 7:30pm PST</label>
                      </p>
                    </Modal.Body>
                  </Modal>
                </Col>
              </Row>
            </Grid>
          </footer>
        </div>

      </div>
    )
  }
}

// render(<App />, document.getElementById('app')) ReactDOM.
render(
  <Provider store={store}>
  <Router history={browserHistory}>
    <Route path='/' component={AppMain}>
      <IndexRoute component={Welcome}/>
      <Route path='signin' component={Signin}/>
      <Route path='signout' component={Signout}/>
      <Route path='signup' component={Signup}/>
      <Route path='feature' component={RequireAuth(App)}/>
    </Route>
  </Router>
</Provider>, document.getElementById('app'))
