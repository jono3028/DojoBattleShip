
// console.log('app.js')
jQuery(function($){  
  var IO = {
    init: () => {
      // console.log('app.js - init')
      IO.socket = io.connect()

      Battle.cachePage()
      IO.bindEvents()
      console.log(IO.socket)
    },
    bindEvents: () => {

      IO.socket.on('connected', IO.onConnected)
      IO.socket.on('Game Room Message', Battle.roomMessage)
      IO.socket.on('playersTurn', Battle.playersTurn)
      IO.socket.on('playMade', Battle.playMade)
    },
    onConnected: () => {
      Battle.SocketID = IO.socket.id
    }
  }
  var Battle = {
    gameId: 0,
    SocketID: '',
    currentRound: 0,
    playerTurn: 0,
    numPlayersInRoom: 0,
    shot: [],

    init: () => {
      Battle.showLobby() 
      Battle.cachePage()
      Battle.bindEvents() 
    },
    // Page views and templates
    cachePage: () => {
      Battle.$doc = $(document)
      // Templates
      Battle.$gameArea = $('#gameArea')
      Battle.$templateLobby = $('#lobby-template').html()
      Battle.$templateSetGrid = $('#setGrid-template').html()
      Battle.$templateGamePlay = $('#gamePlay-template').html()
    },

    bindEvents: () => {
      Battle.$doc.on('click', '#btnSetShips', Battle.Player.setShipsClick)
      Battle.$doc.on('click', '#btnSaveShips', Battle.Player.saveShipsClick)
      Battle.$doc.on('click', '#btnFireAtWill', Battle.gameFireClick)
      Battle.$doc.on('click', '#btnReset', function () {IO.socket.emit('gameReset')})
    },
    showLobby: () => {
      Battle.$gameArea.html(Battle.$templateLobby)
    },
    makeGameRoom: (playerGrid) => {
      Battle.$gameArea.html(Battle.$templateGamePlay)
        // console.log('0------------')
      var field = '.playerBoard', tag = 'p'
      for (var i = 0; i <2; i++){
        for (var y= 0; y < 10; y++) {
          $(field).append($('<tr>').attr('class', `${tag}${y}`))
          for (var x = 0; x < 10; x++) {
            $(`.${tag}${y}`).append($('<td>').attr('class', `${tag}x${x}y${y}`))
            if (playerGrid[y][x] !== 'x' && tag === 'p') {
              $(`.px${x}y${y}`).css('background', 'salmon')
            }
          }
        }
        field = '.firingBoard'
        tag = 'f'
      } 
      data = {
        grid: playerGrid,
        userName: Battle.Player.playerName,
        id: Battle.SocketID 
      }
      $('.firingBoard td').hover(function () {$(this).css('background','red')}, function () {$(this).css('background','')})
      IO.socket.emit('playerEntersRoom', data)
    },
    roomMessage: (data) => {
      $('#gamePlay-message').html(data.message)
    },
    playersTurn: (data) => {
      console.log('playersTurn')
      $('#gamePlay-message').html(data.message)
      $('.firingBoard td').click(function () {
          var coord = $(this).attr('class')
          Battle.shot = [parseInt(coord[2]), parseInt(coord[4])]
          $('#target').html(`Grid position ${Battle.shot[0]},${Battle.shot[1]} selected`)
          $('#btnFireAtWill').removeAttr('disabled')
        })
    },
    gameFireClick: () => {
      console.log('gameFireClick')
      $('#target').html('')
      $('#gamePlay-message').html('')
      $('#btnFireAtWill').attr('disabled', 'disabled')
      IO.socket.emit('shotFired', {target: Battle.shot})
    },
    playMade: (data) => {
      console.log('playMade - ',data)
      $(data).html('X')
    },
    Player: {
      playerName: '',
      shipCoord: [[0,0],[0,1],[0,2],[0,3],[0,4]], // Ship position [data-x, data-y]

      setShipsClick: () => {
        console.log('Player - setShipsClick')
        Battle.Player.playerName = $('#playerName').val() || 'Captian Jack'
        Battle.numPlayersInRoom++
        Battle.$gameArea.html(Battle.$templateSetGrid)
        console.log(Battle.Player.playerName)
      },
      saveShipsClick: () => {
        console.log('Player - saveShipsClick')
        for (var _x = 0; _x < 5; _x++) {
          Battle.Player.shipCoord[_x][0] = $(`.drag-container div:nth-child(${_x+1})`).attr('data-x')
          Battle.Player.shipCoord[_x][1] = $(`.drag-container div:nth-child(${_x+1})`).attr('data-y')
        }
        // console.log(Battle.Player.shipCoord)
        // var data = {
        //   playerName: Battle.Player.playerName,
        //   gridSettings: Battle.Player.shipCoord
        // }
        // IO.socket.emit('makePlayerGrid', data)
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
            var dataX = (parseInt(Battle.Player.shipCoord[_i][0])/50)+(_x)
            var dataY = ((parseInt(Battle.Player.shipCoord[_i][1])+(50*_i))/50)
            playerGrid[dataY][dataX] = (_i+1)
          }
        } 
        Battle.makeGameRoom(playerGrid)
      }

    }
  }
  // Initialize
  IO.init()
  Battle.init()

}($))
