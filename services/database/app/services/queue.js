const { amqp } = require('./imports');
const config = require('../config/config');

let channel;
amqp.connect(config.amqp_url, (error, connection) => {
  if (error) {
    return console.error('Unable to connect with Queue[RabbitMQ]:', error);
  }
  return connection.createChannel((error1, ch) => {
    if (error1) {
      throw error1;
    }
    channel = ch;
    channel.assertQueue("notify-queue", {
      durable: true,
    });
  });
});

module.exports = {
  AddToQueue: async (payload) => {
    console.log('--------payload-to-queue-------', payload);
    channel.sendToQueue(payload.queueKeyName, Buffer.from(JSON.stringify(payload)));
    console.log(' [x] Sent %s', payload.queueKeyName, payload);
  },
};
