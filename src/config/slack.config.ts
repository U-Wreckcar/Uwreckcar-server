import { WebClient } from '@slack/web-api';

const { SLACKBOT_TOKEN, CHANNEL_ID } = process.env;

const slack = new WebClient(SLACKBOT_TOKEN);

export default async (sender: string, message: string) => {
  try {
    const result = await slack.chat.postMessage({
      text : `${sender}:\n${message}`,
      channel : `${CHANNEL_ID}`,
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
};
