import nodeMailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async (to, name, registerid) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0; background:#0a0a0f;">
    <div style="background:#0a0a0f; padding:32px 16px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:600px; margin:0 auto; border-radius:12px; overflow:hidden; border:1px solid #2a1a4a;">

        <!-- Top gradient bar -->
        <div style="height:4px; background:linear-gradient(90deg,#7c3aed,#ec4899,#06b6d4);"></div>

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0f0820 0%,#130a2a 60%,#0a1628 100%); padding:36px 30px 28px; text-align:center; border-bottom:1px solid #1f1f3a;">
          <div style="display:inline-block; border:1px solid rgba(124,58,237,0.4); border-radius:50%; width:56px; height:56px; line-height:56px; font-size:26px; margin-bottom:18px; background:rgba(124,58,237,0.12);">&#9889;</div>
          <h1 style="margin:0 0 10px; color:#e879f9; font-size:22px; letter-spacing:3px; text-transform:uppercase; font-weight:700; font-family:'Press Start 2P', 'Courier New', monospace; line-height:1.4;">PROVENANCE 6.0</h1>
          <p style="color:#7c6fa0; font-size:13px; margin:0; letter-spacing:2px; text-transform:uppercase;">Infinite Realms &middot; The Anime Protocol</p>
        </div>

        <!-- Main content -->
        <div style="background:#0f0f1a; padding:36px 30px;">

          <!-- Payment verified badge -->
          <div style="text-align:center; margin-bottom:28px;">
            <span style="display:inline-block; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3); border-radius:999px; padding:8px 22px; color:#06b6d4; font-size:13px; letter-spacing:1.5px; text-transform:uppercase; font-weight:600;">
              &#9679;&nbsp; Payment Verified
            </span>
          </div>

          <!-- Greeting -->
          <p style="color:#c4b5d4; font-size:16px; line-height:1.7; margin:0 0 28px;">
            Hello <strong style="color:#ffffff;">${name}</strong>,<br><br>
            Your payment for <strong style="color:#e879f9;">PROVENANCE 6.0</strong> has been successfully verified. You are now officially part of the most anticipated techno-cultural fest in Jharkhand. Get ready to enter the <strong style="color:#06b6d4;">Infinite Realms</strong>!
          </p>

          <!-- Registration details card -->
          <div style="background:linear-gradient(135deg,#0a0a18,#110a22); border-radius:10px; border:1px solid rgba(124,58,237,0.35); overflow:hidden; margin-bottom:28px;">
            <div style="background:linear-gradient(90deg,rgba(124,58,237,0.25),rgba(236,72,153,0.15)); padding:12px 20px; border-bottom:1px solid rgba(124,58,237,0.2);">
              <span style="color:#a78bfa; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-weight:600;">Your Registration Details</span>
            </div>
            <div style="padding:22px 20px;">
              <div style="margin-bottom:18px;">
                <span style="color:#6b5fa0; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; display:block; margin-bottom:6px;">Student Name</span>
                <span style="color:#ffffff; font-size:20px; font-weight:700;">${name}</span>
              </div>
              <div>
                <span style="color:#6b5fa0; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; display:block; margin-bottom:6px;">Registration ID</span>
                <span style="color:#06b6d4; font-size:26px; font-weight:800; letter-spacing:3px; font-family:monospace;">${registerid}</span>
              </div>
            </div>
          </div>

          <!-- Info hint -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:28px;">
            <tr>
              <td style="background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); border-radius:8px; padding:16px 18px;">
                <table style="width:100%; border-collapse:collapse;">
                  <tr>
                    <td style="width:28px; vertical-align:top; padding-top:2px; font-size:20px;">&#127903;</td>
                    <td style="color:#9d8fc0; font-size:14px; line-height:1.65; padding-left:12px;">
                      Keep your <strong style="color:#e2d9f3;">Registration ID</strong> handy for event check-ins and all access. Show it at the venue gate to claim your spot.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Stats row -->
          <table style="width:100%; border-collapse:separate; border-spacing:10px;">
            <tr>
              <td style="background:#0a0a18; border:1px solid #1f1a30; border-radius:8px; padding:14px 10px; text-align:center; width:33%;">
                <div style="color:#e879f9; font-size:18px; font-weight:700;">5,000+</div>
                <div style="color:#6b5fa0; font-size:11px; letter-spacing:1px; text-transform:uppercase; margin-top:4px;">Attendees</div>
              </td>
              <td style="background:#0a0a18; border:1px solid #1f1a30; border-radius:8px; padding:14px 10px; text-align:center; width:33%;">
                <div style="color:#06b6d4; font-size:18px; font-weight:700;">50+</div>
                <div style="color:#6b5fa0; font-size:11px; letter-spacing:1px; text-transform:uppercase; margin-top:4px;">Events</div>
              </td>
              <td style="background:#0a0a18; border:1px solid #1f1a30; border-radius:8px; padding:14px 10px; text-align:center; width:33%;">
                <div style="color:#a78bfa; font-size:18px; font-weight:700;">National</div>
                <div style="color:#6b5fa0; font-size:11px; letter-spacing:1px; text-transform:uppercase; margin-top:4px;">Reach</div>
              </td>
            </tr>
          </table>

        </div>

        <!-- Footer -->
        <div style="background:#070710; padding:22px 30px; text-align:center; border-top:1px solid #1a1a2e;">
          <p style="color:#4a4060; font-size:12px; margin:0 0 4px;">&copy; 2026 Provenance Organizing Committee</p>
          <p style="color:#4a4060; font-size:12px; margin:0;">RVSCET, Jamshedpur &middot; Jharkhand, India</p>
        </div>

        <!-- Bottom gradient bar -->
        <div style="height:3px; background:linear-gradient(90deg,#06b6d4,#7c3aed,#ec4899);"></div>

      </div>
    </div>
    </body>
    </html>
  `;

  transporter.sendMail({
    from: process.env.EMAIL,
    to: to,
    subject: "PROVENANCE 6.0 - Payment Verified ✅",
    html: htmlContent,
  });
};

export default sendMail;
