// import { io } from 'socket.io-client'
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";


const msgInput = document.querySelector('#message-input')
const roomInput = document.querySelector('#room-input')
const joinRoomBtn = document.querySelector('#join-room')
const form = document.querySelector('#chat-form')
const msgContainer = document.querySelector('#message-container')

const socket = io('http://localhost:9000')

// users
const userSocket = io('http://localhost:9000/user', {auth: {token: {userName: 'roh', userAge: 24, location:'bengaluru'}}})

// // // in this case if you DON't SEND the AUTH INFO for the user Namespace the below connect_error event will receive an error notfication from server
// const userSocket = io('http://localhost:9000/user')


// this connect_error event is triggered by a Socket throwing an error
userSocket.on('connect_error', error => {
    displayMessage(error)
})


// listen to the connect event that is fired after the initial socket connection is made
socket.on('connect', () => {
    console.log(`You have connected with ID ${socket.id}`);
    displayMessage(`You have connected with ID ${socket.id}`)
})

socket.on('send-to-relevant-clients', (message) => {
    displayMessage(message)
})


form.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = msgInput.value
    const room = roomInput.value

    if(!message) return
    displayMessage(message)
    
    // send messages to the server with socket.emit
    socket.emit('send-message', message, room)
    msgInput.value = ""
})


joinRoomBtn.addEventListener('click', () => {
    const room = roomInput.value

    // // basic room creation without ACK
    // socket.emit('join-room', room)

    // you can use the below version - with a callback to get an ACKnowledgment from server after room created
    socket.emit('join-room', room, (message) => {
        displayMessage(message)
    })
})

function displayMessage(message) {
    const msgElement = document.createElement('div')
    msgElement.innerText = message
    msgContainer.appendChild(msgElement)
}