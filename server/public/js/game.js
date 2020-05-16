var queries = decodeURIComponent(window.location.search).substring(1).split("&")
var myId = queries[0].split("=")[1]
var myName = queries[1].split("=")[1]
var myRoom = queries[2].split("=")[1]
var handCards = {}
var handSuits = {}
var Players = []
var playerIds = {}
var playerPlace = {}
var totalPlayers = 1
var activeId = undefined
var activeIndex = undefined
var newCard = undefined
var Hukum = undefined
var nextCardPlace = 0
var boxWidth = 65
var giveUp = false
var minBid = 100
var activeBidId = undefined
var activeBidIndex = undefined
var bidInput = document.querySelector('.bid-input')
var FinalBidder = undefined

playerIds[myId]=myName
playerPlace[myId]=1
var logo = document.querySelector('.p1')
logo.innerHTML=myName.slice(0,5).toUpperCase()

console.log(myRoom)

let roomID = document.querySelector('.roomID')
let roomText = document.createTextNode('Room : '+myRoom)
roomID.append(roomText)


socket.emit('message',{room:myRoom})
socket.on('roomUsers',({PlayerIds,Names})=>{
  totalPlayers = Math.max(totalPlayers,PlayerIds.length)
  let index = PlayerIds.findIndex(id=>id==myId)
  Players[index] = myId
  for(var count=index-1; count>=0; count--){
    let id = PlayerIds[count]
    if (playerIds[id])
      continue
    Players[count] = id
    playerIds[id]=Names[id]
    for(var place=4; place>=2; place--){
      var logo = document.querySelector('.p'+place)
      if(logo.innerHTML=='0'){
        playerPlace[id]=place;
        logo.innerHTML=playerIds[id].slice(0,5).toUpperCase()
        logo.style.borderColor= "green"
        break
      }
    }
  }
  for(var count=index+1; count<PlayerIds.length; count++){
    let id = PlayerIds[count]
    if (playerIds[id])
      continue
    Players[count] = id
    playerIds[id]=Names[id]
    for(var place=2; place<=4; place++){
      var logo = document.querySelector('.p'+place)
      if(logo.innerHTML=='0'){
        playerPlace[id]=place;
        logo.innerHTML=playerIds[id].slice(0,5).toUpperCase()
        logo.style.borderColor= "green"
        break
      }
    }
  }
})

socket.on('shuffledCards',({cards})=>{
  var myCards = cards[myId]
  for(let cardValue = 1; cardValue <= 13 ; cardValue++){
      let Card = myCards[cardValue-1]
      let card = document.querySelector('#card'  + cardValue)
      card.src =  "images/deck/" + Card + ".png"
      card.alt =  Card
      handCards[Card] = true
      if(handSuits[Card[1]])
        handSuits[Card[1]] += 1
      else
        handSuits[Card[1]] = 1
  } 
  var rightPanel = document.querySelector('.right-panel-1')
  rightPanel.style.display = 'flex'
  bidInput.disabled = true;
  socket.emit('doneShuffling')
})



socket.on('startBid',({index,prevIndex,prevBid})=>{
  let roomIdNode = document.querySelector('.roomID')
  roomIdNode.style.display = 'none'
  console.log('index',index)
  let id = Players[index]
  if(prevIndex!=undefined){
    let prevId = Players[prevIndex]
    let place = playerPlace[prevId]
    let logo = document.querySelector('.p'+place)
    logo.classList.remove('blink_me')
  }
  let place = playerPlace[id]
  console.log(id)
  let logo = document.querySelector('.p'+place)
  logo.classList.add('blink_me')
  activeBidIndex = index
  activeBidId = id
  if(activeBidId==myId){
    bidInput.disabled = false
  }
  minBid = prevBid 
  bidInput.value = minBid.toString()
  bidInput.min = minBid.toString()   
})



let increaseBid = function(value){
  if(parseInt(bidInput.value) + value >= minBid )
    bidInput.value = parseInt(bidInput.value) + value
}

document.querySelector('.bid-5').addEventListener('click',()=>{
  if(activeBidId==myId)
    increaseBid(5)
})
document.querySelector('.bid-10').addEventListener('click',()=>{
  if(activeBidId==myId)
    increaseBid(-10)
})
document.querySelector('.bid-15').addEventListener('click',()=>{
  if(activeBidId==myId) 
    increaseBid(15)
})
document.querySelector('.bid-30').addEventListener('click',()=>{
  if(activeBidId==myId)
    increaseBid(30)
})

document.querySelector('.bid-submit').addEventListener('click',()=>{
  if(activeBidId==myId){
    console.log("Submit")
    let myBid = parseInt(bidInput.value)
    if(myBid>minBid){
      bidInput.disabled = true
      socket.emit('doneBidding',{Index:activeBidIndex,prevBid:myBid})
    }
  }
})

document.querySelector('.bid-giveup').addEventListener('click',(e)=>{
  if(activeBidId==myId){
      bidInput.disabled = true
      socket.emit('giveUp',{id:myId,Index:activeBidIndex,prevBid:minBid})
  }
})

socket.on('foundBidder',({id,finalBid})=>{
  FinalBidder = id
  activeBidId = id
  let rightPanel = document.querySelector('.right-panel-1')
  rightPanel.style.display = 'none'
  let bidNode = document.createTextNode("Bid : "+finalBid)
  let bidValueNode = document.querySelector('.final-bid')
  bidValueNode.style.display = 'flex'
  bidValueNode.append(bidNode)
  for(let count=0;count<Players.length;count++){
    let currentId = Players[count]
    let place = playerPlace[currentId]
    let logo = document.querySelector('.p'+place)
    logo.classList.remove('blink_me')
  }
  let place = playerPlace[id]
  let logo = document.querySelector('.p'+place)
  logo.classList.add('blink_me')
  if(id==myId){
    let rightPanel = document.querySelector('.right-panel-2')
    rightPanel.style.display = 'flex'
  }
})



