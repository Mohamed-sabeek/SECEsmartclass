/**
 * Template for session start notification
 * @param {Object} data - subject, startTime, joinUrl
 * @returns {string} HTML string
 */
const sessionStartTemplate = ({ subject, startTime, joinUrl }) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    <div style="background: #1a1a1a; padding: 30px; text-align: center;">
      <h1 style="color: #ffd700; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">SECE SmartClass</h1>
    </div>
    
    <div style="padding: 40px; background: #ffffff;">
      <div style="margin-bottom: 25px;">
        <span style="background: #fff9e6; color: #d4af37; padding: 5px 15px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #ffd70044;">📢 Live Broadcast Started</span>
      </div>
      
      <h2 style="color: #1a1a1a; font-size: 28px; font-weight: 900; margin: 0 0 10px 0; line-height: 1.2;">Your session for <span style="color: #d4af37;">${subject}</span> has begun.</h2>
      <p style="color: #666; font-size: 16px; margin-bottom: 30px;">The instructor has started the live session. Join now to participate and record your attendance.</p>
      
      <div style="background: #f8f8f8; padding: 25px; border-radius: 15px; margin-bottom: 35px; border-left: 4px solid #ffd700;">
        <div style="margin-bottom: 10px;">
          <p style="margin: 0; font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px;">Session Subject</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${subject}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px;">Start Time</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${startTime}</p>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${joinUrl}" 
           style="display: inline-block; background: #1a1a1a; color: #ffd700; padding: 18px 40px; border-radius: 15px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: all 0.3s ease;">
           Enter Live Room
        </a>
      </div>
    </div>
    
    <div style="background: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0;">
      <p style="margin: 0; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} SECE SmartClass. All academic records are logged.</p>
    </div>
  </div>
`;

const sessionScheduledTemplate = ({ subject, teacherName, className, scheduledDate, startTime, endTime }) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    <div style="background: #1a1a1a; padding: 30px; text-align: center;">
      <h1 style="color: #ffd700; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">SECE SmartClass</h1>
    </div>
    
    <div style="padding: 40px; background: #ffffff;">
      <div style="margin-bottom: 25px;">
        <span style="background: #fff9e6; color: #d4af37; padding: 5px 15px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #ffd70044;">📅 Upcoming Class Scheduled</span>
      </div>
      
      <h2 style="color: #1a1a1a; font-size: 28px; font-weight: 900; margin: 0 0 10px 0; line-height: 1.2;">Your <span style="color: #d4af37;">${subject}</span> class has been scheduled.</h2>
      <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Your instructor, ${teacherName}, has scheduled an upcoming session for ${className}.</p>
      
      <div style="background: #f8f8f8; padding: 25px; border-radius: 15px; margin-bottom: 35px; border-left: 4px solid #ffd700;">
        <div style="margin-bottom: 10px;">
          <p style="margin: 0; font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px;">Scheduled Date</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${scheduledDate}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px;">Time</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${startTime} - ${endTime}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/student/dashboard" 
           style="display: inline-block; background: #1a1a1a; color: #ffd700; padding: 18px 40px; border-radius: 15px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: all 0.3s ease;">
           View Dashboard
        </a>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px; font-weight: 600;">You will receive another notification when the session is live.</p>
    </div>
    
    <div style="background: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0;">
      <p style="margin: 0; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} SECE SmartClass. All academic records are logged.</p>
    </div>
  </div>
`;

module.exports = { sessionStartTemplate, sessionScheduledTemplate };
