const jwt = require('jsonwebtoken');
const conn = require('./db/conn');
const query = require('./db/query');

let sockets = [];

// authorization
module.exports = (io) => {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
                if(err) {
                    console.log(err.message);
                    return;
                }
                const q = await query(conn, "SELECT * FROM user WHERE ?", { username: user.username });
                socket.id = q[0].id;
                next();
            });
        } catch (err) {}
    });
    
    io.on('connection', socket => {
        if(!sockets.includes(socket.id)) sockets.push(socket.id);
        
        io.to(socket.id).emit('online-list', sockets);
        io.emit('new-connection', socket.id);

        socket.on('disconnect', id => {
            sockets = sockets.filter(socket => socket != id);
            io.emit('disconnect-client', id);
        })

        socket.on('offer', payload => {
            io.to(payload.target).emit('offer', payload);
        })

        socket.on('answer', payload => {
            io.to(payload.target).emit('answer', payload);
        })

        socket.on('answer-received', id => {
            io.to(id).emit('answer-received', socket.id)
        })

        socket.on('ice-candidate', incoming => {
            io.to(incoming.target).emit('ice-candidate', incoming.candidate);
        })

        socket.on('disconnect-peer', message => {
            io.to(message.target).emit('disconnect-peer', message);
        })
    })
}