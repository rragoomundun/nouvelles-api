import fs from 'fs';
import nodemailer from 'nodemailer';
import mustache from 'mustache';

import dbUtil from './db.util.js';
import { ses, clientSES } from './aws.util.js';

const transporter = nodemailer.createTransport({
  SES: { ses, aws: clientSES },
  sendingRate: 1
});

const send = async (options) => {
  const { mail, userId } = options;

  const user = await dbUtil.User.findOne({ where: { id: userId } });
  const { name } = user;
  const to = user.email;

  const mailData = JSON.parse(fs.readFileSync(`mails/definitions/${mail}.json`));
  const templateName = mailData.template;
  let templateOptions = options.templateOptions;

  if (!templateOptions) {
    templateOptions = {};
  }

  templateOptions.name = name;
  templateOptions.title = mailData.title;
  templateOptions.year = new Date().getFullYear();
  templateOptions.imgBucket = process.env.AWS_S3_IMAGE_BUCKET_NAME;
  templateOptions.s3region = process.env.AWS_S3_REGION;

  const template =
    fs.readFileSync(`mails/views/header.html`, 'utf-8') +
    fs.readFileSync(`mails/views/${templateName}.html`, 'utf-8') +
    fs.readFileSync(`mails/views/footer.html`, 'utf-8');

  const message = {
    to,
    replyTo: process.env.REPLY_EMAIL,
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    html: mustache.render(template, templateOptions),
    subject: templateOptions.title
  };

  await transporter.sendMail(message);
};

export { send };
