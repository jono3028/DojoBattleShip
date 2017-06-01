var express = require('express')
var path = require('path')
var app = express()

var ship = require('./bsgame')

const PORT = 8000

app.use(express.static(path.join(__dirname, '/public')))
// app.use(express.static(path.join(__dirname, '/semantic')))

var server = app.listen(PORT, function () { console.log(`listening on port ${PORT}`) })

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  // console.log('server.js - io.sockets')
  ship.initGame(io, socket)
});
// console.log('server.js')