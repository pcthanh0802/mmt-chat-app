require('dotenv').config();

const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes');

// middlewares
app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('combined'));
app.use(helmet());


// routes
app.use('/api/auth', routes.auth);
app.use('/api/user', routes.user);
app.use('/api/friends-request', routes.friendRequest);

module.exports = app;