import nodemailer from "nodemailer";

/**
 * Asynchronously creates and configures a mail transporter using nodemailer.
 *
 * @return {Promise<nodemailer.Transporter>} A Promise that resolves to the configured mail transporter.
 */
export async function getMailClient() {
  const account = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass, // generated ethereal password
    },
  });

  return transporter;
}