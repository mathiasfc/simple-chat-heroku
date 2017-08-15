//	Customization

var appPort = 16558;

// Librairies

var express = require('express'), app = express();
var http = require('http')
  //, server = http.createServer(app)
  , server = app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
})
  , io = require('socket.io').listen(server);


var jade = require('jade');
//var io = require('socket.io').listen(app);
var pseudoArray = ['admin']; //block the admin username (you can disable it)

// Views Options

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });

app.use(express.static(__dirname + '/public'));

// Render and send the main page

app.get('/', function(req, res){
  res.render('home.jade');
});
//server.listen(appPort);
// app.listen(appPort);
/*app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});*/
//console.log("Server listening on port " + appPort);

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
