import nodemailer from "nodemailer";

const sendVerificationEmail = async (userEmail,otp,name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS_KEY,
      },
    });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Email Verification",
    html: `
    <!DOCTYPE html>
<html>
<head>
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #000; /* Black background */
            color: #fff; /* White text */
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            background-color: #000; /* Black */
            border: 3px solid #FFA500; /* Orange Border */
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(255, 165, 0, 0.6); /* Orange glow */
        }
        .header {
            background-color: #FFA500; /* Orange */
            padding: 15px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
        }
        .header h1 {
            margin: 0;
            color: #000; /* Black text */
        }
        .content {
            padding: 30px 20px;
        }
        .otp {
            display: inline-block;
            background-color: #FFA500; /* Orange */
            color: #000; /* Black text */
            font-weight: bold;
            padding: 12px 20px;
            border-radius: 8px;
            letter-spacing: 3px;
            margin: 20px 0;
            font-size: 24px;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.8;
        }
        .footer a {
            color: #FFA500;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Platform!</h1>
        </div>
        <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>We're excited to have you on board. Please use the OTP below to verify your email address and activate your account:</p>
            <div class="otp">${otp}</div>
            <p>If you did not request this, please ignore this email or contact us immediately.</p>
            <p>We're here to help if you have any questions. 😊</p>
        </div>
        <div class="footer">
            <p>Contact us at: <a href="mailto:codecommandos@gmail.com">codecommandos@gmail.com</a></p>
            <p>Thank you for choosing our platform! 🚀</p>
        </div>
    </div>
</body>
</html>

  `,
  };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};

export { sendVerificationEmail };
