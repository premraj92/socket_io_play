// the below socket.io/admin-ui library connects to OUR SOCKETS and give some detailed metrics in a DASHBOARD
const {instrument} = require('@socket.io/admin-ui')

const io = require('socket.io')('9000', {
    cors: {
        origin: "*"
    }
})


// NAMESPACES && Middleware
// Namespaces are used to create different users each with their own socket instance
// NAMESPACES are very useful if you want to handle multiple users like admin and regular users who have different privileges

// here you can have middlewares only for certain users/resources where you keep certain priveliged info under access control
// and if for other namespaces if you don't need auth you can ignore the middleware there 
const userIo = io.of('/user') // here userIo is a separate instance from the base IO instance below


userIo.on('connection', (socket) => {
    console.log(`connected to user namespace with the user : `, socket.userDetails)
})

// .use function helps us with setting up an middleware on any particular namespace
userIo.use((socket, next) => {
    if(socket.handshake.auth.token) {
        socket.userDetails = parseToken(socket.handshake.auth.token)
        next()
    }else {
        next(new Error("please send proper token"))
    }
})

function parseToken(userDetails) {
    return userDetails
}


io.on('connection', (socket) => {
    socket.on('send-message', (message, room) => {

        // in case no room is passed with message do a general broadcast
        if(room === "") {
            // // if you wanna send a message from this `send-message` event to all the users connected than use socket.emit
                // socket.emit('send-to-relevant-clients', message)

            // but if you want to send to all users except the original creator of this message than use broadcast
                socket.broadcast.emit('send-to-relevant-clients', message)
        } else {
            // here `.to` is a broadcast operator that does targeted broadcast TO one OR more rooms provided to it
            socket.to(room).emit('send-to-relevant-clients', message)
        }

    })


    // lets explore the concept of rooms i.e. like closed chat rooms more
    socket.on('join-room', (room) => {
        socket.join(room)
    })


    // room CREATION with ACK from serverToClient
    socket.on('join-room', (room, ackCb) => {
        socket.join(room)
        ackCb(`Joined Room - ${room}`)
    })
})


// this instrument function accepts our SOCKET & an config object
instrument(io, {auth: false})

// // access the ADMIN-UI dashboard here in the below link
// https://admin.socket.io/#/