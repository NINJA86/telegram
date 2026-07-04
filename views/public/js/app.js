import {
  getMsg,
  getNamespaceChats,
  sendMessage,
  setCurrentUser,
  showActiveNamespace,
  showNamespaces,
} from '../../utils/funcs.js';

window.addEventListener('load', () => {
  const socket = io('http://localhost:4003', {
    withCredentials: true,
  });
  socket.on('connect_error', (err) => {
    if (err.message === 'jwt must be provided') {
      location.href = 'http://localhost:4003/login.html#';
    }
  });
  socket.on('connect', () => {
    socket.once('user:me', (userData) => {
      const { name, id, role } = userData;
      setCurrentUser({ name, id, role });
    });
    socket.once('namespaces', (namespaces) => {
      showNamespaces(namespaces, socket);
      showActiveNamespace(namespaces);
      sendMessage();
      // getMsg()
    });
  });
});
