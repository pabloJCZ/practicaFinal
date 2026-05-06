import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });
};

export const sendVerificationEmail = async (email, code) => {
  if (!config.mail.user || config.nodeEnv === 'test') {
    console.log(`[MAIL DEV] Código de verificación para ${email}: ${code}`);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"BildyApp" <${config.mail.user}>`,
    to: email,
    subject: 'Verifica tu cuenta en BildyApp',
    html: `<h1>${code}</h1>`,
  });
};

export const sendPasswordResetEmail = async (email, code) => {
  if (!config.mail.user || config.nodeEnv === 'test') {
    console.log(`[MAIL DEV] Código de reset para ${email}: ${code}`);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"BildyApp" <${config.mail.user}>`,
    to: email,
    subject: 'Restablece tu contraseña en BildyApp',
    html: `<h1>${code}</h1>`,
  });
};