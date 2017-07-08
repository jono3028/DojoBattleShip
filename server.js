var express = require('express')
var path = require('path')
var app = express()

var ship = require('./bsgame')

const PORT = 8000

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/semantic')))

var server = app.listen(PORT, function () { console.log(`listening on port ${PORT}`) })

function player (name, grid, id) {
  this.name = name
  this.socketId = id
  this.grid = grid
  this.shipDamage = [5,4,3,3,2]
}

var gameBoard = {
  turn: true,
  playerA: undefined,
  playerB: undefined
}

var io = require('socket.io').listen(server);

io.on('connection', function (socket) {
  // console.log('server.js - io.sockets')
  // ship.initGame(io, socket)
  // Places a user into a socket room defined on clent side
  socket.on('Join Room', function(room) {
    // console.log('Join Room')
    socket.join(room)
    // console.log(socket.adapter.rooms)
  })

  // Remove user from socket room and place into another, both rooms defined on client side
  socket.on('Change Room', function(room){
    console.log('Change Room', socket.id)
    socket.leave(room.old)
    socket.join(room.new)
    // console.log(socket.adapter.rooms)
  })

  // Tell all other players in lobby a new player has entered
  socket.on('New Player', function(data) {
    io.emit('PlayerEntersLobby', data)
  })

  // Directly contact player when another issues a challeng request
  socket.on('Send Challenge Request', function (data) {
    // console.log('sendChallengeRequest')
    var recip = data.challengedPlayerId
    socket.to(recip).emit('Receive Challenge Request', data)
  })

  // Receiver of 'Send Challenge Response' accepts the challenge 
  socket.on('Accept Challenge', function (){
    // console.log('placePlayersInRoom')
    socket.to('Room1').emit('Goto Pregame')
    // console.log(socket.adapter.rooms)
  })

  socket.on('playerEntersRoom', function(data){
    // console.log('Player Enters Room')
    if (!gameBoard.playerA) {
      gameBoard.playerA = new player (data.userName, data.grid, data.id)
      // console.log('Player A set ', gameBoard.playerA.socketId)
    }
    else if (!gameBoard.playerB) {
      gameBoard.playerB = new player (data.userName, data.grid, data.id)
      // console.log('Player B set ', gameBoard.playerB.socketId)
      setTimeout(gamePlay,1000)
    }
    else {
      // console.log('Room Full')
      socket.emit('Game Room Message', {message: 'Room Full, Please try again later'})
    }
  })

  socket.on('shotFired', function (data) {
    // console.log('Shot Fired')
    var clientA = gameBoard.playerA.socketId
    var clientB = gameBoard.playerB.socketId

    if (gameBoard.turn) { // PlayerA's turn
      var shot = `x${data.target[0]}y${data.target[1]}`
      // console.log('A ', shot)
      socket.broadcast.to(clientB).emit('playMade', `.p${shot}`)
      gameBoard.turn = false
      socket.emit('playMade', `.f${shot}`)
      var gridVal = gameBoard.playerB.grid[data.target[1]][data.target[0]]
      if (gridVal > 0) {
        gameBoard.playerB.shipDamage[gridVal - 1] -= 1
        if (gameBoard.playerB.shipDamage[gridVal - 1] == 0){
          var sunkMessage = `You sunk ${gridVal}` 
          io.to('Room1').emit('Game Room Message', {message: sunkMessage})
        } else {
          io.to('Room1').emit('Game Room Message', {message: 'Hit'})
        }
      } else {
        io.to('Room1').emit('Game Room Message', {message: 'Miss'})
      }
      var sum = gameBoard.playerB.shipDamage.reduce((sum, val) => sum + val, 0)
      if (sum == 0) {
        socket.emit('Game Room Message', {message: 'You win!'})
        socket.broadcast.to('Room1').emit('Game Room Message', {message: 'Your Fleet has been sunk, Game Over.'})
      } else {
      // console.log(gameBoard.playerB.shipDamage)
        gamePlay()
      }
    } else { // PlayerB's turn
      var shot = `x${data.target[0]}y${data.target[1]}`
      // console.log('B ', shot)
      socket.broadcast.to(clientA).emit('playMade', `.p${shot}`)
      gameBoard.turn = true
      socket.emit('playMade', `.f${shot}`)
      var gridVal = gameBoard.playerA.grid[data.target[1]][data.target[0]]
      if (gridVal > 0) {
        gameBoard.playerA.shipDamage[gridVal - 1] -= 1
        if (gameBoard.playerA.shipDamage[gridVal - 1] == 0) {
          var sunkMessage = `You sunk ${gridVal}` 
          io.to('Room1').emit('Game Room Message', {message: sunkMessage})
        } else {
          io.to('Room1').emit('Game Room Message', {message: 'Hit'})
        }
      } else {
        io.to('Room1').emit('Game Room Message', {message: 'Miss'})
      }
      // console.log(gameBoard.playerA.shipDamage) 
      var sum = gameBoard.playerA.shipDamage.reduce((sum, val) => sum + val, 0)     
      if (sum == 0) {
        socket.emit('Game Room Message', {message: 'You win!'})
        socket.broadcast.to('Room1').emit('Game Room Message', {message: 'Your Fleet has been sunk, Game Over.'})
      } else {
      // console.log(gameBoard.playerB.shipDamage)
        gamePlay()
      }
    }
  })

  function gamePlay () {
    var clientID = (gameBoard.turn) ? gameBoard.playerA.socketId : gameBoard.playerB.socketId
    // console.log(clientID)
    socket.broadcast.emit('playersTurn', {message: 'Your shot'})
    // console.log('Game Play')
  }

});
// console.log('server.js')