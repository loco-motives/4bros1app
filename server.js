const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const routes = require('./api/routes/routes.js')
const cors = require('cors');
const session = require('express-session');
var Router = require('react-router')
let checkMovieLinkAnswer = require('./api/controllers/searchController').checkMovieLinkAnswer;

let port = 3000
let app = express()
let http = require('http').Server(app)
let io = require('socket.io')(http)

app.use(function (req, res, next) {
  console.log(req.method, req.url)
  next()
})

app.use(session({ 
  secret: 'movief1ck',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 6000000 }
}));

app.use(express.static(path.join(__dirname + '/public')))

// app.get('*', function (request, response){
//   response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
// })




// app.use('/node_modules', express.static(__dirname + "/node_modules"));

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/api', routes)

app.get('*', function (request, response){
  //response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
  response.redirect('/');
})


io.on('connection', socket => {
  console.log('player connected')

  socket.on('disconnect', () => {
    console.log('player disconnected');
  });

  socket.on('answerSubmit', answerObj => {
    checkMovieLinkAnswer(answerObj.currentMovie, answerObj.usedMovies, answerObj.link, answerObj.userMovie)
    .then(res => {
      let responseObj = {};
      responseObj.movie = res;
      responseObj.link = answerObj.link;
      socket.emit('sendBackAnswer', responseObj);
    });
  });

  socket.on('sendMsgToServer', msg => {
    socket.broadcast.emit('sendMsgBackToClient', msg)
  })

  socket.on('sendToServerWhichUserIsTyping', user => {
    socket.broadcast.emit('sendToClientWhichUserIsTyping', user)
  })
});

//start the server
http.listen(process.env.PORT || port, () => {
  console.log('listening on port ' + port)
})

module.exports = app
