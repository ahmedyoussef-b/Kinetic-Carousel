
import { Handler } from '@netlify/functions';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { eventName, channel, data } = JSON.parse(event.body || '{}');

    if (!eventName || !channel) {
      return {
        statusCode: 400,
        body: 'Missing required parameters: eventName or channel'
      };
    }

    await pusher.trigger(channel, eventName, data);

    return {
      statusCode: 200,
      body: 'Event triggered successfully'
    };
  } catch (error) {
    console.error('Error triggering Pusher event:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
