// "use strict";
const activeUsers = new Set();
const onlineUsers = {};
const config = require('./config/config');
const request = require('./middleware/axios-request');

module.exports = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    },
  });

  io.use((socket, next) => {
    console.log('socket.handshake.query');
    // logger.info(
    //   `REQ [${socket.id}] [WS] ${socket.handshake.url} ${JSON.stringify(
    //     socket.handshake
    //   )}`
    // );
    next();
  });

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('getRoom', async ({ userId, pageNo, pageSize, roomType }) => {
      console.log('userId', userId, `${config.databaseUrl}/chat/get-rooms`);
      try {
        const room = await request.post(
          null,
          `${config.databaseUrl}/chat/get-rooms?pageNo=${pageNo}&pageSize=${pageSize}`,
          {
            userId,
            roomType,
          }
        );
        console.log('room', room);
        socket.emit('getRoomsList', room);
      } catch (error) {
        console.log('error', error);
      }
    });

    socket.on('createRoom', async ({ senderId, receiverId, roomType }) => {
      console.log(`${config.databaseUrl}/chat/create-room`);
      try {
        const createRoom = await request.post(null, `${config.databaseUrl}/chat/create-room`, {
          senderId,
          receiverId,
          roomType,
        });
        console.log('room', createRoom);
        socket.emit('getRoomInfo', createRoom);
      } catch (error) {
        console.log('error', error);
      }
    });

    socket.on('addMessage', async ({ userId, receiverId, room, message, subject, attachments, reply_to }) => {
      console.log(`${config.databaseUrl}/chat/add-message`);
      try {
        const createRoom = await request.post(null, `${config.databaseUrl}/chat/add-message`, {
          userId,
          room,
          message,
          subject,
          attachments,
          reply_to,
        });
        const history = await request.post(null, `${config.databaseUrl}/chat/message-history`, { room, userId });
        const history1 = await request.post(null, `${config.databaseUrl}/chat/message-history`, {
          room,
          userId: receiverId,
        });
        console.log('room', history);
        io.in(userId).emit('chatHistory', history);
        io.in(receiverId).emit('chatHistory', history1);
        io.in(receiverId).emit('checkRoomList', {});
        io.in(userId).emit('checkRoomList', {});
      } catch (error) {
        console.log('error', error);
      }
    });
    socket.on('leaveRoom', async ({ roomId }) => {
      console.log('leaveRoom', roomId);
      socket.leave(roomId);
    });

    console.log('onlineUsers----global', onlineUsers);
    socket.on('join', async ({ room, userId, pageNo, pageSize }) => {
      try {
        socket.roomId = room;
        console.log(room, 'joined');
        socket.join(room);
        const history = await request.post(
          null,
          `${config.databaseUrl}/chat/message-history?pageNo=${pageNo}&pageSize=${pageSize}`,
          { room, userId }
        );
        io.in(room).emit('chatHistory', history);
      } catch (error) {
        console.log('error', error);
      }
    });
    socket.on('selfJoin', async ({ userId }) => {
      try {
        socket.userId = userId;
        socket.join(userId);
      } catch (error) {
        console.log('error', error);
      }
    });
    socket.on('getChatHistory', async ({ room, userId, pageNo, pageSize }) => {
      try {
        const history = await request.post(
          null,
          `${config.databaseUrl}/chat/message-history?pageNo=${pageNo}&pageSize=${pageSize}`,
          { room, userId }
        );
        socket.emit('chatHistory', history);
      } catch (error) {
        console.log('error', error);
      }
    });
  });
};
