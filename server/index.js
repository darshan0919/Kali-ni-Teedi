var express = require('express')
var path = require('path')
var http = require('http')
const socket = require('socket.io')
const bodyParser = require('body-parser')

var app = express()
var server = http.Server(app)
const io = socket(server)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/',function(req,res){
  res.render('index')
})

app.get('/ingame',function(req,res){
  res.render('ingame')
})

app.get('/winnerPage',function(req,res){
  res.render('winnerPage')
})


server.listen(3000, ()=> console.log(`Listening on PORT 3000`))

const players = require('./utils/players')
const rooms = require('./utils/rooms')
const deck = require('./utils/deck')

io.on('connection', (socket) => {
  socket.on('createRoom',({name})=>{
    const player = players.createRoom(socket.id,name)
    socket.join(player.room)
    console.log(player.room)
    let queryString = "?id=" + player.id + "&name=" + player.name + "&room=" + player.room
    let destination = '/ingame' + queryString
    socket.emit('redirect', destination)
  })
  socket.on('joinRoom',({name,room})=>{
    let Validity = rooms.checkRoom(socket.id,name,room);
    if(Validity <= 0){
      socket.emit('invalidRoom',{validity:Validity})
      return 
    }
    const player = players.joinRoom(socket.id,name,room)
    socket.join(player.room)
    
    let queryString = "?id=" + player.id + "&name=" + player.name + "&room=" + player.room
    let destination = '/ingame' + queryString
    socket.emit('redirect', destination)
  })
  
  socket.on('message',({room})=>{
    socket.join(room);
    var Players = rooms.getRoomUsers(room)
    io.to(room).emit('roomUsers',  {
      PlayerIds: Players.playerIds,
      Names : Players.names
    })
    var totalPlayers = rooms.TotalPlayers
    var ids = Players.playerIds
    if(Players.playerIds.length==totalPlayers){
      var Cards = deck.shuffler(ids)
      rooms.setRoomCards(room,Cards)
      io.to(room).emit('shuffledCards',{cards:Cards})
    }
    socket.on('doneShuffling',()=>{
      io.to(room).emit('startBid',{index:0,prevIndex:undefined,prevBid:100})
    })

    socket.on('choseTheCard',({bidder,card})=>{
      rooms.setBidder(room,bidder)
      rooms.setBidCard(room,card)
      let x = rooms.findTeam(room)
      console.log(x)
      if(x)
        console.log('Team',rooms.Names[x.BIDDER],rooms.Names[x.SUPPORTER])
      console.log('selected card',card)
      console.log('bidder',rooms.Names[bidder])
      io.to(room).emit('chooseHukum',{bidder})
    })


    socket.on('finishedBidding',({bidder})=>{
      let Index = rooms.getPlayerIndex(room,bidder)
      io.to(room).emit('takeTurn',{index:Index,prevIndex:undefined,card:undefined})
    })
    socket.on('doneBidding',({Index,prevBid})=>{
      let nextBidIndex = rooms.getNextBidIndex(Index,room)
      console.log('next bid index',nextBidIndex)
      if(nextBidIndex == Index){
        BidderId = rooms.getPlayerId(room,Index)
        rooms.setBid(room,prevBid)
        io.to(room).emit('foundBidder',{id:BidderId,finalBid:prevBid})
      }
      else{
        io.to(room).emit('startBid',{index:nextBidIndex,prevIndex:Index,prevBid})
      }
    })
    socket.on('giveUp',({id,Index,prevBid})=>{
      if(rooms.GaveUp(id,room)){
        console.log('here')
        rooms.setBid(room,prevBid)
        io.to(room).emit('foundBidder',{id,finalBid:prevBid})
      }

      let bidders = rooms.getBidders(room)

      if(bidders.length == 1){
        io.to(room).emit('foundBidder',{id:bidders[0],finalBid:prevBid})
      }
      else{
        let nextBidIndex = rooms.getNextBidIndex(Index,room)
        console.log('next bid index',nextBidIndex)
        if(nextBidIndex == Index){
          rooms.setBid(room,prevBid)
          BidderId = rooms.getPlayerId(room,Index)
          io.to(room).emit('foundBidder',{id:BidderId,finalBid:prevBid})
        }
        else{
          io.to(room).emit('startBid',{index:nextBidIndex,prevIndex:Index,prevBid})
        }
      }
    })
    socket.on('tookTurn',({Index,Card})=>{
      console.log(rooms.Names[rooms.Players[room][Index]],'played',Card)
      rooms.updateDeckSize(room)
      if(rooms.getDeckSize(room)%totalPlayers == 0){
        setTimeout(()=> io.to(room).emit('clearTable'),1000)
      }
      else{
        let nextIndex = (Index + 1)%totalPlayers
        io.to(room).emit('takeTurn',{index:nextIndex,prevIndex:Index,card:Card})
      }
    })
    
    socket.on('countHand',({hand,prevId})=>{
      let {Index} = rooms.addHandValues(room,hand)
      console.log('Next Move by',rooms.Names[rooms.Players[room][Index]])
      let rest = 52 - rooms.TotalPlayers*13
      if(rooms.getDeckSize(room)==rest){
        let queryString = '?'
        let {names} = rooms.getRoomUsers(room)
        let {BIDDER,SUPPORTER} = rooms.findTeam(room)
        let BiddingTeam = {}
        BiddingTeam[BIDDER] = true
        BiddingTeam[SUPPORTER] = true
        let score
        
        if(BIDDER==SUPPORTER)
          score = rooms.ValuePlayer[BIDDER] 
        else
          score = rooms.ValuePlayer[BIDDER] + rooms.ValuePlayer[SUPPORTER]
        var winners = []
        if(score>=rooms.Bid[room]){
          for(var id in names){
            if(BiddingTeam[id]){
              winners.push(names[id])
              console.log(names[id])
            }
          }
        }
        else{
          for(var id in names){
            if(BiddingTeam[id])
              continue
            else
              winners.push(names[id])
          }
        }
        for(let winner =0; winner<winners.length;winner++){
          queryString += 'name=' + winners[winner] + '&'
        }

        let destination = '/winnerPage' + queryString 
        io.to(room).emit('redirect_WinnerPage',destination)
      }
      if(Index==prevId)
        prevId = undefined
      io.to(room).emit('takeTurn',{index:Index,prevIndex:prevId,card:undefined})
    })
    socket.on('setHukum',({hukum})=>{
      console.log('Hukum set to: ',hukum)
      rooms.setHukum(room,hukum)
      io.to(room).emit('foundHukum',{hukum})
    })
  })

  socket.on('disconnect', () => {
    io.emit('user disconnected')
  })
})
