const { Types } = require('mongoose');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const {
  NameSpaceModel: namespaceModel,
  MessageModel: messageModel,
  RoomModel: roomModel,
} = require('../Models/Chat');
const getTotalClients = require('./getTotalClients');
let totalClientsCount = 0;
const getOnlineUsersInRooms = (io, namespace, roomId) => {
  setTimeout(() => {
    const roomUsers =
      io.of(namespace.href).adapter.rooms.get(roomId)?.size || 0;
    io.of(namespace.href).to(roomId).emit('user:online', roomUsers);
  }, 100);
};
const getTheLatestRoom = (socket, getOnlineUsersCb) => {
  const lastRoom = [...socket.rooms].find((room) => room !== socket.id);
  if (lastRoom) {
    socket.leave(lastRoom);

    getOnlineUsersCb(lastRoom);
  }
};

const namespaceConnection = (io, namespaces) => {
  namespaces.forEach((namespace) => {
    io.of(namespace.href).on('connection', (socket) => {
      socket.emit('namespace:rooms', namespace.rooms);
      socket.on('room:join', async (roomId) => {
        const room = await roomModel.findById(roomId).populate('messages');

        getTheLatestRoom(socket, (lastRoom) =>
          getOnlineUsersInRooms(io, namespace, lastRoom),
        );
        socket.join(roomId);

        socket.removeAllListeners('start:typing');
        socket.removeAllListeners('stop:typing');
        socket.on('start:typing', ({ name, id, room }) => {
          socket.in(room).emit('isTyping', { name, id, isTyping: true });
        });
        socket.on('stop:typing', ({ room }) => {
          socket.in(room).emit('isTyping', { isTyping: false });
        });
        socket.emit('room:messages', room.messages);
        socket.emit('room:info', room);
        socket.on('disconnect', () => {
          getOnlineUsersInRooms(io, namespace, roomId);
        });
        getOnlineUsersInRooms(io, namespace, roomId);

        socket.removeAllListeners('message:send');

        socket.on('message:send', async ({ message, currentRoomId }) => {
          const newMessage = await messageModel.create({
            sender: socket.user.id,
            room: currentRoomId,
            message: message,
          });

          await roomModel.updateOne(
            { _id: new Types.ObjectId(currentRoomId) },
            {
              $push: {
                messages: newMessage,
              },
            },
          );

          io.of(namespace.href).in(currentRoomId).emit('confirmMsg', {
            message,
            currentRoomId,
            sender: socket.user.id,
          });
        });
      });
    });
  });
};

exports.initConnection = async (io) => {
  const authentication = async (socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error('cookie not found!'));
    }
    const cookies = cookie.parse(cookieHeader);
    const accessToken = cookies.accessToken;
    try {
      const decode = await jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      );
      socket.user = decode;
      return next();
    } catch (error) {
      return next(error);
    }
    return next();
  };
  io.use(authentication);

  const namespaces = await namespaceModel
    .find({})
    .populate('rooms')
    .sort({ _id: -1 });
  namespaces.forEach((namespace) => io.of(namespace.href).use(authentication));
  namespaceConnection(io, namespaces);
  io.on('connection', async (socket) => {
    totalClientsCount = getTotalClients(io);
    socket.on('disconnect', () => {
      totalClientsCount = getTotalClients(io);
    });
    socket.emit('user:me', socket.user);
    socket.emit('namespaces', namespaces);
  });
};
