require('dotenv').config();

const app = require('./app');
const { Server } = require('socket.io');


// initiate http server
const port = process.env.PORT || 1510;
const server = app.listen(port, () => {
    console.log(`Server is listening to port ${port}...`);
});

const io = new Server(server, {
    cors: { origin: true },
    maxHttpBufferSize: 25e6 // 25 MB
});
require('./socket')(io);

