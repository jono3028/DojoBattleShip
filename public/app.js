
// console.log('app.js')
jQuery(function($){  
  var IO = {
    init: function () {
      // console.log('app.js - init')
      IO.socket = io.connect()

      Battle.cachePage()
      IO.bindEvents()
      console.log(IO.socket)
    },
    bindEvents: function () {

      // IO.socket.on('connected', IO.onConnected)
      IO.socket.emit('connected')
      IO.socket.on('PlayerEntersLobby', Battle.Player.addPlayer)
      IO.socket.on('Receive Challenge Request', Battle.Player.receiveChallengeRequest)
      IO.socket.on('Goto Pregame', Battle.Player.setShips)
      IO.socket.on('Game Room Message', Battle.roomMessage)
      IO.socket.on('playersTurn', Battle.playersTurn)
      IO.socket.on('playMade', Battle.playMade)
    },
    onConnected: function () {
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

    init: function () {
      Battle.showLogin() 
      Battle.cachePage()
      Battle.bindEvents() 
    },
    // Page views and templates
    cachePage: function () {
      Battle.$doc = $(document)
      // Templates
      Battle.$gameArea = $('#gameArea')
      Battle.$templateLogin = $('#login-template').html()
      Battle.$templateLobby = $('#lobby-template').html()
      Battle.$templateChallenge = $('#challenge-template').html()
      Battle.$templateSetGrid = $('#setGrid-template').html()
      Battle.$templateGamePlay = $('#gamePlay-template').html()
    },

    bindEvents: function () {
      Battle.$doc.on('click', '#btnToLobby', Battle.Player.enterLobby)
      Battle.$doc.on('click', '#btnSaveShips', Battle.Player.saveShipsClick)
      Battle.$doc.on('click', '#btnFireAtWill', Battle.gameFireClick)
      Battle.$doc.on('click', '#btnReset', function () {IO.socket.emit('gameReset')})
    },
    showLogin: function () {
      IO.socket.emit('Join Room', 'Global')
      
      Battle.$gameArea.html(Battle.$templateLogin)
    },
    initChallenge: function (event) {
     
    },
    makeGameRoom: function (playerGrid) {
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
    
    roomMessage: function (data) {
      $('#gamePlay-message').html(data.message)
    },
    playersTurn: function (data) {
      console.log('playersTurn')
      $('#gamePlay-message').html(data.message)
      $('.firingBoard td').click(function () {
          var coord = $(this).attr('class')
          Battle.shot = [parseInt(coord[2]), parseInt(coord[4])]
          $('#target').html(`Grid position ${Battle.shot[0]},${Battle.shot[1]} selected`)
          $('#btnFireAtWill').removeAttr('disabled')
        })
    },
    gameFireClick: function () {
      console.log('gameFireClick')
      $('#target').html('')
      $('#gamePlay-message').html('')
      $('#btnFireAtWill').attr('disabled', 'disabled')
      IO.socket.emit('shotFired', {target: Battle.shot})
    },
    playMade: function (data) {
      console.log('playMade - ',data)
      $(data).html('X')
    },
    Player: {
      playerName: '',
      shipCoord: [[0,0],[0,1],[0,2],[0,3],[0,4]], // Ship position [data-x, data-y]

      enterLobby: function () {
        Battle.Player.playerName = $('#playerName').val() || 'Captian Jack'
        Battle.SocketID = IO.socket.id
        // IO.socket.emit('connected', {roomName: Battle.SocketID})
        Battle.$gameArea.html(Battle.$templateLobby)
        // $('#playerList').append('li').html(Battle.Player.playerName)
        data = {id: Battle.SocketID, name: Battle.Player.playerName}
        IO.socket.emit('New Player', data)
        console.log(`${Battle.Player.playerName} entering lobby`)
      },
      addPlayer: function (data) {
        $('#playerList').append(`<li><button class="btnChallengePlayer" data="${data.id}">${data.name}</button></li>`)
        $('.btnChallengePlayer').click(function () {
          var newdata = { 
            challengedPlayerId: $(this).attr('data'),
            challengerPlayerId: Battle.SocketID,
            challengerPlayerName: Battle.Player.playerName
          }
          console.log(newdata)
          IO.socket.emit('Send Challenge Request', newdata)
          IO.socket.emit('Change Room', {old: 'Global', new: 'Room1'})
          
        })
        console.log('addPlayer')
      },
      receiveChallengeRequest: function (data) {
        Battle.$gameArea.html(Battle.$templateChallenge)
        console.log('receiveChallenge')
        $('#btnYes').click(function () {
          IO.socket.emit('Accept Challenge')
          IO.socket.emit('Change Room', {old: 'Global', new: 'Room1'})
          Battle.Player.setShips()
        })
      },
      setShips: function () {
        console.log('Player - setShipsClick')
        // Battle.Player.playerName = $('#playerName').val() || 'Captian Jack'
        // Battle.numPlayersInRoom++
        Battle.$gameArea.html(Battle.$templateSetGrid)
        console.log(Battle.Player.playerName)
      },
      saveShipsClick: function () {
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
