const { default: mongoose } = require('mongoose');
const app = require('./app');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const socketIoInit = require('./utils/socketConnection');
const socketFunctions = require('./socket.io/index');

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('mongoDb connected successfully');
  } catch (error) {
    console.log(`error has occured during running db: ${error}`);
    process.exit(1);
  }
};

const startServer = () => {
  const port = process.env.PORT || 4003;
  const server = http.createServer(app);
  const io = socketIoInit(server);
  socketFunctions(io);
  server.listen(port, () => {
    console.log(`server running on ${port}`);
  });
};

const run = async () => {
  await dbConnection();
  startServer();
};

run();
