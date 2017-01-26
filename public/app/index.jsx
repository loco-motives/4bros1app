import React from 'react'
import {render} from 'react-dom'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import reduxThunk from 'redux-thunk';

import AppMain from './components/app';
import Signin from './components/auth/signin';
import Signout from './components/auth/signout';
import Signup from './components/auth/signup';
import Feature from './components/feature';
import RequireAuth from './components/auth/require_auth';
import Welcome from './components/welcome';
import reducers from './reducers';
import { AUTH_USER } from './actions/types';

import MovieList from './movieList.jsx'
import QuizMovieList from './quizMovieList.jsx'
import SearchMovieList from './searchMovieList.jsx'
import MovieDescription from './movieDescription.jsx'
import { Modal } from 'react-bootstrap'
import { DropdownButton } from 'react-bootstrap'
import { MenuItem } from 'react-bootstrap'
import axios from 'axios'


const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore);
const store = createStoreWithMiddleware(reducers);

const token = localStorage.getItem('token');
// If we have a token, consider the user to be signed in
if (token) {
  // we need to update application state
  store.dispatch({ type: AUTH_USER });
}


class App extends React.Component {

  constructor (props) {
  super(props)
  this.state = {
      movies: ['movieObject1', 'movieObject2', 'movieobject3', 'moveiobject4', 'movieobjec5'],
      quizMovies: ['movieObject3', '4ma;dsfjas;', '5ds;afjds;lfakj', '6laksdjf;adslk', '324', 'the sixth item'],
      searchResult: [],
      showSearchModal: false,
      showSuggestModal: false,
      showQuizResults: false,
      showDetails: false,
      showSearchResults: false,
      detailMovie: null,
      showLanding: false
    }
  this.openSearch = this.openSearch.bind(this)
  this.closeSearch = this.closeSearch.bind(this)
  this.openSuggest = this.openSuggest.bind(this)
  this.closeSuggest = this.closeSuggest.bind(this)
  this.submitQuiz = this.submitQuiz.bind(this)
  this.homePage = this.homePage.bind(this)
  this.submitSearch = this.submitSearch.bind(this)
  this.submitShowSearch = this.submitShowSearch.bind(this)
  this.openDetails = this.openDetails.bind(this)
  this.submitGenreSearch = this.submitGenreSearch.bind(this)
}

  componentDidMount () {
    var context = this;
    axios.get('/api/getFirstFive')
    .then(result => {
      context.setState({
        movies: result.data,
        quizMovies: result.data
      })
      console.log('movie data set to', context.state.movies);
    })
    .catch(err => {
      console.log('error in component did mount in index', err)
    })
  }
  openSearch () {
    this.setState({ showSearchModal: true })
  }

  closeSearch () {
    console.log('clsoing seearch box')
    this.setState({ showSearchModal: false })
  }

  openSuggest () {
    this.setState({showSuggestModal: true})
  }

  closeSuggest () {
    this.setState({showSuggestModal: false})
  }
  showLanding() {
    this.setState({showLanding: true})
  }

  submitQuiz (event) {
    //prevent submission from reloading page
    event.preventDefault();
    var context = this;
    this.closeSuggest();
    var quizResults = []
    var genre = document.getElementById('genre').value
    var era = document.getElementById('era').value
    var sortBy = document.getElementById('sort').value
    console.log('the genre you selected is', genre, era, sort)
    //default to return everything
    var test = function() {
      return true
    }
    if (era === "Classic(1960-2000)") {
      test = function(year) {
        if(year >= 1960 && year<=2000) {
          return true
        } else return false
      }
    }
    else if(era === "Modern(Post-2000)") {
      test = function(year) {
        if(year > 2000) {
          return true
        } else return false
      }
    }
    else if(era === "New(2015-Now)") {
      test = function(year) {
        if(year >= 2015) {
          return true
        } else return false
      }
    }
    else if(era === "Old(pre-1960)") {
      test = function(year) {
        if(year < 1960) {
          return true
        } else return false
      }
    }

    var order=''
    if(sortBy === 'Awards') {
      order = function() {

      }
    }
    else if(sortBy === 'Rating') {
      order = function(a,b) {
        return b.imdb - a.imdb
      }
    }
    else if(sortBy === 'Recommended') {
      order = function() {

      }
    }
    else if(sortBy === 'Popularity') {
      order = function() {

      }
    }

    axios.get('/api/sortByGenre', {
      headers: {
        genre: genre
      }
    })
    .then(resp => {
      console.log('quiz submitted, movies that matched "' + genre + '" are :' + resp.data.map( (movie) => movie.title))
      for(let i = 0; i<resp.data.length; i++) {
        if(test(resp.data[i].year)){
          quizResults.push(resp.data[i])
        }
      }
      quizResults.sort(order)
      context.setState({
        showQuizResults: true,
        quizMovies: [quizResults[0],quizResults[1],quizResults[2],quizResults[3],quizResults[4]]
      })
    })
    .catch(error => {
      console.log('error in fetching quiz results', error)
    })

 
  }

