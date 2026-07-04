const { Server } = require('socket.io');

module.exports = (httpServer) => {
  let io = new Server(httpServer, {
    cors: { credentials: true, origin: true },
  });

  return io;
};
