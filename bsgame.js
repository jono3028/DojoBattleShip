var io
var roomSocket

module.exports.initGame = function (sio, socket) {
  console.log('server - initGame')
  io = sio
  roomSocket = socket
  roomSocket.emit('connected', {message: 'New User Connected'})

  roomSocket.on('playerEntersRoom', playerEntersRoom)
  roomSocket.on('makePlayerGrid', makePlayerGrid)
  console.log('playerEntersRoom')
}


function playerEntersRoom () {

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