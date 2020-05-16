const {v4} = require('uuid')
const deck = require('./deck')

const rooms = []
const playerCount = {}
const Players = {}
const Names = {}
const ValuePlayer = {}
const Hukum = {}
const deckSize = {}
const teamCard = {}
const gaveUp = {}
const Bidder = {}
const teamMate = {}
const BidCard = {}
const Bid = {}
const TotalPlayers = 4
const RoomCards = {}

var exported = {

  getRoom : function(id,name){
    newRoom =  v4()
    rooms.push(newRoom)
    playerCount[newRoom] = 1
    Players[newRoom] = [id]
    deckSize[newRoom] = 52
    Names[id] = name
    ValuePlayer[id] = 0
    return newRoom
  } ,
  checkRoom : function(id,name,room){
    if(room in playerCount){
      if(0<playerCount[room] && playerCount[room]<TotalPlayers){
        playerCount[room]++
        Players[room].push(id)
        Names[id]=name
        ValuePlayer[id] = 0
        return 1
      }
      else
      return 0
    }
    else
      return -1
  },
  setRoomCards : function(room,Cards){
    RoomCards[room] = Cards
  },
  getRoomUsers : function(room){
    let playerIds = Players[room]
    if(!playerIds) return
    let names = {}
    for(var count =0 ; count<playerIds.length; count++){
        let id = playerIds[count] 
        names[id] = Names[id]
    }
    return {playerIds,names}
  },
  updateDeckSize : function(room){
    deckSize[room]--
  },
  getDeckSize : function(room){
    return deckSize[room]
  },
  addHandValues : function(room,hand){
    let cards = hand.map(role=>role.slice(0,2))
    let ids = hand.map(role=>role.slice(2,role.length))
    let {id,value} = deck.giveHandValue(cards,ids,Hukum[room])
    ValuePlayer[id] += value
    let index = Players[room].findIndex(Id=>Id==id)
    console.log(Names[id],'takes Hand with final Total = ',ValuePlayer[id],'next index',index)
    return {Index:index}
  },
  setHukum : function(room,hukum){
    Hukum[room]=hukum
  },
  getPlayerId : function(room,index){
    return  Players[room][index]
  },
  GaveUp : function(id,room){
    if(gaveUp[room]){
      if(Object.keys(gaveUp[room]).length == TotalPlayers - 1){
        return true
      }
      else{
        gaveUp[room][id] = true
        return false
      }
    }
    else{
        let obj = {}
        obj[id] = true
        gaveUp[room] = obj
        //console.log(gaveUp[room])
        return false
    }
  },
  getNextBidIndex: function(Index,room){
    for(let count=1;count<=TotalPlayers;count++){
      let ind = (Index + count)%TotalPlayers
      let Id = Players[room][ind]
      if(gaveUp[room]){
        if(gaveUp[room][Id]){
          continue
        }
      }
      return ind
    }
    return Index
  },
  getPlayerIndex : function(room,Id){
    for(let count=0;count<TotalPlayers;count++){
      if(Players[room][count]==Id)
        return count
    }
  },
  setBidder : function(room,id){
    Bidder[room] = id
  },
  getBidders : function(room){
    let ids = Players[room]
    let bidders = []
    for(let count=0;count<ids.length;count++){
      let id = ids[count]
      if(gaveUp[room]){
        if(gaveUp[room][id])
          continue
        else
          bidders.push(id)
      }
      else
        bidders.push(id)
    }
    return bidders
  },
  setBidCard : function(room,card){
    BidCard[room] = card
  },
  setBid : function(room,bid){
    Bid[room] = bid
  },
  findTeam: function(room){
    for(let count=0;count<TotalPlayers;count++){
      let id = Players[room][count]
      console.log(Names[id])
      let cards = RoomCards[room][id]
      for(let crd=0;crd<cards.length;crd++){
        if(cards[crd]==BidCard[room]){
          console.log(this.getPlayerIndex(room,id))
          console.log('here')
          return {BIDDER:Bidder[room],SUPPORTER:id}
        }
      }
    }
    //return {BIDDER:Bidder[room],SUPPORTER:Bidder[room]}
  }
}
module.exports = exported
module.exports.rooms=rooms
module.exports.playerCount=playerCount
module.exports.Players=Players
module.exports.Names=Names
module.exports.ValuePlayer=ValuePlayer
module.exports.Hukum=Hukum
module.exports.deckSize=deckSize
module.exports.gaveUp=gaveUp
module.exports.TotalPlayers=TotalPlayers
module.exports.Bid=Bid
