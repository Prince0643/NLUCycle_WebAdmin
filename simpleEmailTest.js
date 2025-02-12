const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service provider
  auth: {
    user: 'tolentinochristian89@gmail.com', // Your email address
    pass: 'princetolentino6' // Your email password or app password
  }
});

// Define the email options
const mailOptions = {
  from: 'tolentinochristian89@gmail.com', // Sender address
  to: 'princechristiane.tolentino@student.dmmmsu.edu.ph', // Replace with the recipient's email address
  subject: 'Test Email', // Subject line
  text: 'This is a test email sent from Nodemailer!' // Plain text body
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Error occurred: ' + error.message);
  }
  console.log('Email sent: ' + info.response);
});