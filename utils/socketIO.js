
module.exports = function (io) {
  io.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    socket.on('SEND_LOCATION', function(msg){
      console.info('[%s] send location', socket.id);
      console.log(msg);
      io.emit('SEND_LOCATION', msg);
    });

    // Call onDisconnect.
    socket.on('disconnect', function () {
      console.info('[%s] DISCONNECTED', socket.id);
    });

    console.info('[%s] CONNECTED', socket.id);
  });
};