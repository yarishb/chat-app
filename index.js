//setting modules

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const formateMessage = require('./utils/messages')
const { userJoin, getCurrentUser, getRoomUsers, deleteUser } = require('./utils/users')

const botName = "server"

// Set static folder
app.use(express.static(path.join(__dirname + '/public')));
// Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room)


        socket.join(user.room);
        
        // Welcome current user
        socket.emit('message', formateMessage(botName, "Welcome to chat app"))

    // Broadcast when a user connects
    socket.broadcast
        .to(user.room)
        .emit('message',
         formateMessage
         (botName, `${user.username} has joined the chat`));
    

         // Send users and room info 
         io.to(user.room).emit('roomUsers', {
             room: user.room,
             users: getRoomUsers(user.room)
         }) 
});
    // Listen for chatMessage
    socket.on("chatMessage", msg => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message',  formateMessage(user.username, msg));
    })

    //Run when user disconnects
    socket.on('disconnect', () => {
        const user = deleteUser(socket.id)
        if(user){
            io.to(user.room).emit("message", formateMessage(botName, `${user.username} has left the chat`))
        }
    })
})




// Port that our app is listening on
const port = process.env.PORT || 3000

// Run app
server.listen(port, () => console.log(`Server running on port ${port}`));