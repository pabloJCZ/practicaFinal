import { config } from '../config/index.js';

export const logErrorToSlack = async (err, req) => {
  if (!config.slack.webhookUrl) return;

  const payload = {
    text: '🚨 *Error 5XX en BildyApp*',
    attachments: [
      {
        color: 'danger',
        fields: [
          { title: 'Timestamp', value: new Date().toISOString(), short: true },
          { title: 'Método HTTP', value: req.method, short: true },
          { title: 'Ruta', value: req.originalUrl, short: true },
          { title: 'Status Code', value: String(err.statusCode || 500), short: true },
          { title: 'Error', value: err.message || 'Sin mensaje' },
          { title: 'Stack', value: err.stack ? err.stack.substring(0, 500) : 'N/A' },
        ],
      },
    ],
  };

  try {
    await fetch(config.slack.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (slackErr) {
    console.error('Error enviando a Slack:', slackErr.message);
  }
};
