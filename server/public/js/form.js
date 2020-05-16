const socket = io();

socket.on('redirect', function(destination) {
  window.location.href = destination;
})

socket.on('message',msg=>console.log(msg))


let joinRoom = function(){
  let joinForm = document.querySelector('.join-form')
  let joinPage = document.querySelector('.join-room')
  if(!joinForm.checkValidity()){
    joinForm.reportValidity();
    return;
  }
  joinPage.style.display = "inherit"; 
}

let createRoom = function(){
  let joinForm = document.querySelector('.join-form')
  if(!joinForm.checkValidity()){
    joinForm.reportValidity();
    return;
  }
  Name = joinForm.elements["name"].value
  socket.emit('createRoom',{name:Name});
  socket.emit('message',{room:myRoom})
}

let Join = function(){
  let joinForm = document.querySelector('.join-form')
  let joinPage = document.querySelector('.join-room')
  let roomInput = joinPage.querySelector('input')
  if(!joinPage.checkValidity()){
    joinPage.reportValidity();
    return;
  }
  Name = joinForm.elements["name"].value
  Room = joinPage.elements["room"].value
  socket.emit('joinRoom',{name:Name,room:Room})
  socket.on('invalidRoom', function({validity}) {
    roomInput.value=""
    if(validity<0)
      roomInput.placeholder='Please enter valid room number'
    else
      roomInput.placeholder='Room is Full!'
    return
  })
}
