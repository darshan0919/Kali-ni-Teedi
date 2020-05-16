const rooms = require('./rooms')


const players = []

var exported = {
  createRoom : function(id,name){
    const newPlayer = {id,name}
    newPlayer.room = rooms.getRoom(id,name)
    players.push(newPlayer)
    return newPlayer
  },
  joinRoom : function(id,name,room){
    const newPlayer = {id,name,room}
    players.push(newPlayer)
    return newPlayer
  },
  extractID : function(player){
    return player.id
  }
}
module.exports = exported