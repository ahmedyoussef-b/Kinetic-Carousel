
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
    const { socket_id, channel_name, user_id, user_info } = JSON.parse(event.body || '{}');

    if (!socket_id || !channel_name || !user_id) {
      return {
        statusCode: 400,
        body: 'Missing required parameters: socket_id, channel_name, or user_id'
      };
    }

    const presenceData = {
      user_id,
      user_info: user_info || {} // Optional: include additional user data
    };

    const auth = pusher.authenticate(socket_id, channel_name, presenceData);

    return {
      statusCode: 200,
      body: JSON.stringify(auth)
    };
  } catch (error) {
    console.error('Error authenticating Pusher user:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
