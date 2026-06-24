import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Check if credentials are placeholders
  const isPlaceholder = 
    !process.env.EMAIL_USER || 
    process.env.EMAIL_USER.includes('placeholder') || 
    !process.env.EMAIL_PASS || 
    process.env.EMAIL_PASS.includes('placeholder');

  if (isPlaceholder) {
    console.log('\n=================== DEV MODE EMAIL LOG ===================');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log('===========================================================\n');
    return {
      success: true,
      devMode: true,
      info: 'Email logged to console (developer mode fallback)'
    };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@authsystem.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent successfully: ${info.messageId}`);
  return {
    success: true,
    devMode: false,
    info: info.messageId
  };
};

export default sendEmail;
