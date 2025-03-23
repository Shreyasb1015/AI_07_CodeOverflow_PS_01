import nodemailer from "nodemailer";

const sendVerificationEmail = async (userEmail, otp, name) => {
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
              color: #FFA500; /* Orange text */
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
              <h1>Welcome to EchoMind!</h1>
          </div>
          <div class="content">
              <p style="color: #FFA500;">Hi <strong>${name}</strong>,</p>
              <p style="color: #FFA500;">We're excited to have you on board. Please use the OTP below to verify your email address and activate your account:</p>
              <div class="otp">${otp}</div>
              <p style="color: #FFA500;">If you did not request this, please ignore this email or contact us immediately.</p>
              <p style="color: #FFA500;">We're here to help if you have any questions. 😊</p>
          </div>
          <div class="footer">
              <p style="color: #FFA500;">Contact us at: <a href="mailto:codecommandos@gmail.com" style="color: #FFA500; text-decoration: none; font-weight: bold;">codecommandos@gmail.com</a></p>
              <p style="color: #FFA500;">Thank you for choosing our platform! 🚀</p>
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

  
const sendApologyMail = async (user_name, userEmail, issueType, description) => {
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
        subject: "Apology Mail",
        html: `<!DOCTYPE html>
  <html>
  <head>
      <title>Apology for AI Misbehavior</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #000; color: #FFA500; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; padding: 20px; background-color: #000; border: 3px solid #FFA500; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(255, 165, 0, 0.6);">
          <div style="background-color: #FFA500; padding: 15px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
              <h1 style="margin: 0; color: #000;">Apology from EchoMind</h1>
          </div>
          <div style="padding: 30px 20px;">
              <p style="color: #FFA500;">Dear <strong>${user_name}</strong>,</p>
              <p style="color: #FFA500;">We sincerely apologize for the issue you encountered while interacting with our AI.</p>
              <div style="background-color: #FFA500; color: #000; font-weight: bold; padding: 12px 20px; border-radius: 8px; margin: 20px 0; font-size: 18px;">
                  Issue Type: <strong>${issueType}</strong>
              </div>
              <p style="color: #FFA500;">Description: <strong>${description}</strong></p>
              <p style="color: #FFA500;">We take such matters very seriously and are actively working on improvements to ensure this does not happen again.</p>
              <p style="color: #FFA500;">If you have any further concerns, please do not hesitate to reach out to us.</p>
              <p style="color: #FFA500;">We truly appreciate your patience and understanding. 🙏</p>
          </div>
          <div style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
              <p style="color: #FFA500;">Contact us at: <a href="mailto:codecommandos@gmail.com" style="color: #FFA500; text-decoration: none; font-weight: bold;">codecommandos@gmail.com</a></p>
              <p style="color: #FFA500;">Thank you for being a valued user. 🚀</p>
          </div>
      </div>
  </body>
  </html>
        `,
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`Apology email sent to ${userEmail}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send apology email");
    }
  };
export { sendVerificationEmail,sendApologyMail };
