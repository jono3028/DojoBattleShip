
// console.log('app.js')
jQuery(function($){  
  var IO = {
    init: () => {
      // console.log('app.js - init')
      IO.socket = io.connect()

      Battle.cachePage()
      IO.bindEvents()
    },
    bindEvents: () => {

      IO.socket.on('connected', IO.onConnected)
    },
    onConnected: () => {
      Battle.SocketId = IO.socket.sessionid
    }
  }
  var Battle = {
    gameId: 0,
    SocketID: '',
    currentRound: 0,
    playerTurn: 0,
    numPlayersInRoom: 0,

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
    },

    bindEvents: () => {
      Battle.$doc.on('click', '#btnSetShips', Battle.Player.setShipsClick)
      Battle.$doc.on('click', '#btnSaveShips', Battle.Player.saveShipsClick)
    },
    showLobby: () => {
      Battle.$gameArea.html(Battle.$templateLobby)
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
        console.log(Battle.Player.shipCoord)
        var data ={
          playerName: Battle.Player.playerName,
          gridSettings: Battle.Player.shipCoord
        }
        IO.socket.emit('makePlayerGrid', data)
      }

    }
  }
  // Initialize
  IO.init()
  Battle.init()

}($))
