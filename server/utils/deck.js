
let suitConverter = function(cardNumber){
  let suitMap = {
    0 : 'C', 
    1 : 'D',
    2 : 'H',
    3 : 'S'
  } 
  let suitNumber = parseInt((cardNumber-1)/13)
  return suitMap[suitNumber]
}

let validValue = function(cardValue){
  let valueMap = { 
    14 : 'A',
    10 : '0',
    11 : 'J',
    12 : 'Q',
    13 : 'K'
   }
  
  if (1 < cardValue && cardValue < 10)
    return cardValue
  else 
    return valueMap[cardValue] 
}


let NumericToString = function(cardNumber){
  let suit = suitConverter(cardNumber).toString()
  let cardValue = (cardNumber-1) %13 + 2
  let validCardValue = validValue(cardValue).toString()
  return validCardValue + suit
}

function shuffle(list) {
  var rest = list.length, index, temp;
  // While there are elements in the array
  while (rest > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * rest);
    // Decrease rest by 1
    rest--;
    // And swap the last element with it
    temp = list[rest]
    list[rest] = list[index]
    list[index] = temp
  }
  return list;
}

let shuffler = function(playerIds){
  //  Cards are indexed from 1 to 52
  //  Suits are in the given order Club, Diamond, Heart, Spade
  //  Cards are in ascending order
  //  Cards of same suit are contigously given the cardNumber
  let Deck = []
  for(cardNumber = 1; cardNumber<= 52; cardNumber++) {
    Deck.push(cardNumber)
  }
  Deck = shuffle(Deck)
  var Cards = {}
  for(var count=0; count<playerIds.length; count++){
    let playerID = playerIds[count]
    let NumericCards = Deck.slice(count*13,count*13 + 13)
    NumericCards.sort(function(a, b){return a-b})
    Cards[playerID] = NumericCards.map( cardNumber => NumericToString(cardNumber))
  }
  return Cards
}

let cardValueGame = function(card){
  if(card=='3S')
    return 30  
  cardValue = card[0]
  if(cardValue=='5')
    return 5
  if('2'<=cardValue && cardValue<='9')
    return 0
  return 10
}

let cardRank = function(cardValue){
  let valueMap = { 
    'A' : 14,
    'J' : 11,
    'Q' : 12,
    'K' : 13
   }
  let NumericCardValue = parseInt(cardValue)
  if(!Number.isNaN(NumericCardValue)){
    if(NumericCardValue==0)
      return 10
    else
      return NumericCardValue
  } 
  else {
    return valueMap[cardValue] 
  }
}

let compareCards = function(player1,player2,hukum){
  let suitPlayer1 = player1.Card[1]
  let suitPlayer2 = player2.Card[1]
  if(suitPlayer1!=suitPlayer2){
    if(hukum!=undefined){
      if(suitPlayer2==hukum){
        return {id:player2.Id,card:player2.Card}
      }
      else
        return {id:player1.Id,card:player1.Card}
    }
    else
      return {id:player1.Id,card:player1.Card}
  }
  else{
    let rankPlayer1 = cardRank(player1.Card[0]) 
    let rankPlayer2 = cardRank(player2.Card[0])
    if(rankPlayer1>rankPlayer2){
      return {id:player1.Id,card:player1.Card}
    }
    else{
      return {id:player2.Id,card:player2.Card}
    }
  }
}



let giveHandValue = function(cards,ids,hukum){
  var finalId = ids[0]
  var finalCard = cards[0]
  var finalValue = cardValueGame(cards[0])
  for(let count=1;count<ids.length;count++){
      let player1 = {Id:finalId,Card:finalCard}
      let player2 = {Id:ids[count],Card:cards[count]}
      let betterPlayer = compareCards(player1,player2,hukum)
      finalId = betterPlayer.id
      finalCard = betterPlayer.card
      finalValue += cardValueGame(cards[count]) 
  }
  return {id:finalId,value:finalValue}
}


module.exports = {shuffler,giveHandValue}