document.querySelector('.card-submit').addEventListener('click',(e)=>{
  if(activeBidId==myId){
    let cardValue = document.querySelector('.chosen-card-value').value
    let cardSuit = document.querySelector('.chosen-card-suit-1').value
    console.log('selected card :',cardValue + cardSuit)
    let card = cardValue + cardSuit
    let rightPanel = document.querySelector('.right-panel-2')
    rightPanel.style.display = 'none'
    socket.emit('choseTheCard',{bidder:myId,card})
  }
})


var activeHukumBidId = undefined
socket.on('chooseHukum',({bidder})=>{
  if(myId==bidder){
    let rightPanel = document.querySelector('.right-panel-4')
    rightPanel.style.display = 'flex'
    activeHukumBidId=bidder
    document.querySelector('.hukum-submit').addEventListener('click',()=>{
      let cardSuit = document.querySelector('.chosen-card-suit-2').value
      let rightPanel = document.querySelector('.right-panel-4')
      rightPanel.style.display = 'none'
      Hukum = cardSuit
      socket.emit('setHukum',{hukum:cardSuit})
    })
  }
})














socket.on('takeTurn',({index,prevIndex,card})=>{
  let id = Players[index]
  if(card!=undefined){
    let prevId = Players[prevIndex]
    if(myId!=prevId) {
      let takePlace = document.querySelector('#cardPlace'  + nextCardPlace )
      let image = "url('images/deck/" + card + ".png')"
      takePlace.style.backgroundImage =  image
      takePlace.style.backgroundSize = "100% 100%"
      takePlace.role = card + prevId
      nextCardPlace = (nextCardPlace + 1)%totalPlayers
    }
  }
  if(prevIndex!=undefined){
    let prevId = Players[prevIndex]
    let place = playerPlace[prevId]
    let logo = document.querySelector('.p'+place)
    logo.classList.remove('blink_me')
  }
  let place = playerPlace[id]
  let logo = document.querySelector('.p'+place)
  logo.classList.add('blink_me')
  activeIndex = index
  activeId = id
  newCard = card 
})

let checkSuitValidity = function(suit){
  let takePlace = document.querySelector('#cardPlace'  + 0 )
  if(takePlace.role){
    let firstCardSuit = takePlace.role[1]
    if(suit==firstCardSuit)
      return [true,false]
    if(handSuits[firstCardSuit]>0){
      return [false,false]
      console.log("cheater",handSuits[firstCardSuit])
    }
    else
      return [false,true]  
  }
  return [true,false]
}

var selectedCard = function(e,activeId){
  let card = e.target
  let Card = card.alt
  let cardId = card.id.slice(4,card.id.length) 
  console.log("double clicked",Card)
  let cardSuit = Card[1]
  let validity = checkSuitValidity(cardSuit) 
  if(!validity[0]){
    if(!validity[1])
      return
  }
  let boxDeck = document.querySelector('.box-deck')
  boxDeck.style.width = boxWidth + '%'
  boxWidth -= 5
  card.parentNode.remove()
  let takePlace = document.querySelector('#cardPlace'  + nextCardPlace )
  let image = "url('images/deck/" + Card + ".png')"
  takePlace.style.backgroundImage =  image
  takePlace.style.backgroundSize = "100% 100%"
  takePlace.role = Card + activeId
  delete handCards[Card] 
  handSuits[cardSuit] -= 1
  console.log(handSuits)
  nextCardPlace = (nextCardPlace + 1)%totalPlayers
  socket.emit('tookTurn',{Index:activeIndex,Card:card.alt}) 
}

socket.on('foundHukum',({hukum})=>{
  let rightPanel = document.querySelector('.right-panel-3')
  rightPanel.style.display = 'flex'
  let hukumNode = document.querySelector('.hukum-area')
  let image = "url('images/deck/" + hukum + ".png')"
  hukumNode.style.backgroundImage = image
  hukumNode.style.backgroundSize = "100% 100%"
  Hukum = hukum
  console.log('Found hukum',hukum)
  socket.emit('finishedBidding',{bidder:FinalBidder})
})


for(let cardValue = 1; cardValue <= 13 ; cardValue++){
  card = document.querySelector('#card'  + cardValue)
  card.addEventListener('dblclick',(e)=>{
    if(activeId==myId){
      selectedCard(e,activeId)
    }
  })
}


socket.on('clearTable',()=>{
  let Hand = []
  nextCardPlace = 0
  for(let cardPlace=0; cardPlace<totalPlayers; cardPlace++){
    let takePlace = document.querySelector('#cardPlace'  + cardPlace )
    takePlace.style.background =  'none'
    Hand.push(takePlace.role)
    takePlace.role=undefined
  }
  if(myId==activeId){
    let PrevIndex = Players.findIndex(id=>id==myId)
    console.log('Last Move by',playerIds[myId])
    socket.emit('countHand',{hand:Hand,prevId:PrevIndex})
  }
})

/*setTimeout(() => {
  socket.emit('tookTurn') 
  logo.classList.remove('blink_me')
}, 45000);*/

socket.on('redirect_WinnerPage',(destination)=>{
  console.log('Game Over!!')
  console.log(destination)
  window.location.href = destination
})
