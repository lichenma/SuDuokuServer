const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const { existingGame, updateGame, removeGame, getGame } = require('./games');

const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express(); 


app.use(router)

const server = http.createServer(app); 
const io = socketio(server, {
    cors: {
        origin: '*',
    }
}); 


io.on('connection', (socket) => {
    console.log("user has joined")
    socket.on('join', ({ name, room}, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room }); 
        if (error){
            return callback(error); 
        }

        socket.join(user.room); 
        
        if (existingGame(user.room)) {
            console.log(getGame(user.room))
            socket.emit('game', { room: user.room, moves: getGame(user.room) });
            console.log(getGame(user.room));
        }

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        callback();
    });

    socket.on('sendMoves', (moves, callback) => {
        const user = getUser(socket.id);  
        io.to(user.room).emit('game', { room: user.room, moves: updateGame({ room: user.room, moves: moves }) });
    }); 

    socket.on('sendSelected', (select, callback) => {
        const user = getUser(socket.id)
        socket.broadcast.emit('select', { room: user.room, select: select}); 
    })

    socket.on('disconnect', () => {
        console.log("user has left")
        const user = removeUser(socket.id); 

        if (user) {
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    })
});

server.listen(PORT, () => console.log(`server has started on port ${PORT}`))
