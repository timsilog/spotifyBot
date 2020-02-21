import * as nodemailer from 'nodemailer';
import * as options from '../options.json';

export const sendEmail = async (msg: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: options.email,
      clientId: options.gmailClientId,
      clientSecret: options.gmailClientSecret,
      refreshToken: options.gmailRefreshToken,
      accessToken: options.gmailAccessToken
    }
  });

  const mailOptions = {
    from: options.email,
    to: options.email,
    subject: 'Error from Spotify Bot',
    text: msg
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}