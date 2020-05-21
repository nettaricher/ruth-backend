const amqp = require('amqplib/callback_api');

const CONN_URL = 'amqp://qfrftznl:gVWftNle39STIm0A2Gdclre7Nja4W5Qk@orangutan.rmq.cloudamqp.com/qfrftznl';
let ch = null;
amqp.connect(CONN_URL, function (err, conn) {
   conn.createChannel(function (err, channel) {
      ch = channel;
   });
});
module.exports = publishToQueue = async (queueName, data) => {
   ch.sendToQueue(queueName, new Buffer(data));
}
process.on('exit', (code) => {
   ch.close();
   console.log(`Closing rabbitmq channel`);
});

process.on('error', (code) => {
   console.log(code);
});