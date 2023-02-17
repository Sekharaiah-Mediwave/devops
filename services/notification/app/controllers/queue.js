const { amqp } = require('../services/imports');
const request = require('../middleware/axios-request');
const config = require('../config/config');
const commonService = require('../services/common-service');
// function updateDatabase(receivedData) {
//   return request.post({}, `${config.databaseUrl}/auth/update/queue/${receivedData.id}`, receivedData);
// }

async function TriggerAction(receivedData) {
  try {
    if (receivedData) {
      const header =
        receivedData.payload && receivedData.payload.token
          ? { headers: { authorization: receivedData.payload.token } }
          : {};
      await request
        .post({}, `${receivedData.url}`, receivedData.payload, header)
        .then(async (data) => {
          console.log('--------success--------',data);
          // receivedData.status = 'completed';
          // await updateDatabase(receivedData);
        })
        .catch(async (error) => {
          console.log('--------error--------',error);
          // receivedData.status = 'pending';
          // receivedData.retryCount += 1;
          // await updateDatabase(receivedData);
        });
    }
  } catch (e) {
    console.log('--------e--------', e);
  }
}

amqp.connect(config.amqp_url, async (error, connection) => {
  if (error) {
    return console.error('Unable to connect with Queue[RabbitMQ]:', error);
  }
  return connection.createChannel((error1, channel) => {
    if (error1) {
      return console.error('Unable to create channel:', error1);
    }
    const queue = config.notificationChannel;
    channel.assertQueue(queue, {
      durable: true,
    });

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
    return channel.consume(
      queue,
      async (msg) => {
        const receivedData = JSON.parse(msg.content.toString());
        console.log(' [x] Received %s', receivedData);
        await TriggerAction(receivedData);
      },
      {
        noAck: true,
      }
    );
  });
});
