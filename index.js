const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const users = {};

server.listen(port);

io.on('connection', socket =>{
    socket.on('new-user-joined', name =>{
        users[socket.id] = name;
        const onlineUsersObj = Object.keys(users);
        socket.emit('online-users', users);
        socket.broadcast.emit('user-joined', name, users);
    });
    
    socket.on('send', message =>{
        socket.broadcast.emit('receive', {name: users[socket.id], message: message});
    });

    socket.on('on-type', () => {
        socket.broadcast.emit('typing', socket.id);
    })
    
    socket.on('disconnect', () => {
        const name = users[socket.id];
        delete users[socket.id];
        socket.emit('online-users', users);
        socket.broadcast.emit('user-left', name, users);
    })
});