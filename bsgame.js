var io
var roomSocket

module.exports.initGame = (sio, socket) => {
  // console.log('server - initGame')
  io = sio
  roomSocket = socket
  roomSocket.on('connected', (socket) => {
    // roomSocket.join(socket.roomName)
    console.log('Connected')
    // console.log(roomSocket)

  })
  roomSocket.on('disconnect', (socket) => {
    console.log('Player Disconnected')
  })
  // roomSocket.on('New Player', (data) => {
  //   io.emit('PlayerEntersLobby', data)
  // })
  // roomSocket.on('Send Challenge Request', sendChallengeRequest)
  // roomSocket.on('Accept Challenge', placePlayersInRoom)
  // roomSocket.on('Join Room', joinRoom)
  // roomSocket.on('Change Room', changeRoom)
  // roomSocket.on('playerEntersRoom', playerEntersRoom)
  // roomSocket.on('makePlayerGrid', makePlayerGrid)
  // roomSocket.on('shotFired', shotFired)
  roomSocket.on('gameReset', reset)

  console.log('Player Connected')
  // console.log(roomSocket)
}

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

function reset () {
  gameBoard.turn = true
  gameBoard.playerA = undefined
  gameBoard.playerB = undefined
  console.log('Players reset')
}
function sendChallengeRequest (data) {
  console.log('sendChallengeRequest')
  var recip = data.challengedPlayerId
  roomSocket.to(recip).emit('Receive Challenge Request', data)
}
function placePlayersInRoom () {
  console.log('placePlayersInRoom')
  console.log(roomSocket.adapter.rooms)
  // console.log(roomSocket)
}
function joinRoom (room) {
  console.log('Join Room')
  roomSocket.join(room)
}
function changeRoom (room) {
  console.log('Change Room', roomSocket.id)
  roomSocket.leave(room.old)
  roomSocket.join(room.new)
  console.log(roomSocket.adapter.rooms)
}
function playerEntersRoom (data) {
  console.log('Player Enters Room')
  if (!gameBoard.playerA) {
    gameBoard.playerA = new player (data.userName, data.grid, data.id)
    console.log('Player A set ', gameBoard.playerA.socketId)
  }
  else if (!gameBoard.playerB) {
    gameBoard.playerB = new player (data.userName, data.grid, data.id)
    console.log('Player B set ', gameBoard.playerB.socketId)
    setTimeout(gamePlay,1000)
  }
  else {
    console.log('Room Full')
    roomSocket.emit('Game Room Message', {message: 'Room Full, Please try again later'})
  }
}
function gamePlay () {
  var clientID = (gameBoard.turn) ? gameBoard.playerA.socketId : gameBoard.playerB.socketId
  console.log(clientID)
  roomSocket.broadcast
  .emit('playersTurn', {message: 'Your shot'})
  console.log('Game Play')
}
function shotFired (data) {
  console.log('Shot Fired')
  var clientA = gameBoard.playerA.socketId
  var clientB = gameBoard.playerB.socketId

  if (gameBoard.turn) { // PlayerA just shot
    var shot = `x${data.target[0]}y${data.target[1]}`
    console.log('A ', shot)
    roomSocket.broadcast.to(clientA).emit('playMade', `.f${shot}`)
    gameBoard.turn = false
    roomSocket.emit('playMade', `.p${shot}`)
    gamePlay()
  } else {
    var shot = `x${data.target[0]}y${data.target[1]}`
    console.log('B ', shot)
    roomSocket.broadcast.to(clientB).emit('playMade', `.f${shot}`)
    gameBoard.turn = true
    roomSocket.emit('playMade', `.p${shot}`)
    gamePlay()
  }
}

function makePlayerGrid (data) {
  // Make matrix that will serve as player board
  // console.log(data)
  var playerGrid = 
    [['x','x','x','x','x','x','x','x','x','x'],
    ['x','x','x','x','x','x','x','x','x','x'],
    ['x','x','x','x','x','x','x','x','x','x'],
    ['x','x','x','x','x','x','x','x','x','x'],
    ['x','x','x','x','x','x','x','x','x','x'],
    ['x','x','x','x','x','x','x','x','x','x'],
    ['x','x','x','x','x','x','x','x','x','x'],
    ['x','x','x','x','x','x','x','x','x','x'],
    ['x','x','x','x','x','x','x','x','x','x'],
    ['x','x','x','x','x','x','x','x','x','x']]

  var shipLength = [5,4,3,3,2]

  for (var _i = 0; _i < 5; _i++){
    for (var _x = 0; _x < shipLength[_i]; _x++ ){
      // console.log(_i)
      var dataX = (parseInt(data.gridSettings[_i][0])/50)+(_x)
      var dataY = ((parseInt(data.gridSettings[_i][1])+(50*_i))/50)
      playerGrid[dataY][dataX] = (_i+1)
    }
  } 
  console.log(playerGrid)
}