const { initConnection } = require('./namespaces.socket');

module.exports = (io) => {
  initConnection(io);
};
