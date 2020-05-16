var queries = decodeURIComponent(window.location.search).substring(1).split("&")

let box = document.querySelector('.names')
for(let player=0;player<queries.length-1;player++){
  let name = queries[player].split("=")[1].toUpperCase()
  console.log(name)
  let score_box = document.createElement('div')
  score_box.classList.add("score-box")
  let result = document.createTextNode(name)
  score_box.append(result)
  box.append(score_box)
}
