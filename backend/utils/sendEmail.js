const nodemailer = require("nodemailer");

const getEmailConfig = () => {
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS;
  const emailHost =
    process.env.EMAIL_HOST || (emailUser && emailUser.endsWith("@gmail.com") ? "smtp.gmail.com" : "");
  const emailPort = Number(
    process.env.EMAIL_PORT || (emailHost === "smtp.gmail.com" ? 465 : 587),
  );
  const fromName = process.env.FROM_NAME || "MultiVendor";
  const fromEmail = process.env.FROM_EMAIL || emailUser;

  const missingKeys = [];
  if (!emailHost) missingKeys.push("EMAIL_HOST");
  if (!emailUser) missingKeys.push("EMAIL_USER or GMAIL_USER");
  if (!emailPass) missingKeys.push("EMAIL_PASS or GMAIL_PASS");
  if (!fromEmail) missingKeys.push("FROM_EMAIL");
  if (!emailPort || Number.isNaN(emailPort)) missingKeys.push("EMAIL_PORT");

  if (missingKeys.length > 0) {
    throw new Error(`Email configuration is incomplete: ${missingKeys.join(", ")}`);
  }

  return {
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    fromName,
    fromEmail,
  };
};

const sendEmail = async (options) => {
  const emailConfig = getEmailConfig();
  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
  });

  const message = {
    from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
