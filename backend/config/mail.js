import nodeMailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async (to, name, registerid) => {
  const htmlContent = `
    <div style="background-color: #050505; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f13; border-radius: 8px; overflow: hidden; border: 1px solid #1f1f2e;">
        <!-- Header -->
        <div style="text-align: center; padding: 30px 20px; border-bottom: 1px solid #1f1f2e;">
          <h1 style="margin: 0; color: #ff66cc; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">PROVENANCE 6.0</h1>
          <p style="color: #8888aa; font-size: 14px; margin-top: 10px; margin-bottom: 0;">Infinite Realms - The Anime Protocol</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="background-color: #16161e; border-radius: 6px; padding: 25px; border-top: 3px solid #00e5ff; margin-bottom: 25px;">
            <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 15px; margin-top: 0;">Payment Verified!</h2>
            <p style="color: #b0b0c0; line-height: 1.6; margin-bottom: 25px; font-size: 15px;">
              Hello <strong style="color: #ffffff;">${name}</strong>,<br><br>
              We are thrilled to inform you that your payment for PROVENANCE 6.0 has been successfully verified. You are now officially registered for the event.
            </p>
            
            <div style="background-color: #0a0a0f; border-radius: 6px; padding: 20px; margin-bottom: 25px; border: 1px solid #1f1f2e;">
              <div style="margin-bottom: 15px;">
                <span style="color: #8888aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Student Name</span>
                <span style="color: #ffffff; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${name}</span>
              </div>
              <div>
                <span style="color: #8888aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Registration ID</span>
                <span style="color: #00e5ff; font-size: 22px; font-weight: bold; letter-spacing: 2px;">${registerid}</span>
              </div>
            </div>
            
            <p style="color: #b0b0c0; line-height: 1.6; margin-bottom: 0; font-size: 15px;">
              Please keep this Registration ID handy for all event-related access. Get ready to experience the infinite realms!
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #555566; font-size: 12px; border-top: 1px solid #1f1f2e; background-color: #0a0a0f;">
          &copy; 2026 Provenance Organizing Committee.<br>RVSCET, Jamshedpur
        </div>
      </div>
    </div>
  `;

  transporter.sendMail({
    from: process.env.EMAIL,
    to: to,
    subject: "PROVENANCE 6.0 - Payment Verified",
    html: htmlContent,
  });
};

export default sendMail;