  homePage () {
    this.setState({
      showQuizResults: false,
      showSearchResults: false,
      showDetails: false
    })
  }

  openDetails (movie) {
    var context = this;
    this.setState({
      showSearchResults: false,
      showDetails: true,
      showSearchResults: false,
      showQuizResults: false,
      detailMovie: movie
    })
    // axios.get('api/movies/')
    // .then(result => {
    //   context.setState({
    //     movies: result.data,
    //   })
    //   console.log('movie details data set to', context.state.movies);
    // })
    // .catch(err => {
    //   console.log('error in component did mount in index', err)
    // })
  }

  submitSearch (event) {
    var context = this
    event.preventDefault()
    this.closeSearch()
    var query = ""
    query = document.getElementById('movieTitle').value
    axios.get('/api/searchByMovieTitle', {
      headers: {
        query: query
      }
    })
    .then(resp => {
      // let searchArr =[];
      // searchArr.push(resp.data);
      context.setState({searchResult: resp.data,
        showSearchResults: true 
      })
    })
  }

  submitShowSearch (event) {
    var context = this
    event.preventDefault()
    this.closeSearch()
    var query = ""
    query = document.getElementById('showTitle').value
    axios.get('/api/searchByShowTitle', {
      headers: {
        query: query
      }
    })
    .then(resp => {
      // let searchArr =[];
      // searchArr.push(resp.data);
      context.setState({searchResult: resp.data,
        showSearchResults: true 
      })
    })
  }

  submitGenreSearch (event) {
    var context = this
    event.preventDefault()
    this.closeSearch()
    var genre = ""
    genre = document.getElementById('genre').value
    axios.get('/api/searchByGenre', {
      headers: {
        genre: genre
      }
    })
    .then(resp => {
      // let searchArr =[];
      // searchArr.push(resp.data);
      context.setState({searchResult: resp.data,
        showSearchResults: true 
      })
    })
  }

  render () {

    return (
      <div>
      <button onClick={() => {
      this.openSearch()
    }}>
        Search
        </button>

      <Modal show={this.state.showSearchModal} onHide={this.closeSearch}>
          <Modal.Header closeButton>
            <Modal.Title>Find a film!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
           <label>
            Movie Title:
            <input type='text' id='movieTitle' />
          </label>
           <button onClick={this.submitSearch}>Search!</button>
         </form>
         <form>
           <label>
            TV Show Title:
            <input type='text' id='showTitle' />
          </label>
           <button onClick={this.submitShowSearch}>Search!</button>
         </form>
         <p>
                 <label>
                 Choose Genre
                  <select id ="genre">
                    <option>Action</option>
                    <option>Comedy</option>
                    <option>Drama</option>
                    <option>Romance</option>
                    <option>Horro</option>
                  </select>
                </label>
                 <button onClick={this.submitGenreSearch}>Search!</button>
                </p>
          </Modal.Body>
        </Modal>

      <button onClick={() => {
          this.openSuggest()
        }}>
        Pick a Flick
        </button>

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
                  <select id ="genre">
                    <option>Action</option>
                    <option>Comedy</option>
                    <option>Drama</option>
                    <option>Romance</option>
                    <option>Indifferent</option>
                  </select>
                </label>
                </p>

                <p>
                <label>
                  What era?
                  <select id="era">
                    <option>Classic(1960-2000)</option>
                    <option>Modern(Post-2000)</option>
                    <option>New(2015-Now)</option>
                    <option>Old(pre-1960)</option>
                    <option>Indifferent</option>
                  </select>
                </label>
                </p>

                <p>
                <label>
                  How should we sort this (sort not yet implemented)
                  <select id="sort">
                    <option>Awards</option>
                    <option>Rating</option>
                    <option>Recommended</option>
                    <option>Popularity</option>
                    <option>Indifferent</option>
                  </select>
                </label>
                </p>
                <input type="submit" value="Submit" />
              </form>
          </Modal.Body>
        </Modal>

      <button onClick={() => {
          this.homePage()
        }}>
        Home
        </button>
        <button onClick={() => {
          this.showDetails()
        }}>
        landing
        </button>

      {this.state.showQuizResults ?
          <QuizMovieList
            movies ={this.state.quizMovies}
            openDetails = {this.openDetails}
          /> :
          this.state.showSearchResults ?
            <SearchMovieList
              movies={this.state.searchResult}
               openDetails = {this.openDetails}
            />
            :
          this.state.showDetails ?
            <MovieDescription 
              movie={this.state.detailMovie}
            />
          :
          <MovieList
            movies= {this.state.movies}
            openDetails = {this.openDetails}
      		/>
        }
      </div>
    )
  }
}

//render(<App />, document.getElementById('app'))

// ReactDOM.
render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={AppMain}>
        <IndexRoute component={Welcome} />
        <Route path="signin" component={Signin} />
        <Route path="signout" component={Signout} />
        <Route path="signup" component={Signup} />
        <Route path="feature" component={RequireAuth(App)} />
      </Route>
    </Router>
  </Provider>
  , document.getElementById('app'));
