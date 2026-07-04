const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

const NameSpaceRouter = require('./routes/Namespace');
const RoomRouter = require('./routes/Room');
const UserRouter = require('./routes/User');
const authenticate = require('./middleware/authenticated');

//* CORS *//
app.use(
  cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
  }),
);

//* Parsing Middleware *//
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

//* Static Files *//
app.use(express.static(path.join(__dirname, 'views')));

//* Routes *//
app.use('/api/namespaces', authenticate, NameSpaceRouter);
app.use('/api/rooms', authenticate, RoomRouter);
app.use('/api/users', UserRouter);

module.exports = app;
