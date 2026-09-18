import nodemailer from "nodemailer";

export const INFORMED_CONSENT_FORM_URL =
  process.env.INFORMED_CONSENT_FORM_URL || "https://forms.gle/1H1DAPQ8x51Hdp5f8";

export interface BookingEmailData {
  bookingId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes?: number; // e.g. 50
  format: string;
  price?: number;
  paymentStatus?: string;
  meetingLink?: string;
  clientMessage?: string;
}

export interface EnquiryEmailData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/**
 * Creates and returns a Nodemailer transporter configured for Gmail SMTP.
 * Returns null if credentials are not configured.
 */
function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ""), // Support both spaced "abcd efgh ijkl mnop" and unspaced
    },
  });
}

/**
 * Verify SMTP connection and credentials
 */
export async function verifyEmailConnection(): Promise<{ success: boolean; message: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: false,
      message: "EMAIL_USER or EMAIL_APP_PASSWORD is not configured in .env.local",
    };
  }

  try {
    await transporter.verify();
    return { success: true, message: "Gmail SMTP connection successfully verified." };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to verify SMTP connection" };
  }
}

/**
 * Send a quick test email
 */
export async function sendTestEmail(targetEmail?: string): Promise<{ success: boolean; message: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: false,
      message: "EMAIL_USER or EMAIL_APP_PASSWORD is not configured in .env.local",
    };
  }

  const to = targetEmail || process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER;
  try {
    await transporter.sendMail({
      from: `"Aswathy Practice Test" <${process.env.EMAIL_USER}>`,
      to,
      subject: "✅ Gmail SMTP Connection Test - Aswathy Counselling Website",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #2d3748;">
          <h2 style="color: #2f4f4f;">Gmail SMTP is Working! 🎉</h2>
          <p>Your Next.js website backend is now successfully connected to Gmail SMTP.</p>
          <p>Enquiry notifications, client auto-replies, and booking confirmation emails will now send automatically from this account.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #718096;">Sent from your Next.js backend at ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    return { success: true, message: `Test email sent successfully to ${to}` };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to send test email" };
  }
}


// ---------------------------------------------------------------------------
// 1. BOOKING EMAILS
// ---------------------------------------------------------------------------

/**
 * Send booking confirmation email to the client
 */
export async function sendBookingConfirmationToClient(data: BookingEmailData): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[Email Service] EMAIL_USER or EMAIL_APP_PASSWORD is not set. Skipping client booking confirmation email.");
    return false;
  }

  const senderEmail = process.env.EMAIL_USER;
  const isOnline = data.format.toLowerCase() !== "in-person";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Choosing Us - Session Confirmation</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; border-spacing: 0;">
    <!-- Header -->
    <tr>
      <td style="background-color: #2f4f4f; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">Aswathy</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #d1fae5; text-transform: uppercase; letter-spacing: 1px;">Counselling Psychologist &amp; Psychotherapist</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 13px; font-weight: 600; padding: 4px 14px; border-radius: 9999px; border: 1px solid #a7f3d0;">
            ✓ Payment Received • Session Confirmed
          </span>
          <h2 style="color: #0f172a; margin: 12px 0 6px; font-size: 22px;">Your counselling session is confirmed</h2>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Booking Reference: <strong>${data.bookingId || "Confirmed"}</strong></p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Dear <strong>${data.clientName}</strong>,<br><br>
          Your counselling session has been successfully booked and your payment has been received.
        </p>

        <h3 style="font-size: 15px; color: #0f172a; margin: 20px 0 10px 0;">Booking Details</h3>

        <table style="width: 100%; margin: 0 0 20px 0; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;"><strong>Service</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;"><strong>Date</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.appointmentDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;"><strong>Time</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.appointmentTime}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;"><strong>Duration</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.durationMinutes || 50} minutes</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;"><strong>Payment Status</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #047857; font-weight: 700;">✓ Paid${data.price ? ` (₹${data.price})` : ""}</span>
            </td>
          </tr>
          ${data.meetingLink && data.meetingLink.startsWith("http") ? `
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b;"><strong>Google Meet Link</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600;"><a href="${data.meetingLink}" style="color: #059669;">${data.meetingLink}</a></td>
          </tr>` : ""}
        </table>

        ${data.meetingLink && data.meetingLink.startsWith("http") ? `
        <!-- Google Meet Video Room Card -->
        <div style="background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.5px;">Your Google Meet Session</p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">A Google Calendar invitation has been sent. You can join your confidential consultation directly via the link below:</p>
          <a href="${data.meetingLink}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            📹 Join Google Meet Session
          </a>
          <p style="margin: 12px 0 0; font-size: 12px; color: #64748b; word-break: break-all;">Direct link: <a href="${data.meetingLink}" style="color: #059669;">${data.meetingLink}</a></p>
        </div>` : ""}

        <!-- Informed Consent Form Card -->
        <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">📋 Mandatory Pre-Session Step</p>
          <h3 style="margin: 0 0 10px; font-size: 17px; color: #0f172a; font-weight: 700;">Informed Consent Form</h3>
          <p style="margin: 0 0 16px; font-size: 14px; color: #334155; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
            Prior to your session, please take a moment to review and complete the Informed Consent Form. This ensures confidential, safe, and ethical therapeutic care.
          </p>
          <a href="${INFORMED_CONSENT_FORM_URL}" target="_blank" style="display: inline-block; background-color: #2f4f4f; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            📝 Fill Informed Consent Form
          </a>
          <p style="margin: 12px 0 0; font-size: 12px; color: #64748b; word-break: break-all;">
            Direct link: <a href="${INFORMED_CONSENT_FORM_URL}" target="_blank" style="color: #059669; font-weight: 600;">${INFORMED_CONSENT_FORM_URL}</a>
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 14px 16px; border-radius: 8px; margin-top: 16px; font-size: 13px; color: #475569; line-height: 1.5;">
          ${isOnline
      ? (data.meetingLink && data.meetingLink.startsWith("http")
          ? "💡 <strong>Telehealth Note:</strong> Your session will be held securely via Google Meet. Please ensure a quiet, private space and a stable internet connection 5 minutes prior to start."
          : "💡 <strong>Telehealth Note:</strong> You will receive a private, encrypted Google Meet link before your scheduled session. Please ensure a quiet, private space and a stable internet connection.")
      : "💡 <strong>In-Person Note:</strong> Clinic address and directions will be confirmed with you when we contact you."}
        </div>

        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 24px;">
          Please join the session using the Google Meet link at the scheduled time.<br><br>
          If you need to reschedule or cancel your appointment, please contact us in advance at <a href="mailto:roottherapyonline@gmail.com" style="color: #2f4f4f; font-weight: 600;">roottherapyonline@gmail.com</a>.
        </p>

        <p style="margin-top: 28px; font-size: 14px; color: #334155; line-height: 1.5;">
          Thank you,<br>
          <strong>Aswathy</strong><br>
          <span style="font-size: 12px; color: #64748b;">Counselling Psychologist &amp; Psychotherapist | roottherapyonline.com</span>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
        Confidential Medical &amp; Counselling Communication. If received in error, please notify the sender immediately.
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await transporter.sendMail({
    from: `"Aswathy Jeyarajasekar" <${senderEmail}>`,
    to: data.clientEmail,
    replyTo: senderEmail,
    subject: `Your counselling session is confirmed — ${data.serviceName} on ${data.appointmentDate}`,
    html,
  });

  return true;
}

/**
 * Send welcome / booking received email to client when payment is pending
 * Explicitly notes: "Meeting details will be shared after payment confirmation"
 */
export async function sendBookingWelcomeEmailToClient(data: BookingEmailData): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[Email Service] EMAIL_USER or EMAIL_APP_PASSWORD is not set. Skipping client welcome email.");
    return false;
  }

  const senderEmail = process.env.EMAIL_USER;
  const isOnline = (data.format || "online").toLowerCase() !== "in-person";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Received - Aswathy Counselling</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; border-spacing: 0;">
    <!-- Header -->
    <tr>
      <td style="background-color: #2f4f4f; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">Aswathy</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #d1fae5; text-transform: uppercase; letter-spacing: 1px;">Counselling Psychologist &amp; Psychotherapist</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; background-color: #fefce8; color: #854d0e; font-size: 13px; font-weight: 600; padding: 4px 14px; border-radius: 9999px; border: 1px solid #fef08a;">
            ⏳ Appointment Slot Reserved • Payment Pending
          </span>
          <h2 style="color: #0f172a; margin: 12px 0 6px; font-size: 22px;">We Have Received Your Booking</h2>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Booking Reference: <strong>${data.bookingId || "Pending"}</strong></p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Dear <strong>${data.clientName}</strong>,<br><br>
          Thank you for choosing to begin your therapy journey with Aswathy. We have received your booking request and your consultation slot is reserved.
        </p>

        <!-- Meeting Details Shared After Payment Notice Box -->
        <div style="background-color: #fffbeb; border: 1.5px dashed #d97706; border-radius: 10px; padding: 18px 20px; margin: 24px 0; text-align: left;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 16px;">📌</span>
            <strong style="color: #92400e; font-size: 14px;">Meeting details will be shared after payment confirmation</strong>
          </div>
          <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.5;">
            ${isOnline 
              ? "For your online session, your private Google Meet video link and Google Calendar invitation will be generated automatically and sent to you once payment is confirmed." 
              : "Clinic arrival directions and in-person consultation details will be confirmed with you upon payment confirmation."}
          </p>
        </div>

        <h3 style="font-size: 15px; color: #0f172a; margin: 20px 0 10px 0;">Appointment Summary</h3>

        <table style="width: 100%; margin: 0 0 20px 0; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;"><strong>Service</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;"><strong>Date</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.appointmentDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;"><strong>Time</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.appointmentTime} IST</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;"><strong>Duration</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.durationMinutes || 50} minutes</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;"><strong>Modality</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${isOnline ? "100% Online Telehealth (Google Meet)" : "In-Person Consultation"}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b;"><strong>Payment Status</strong></td>
            <td style="padding: 12px 16px; font-size: 14px; color: #b45309; font-weight: 600;">
              ⏳ Pending${data.price ? ` (₹${data.price})` : ""}
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 24px;">
          If you have questions or wish to complete your payment, please reply directly to this email or connect with us on WhatsApp.<br><br>
          We look forward to supporting you.
        </p>

        <p style="margin-top: 28px; font-size: 14px; color: #334155; line-height: 1.5;">
          Warm regards,<br>
          <strong>Aswathy</strong><br>
          <span style="font-size: 12px; color: #64748b;">Counselling Psychologist &amp; Psychotherapist | roottherapyonline.com</span>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
        Confidential Medical &amp; Counselling Communication. If received in error, please notify the sender immediately.
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await transporter.sendMail({
    from: `"Aswathy Jeyarajasekar" <${senderEmail}>`,
    to: data.clientEmail,
    replyTo: senderEmail,
    subject: `Booking Received: ${data.serviceName} on ${data.appointmentDate} — Aswathy Counselling`,
    html,
  });

  return true;
}

/**
 * Send booking notification to Aswathy (Admin)
 */
export async function sendBookingAlertToAdmin(data: BookingEmailData): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const senderEmail = process.env.EMAIL_USER;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || senderEmail;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 24px;">
    <h2 style="color: #2f4f4f; margin-top: 0;">🗓️ New Booking Received</h2>
    <p>A new appointment has been confirmed on your website:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Client Name:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${data.clientName}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Client Email:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${data.clientEmail}">${data.clientEmail}</a></td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Client Phone:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.clientPhone || "Not provided"}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Service:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${data.serviceName}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Date & Time:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #047857;">${data.appointmentDate} at ${data.appointmentTime}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Format:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.format}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Payment Status:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.paymentStatus || "pending"} (₹${data.price || "N/A"})</td></tr>
      ${data.meetingLink && data.meetingLink.startsWith("http") ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #047857; font-weight: bold;">Google Meet:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="${data.meetingLink}" style="color: #047857; font-weight: bold;" target="_blank">📹 Join Google Meet Session</a></td></tr>` : ""}
      ${data.clientMessage ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Client Message:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.clientMessage}</td></tr>` : ""}
    </table>

    <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
      View all bookings in your admin dashboard at <a href="/admin/bookings">/admin/bookings</a>.
    </p>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Practice Booking System" <${senderEmail}>`,
    to: adminEmail,
    replyTo: data.clientEmail,
    subject: `🔔 New Booking: ${data.clientName} - ${data.serviceName} (${data.appointmentDate})`,
    html,
  });

  return true;
}

// ---------------------------------------------------------------------------
// 2. CONTACT / ENQUIRY EMAILS
// ---------------------------------------------------------------------------

/**
 * Send enquiry notification to Aswathy (Admin)
 */
export async function sendEnquiryNotificationToAdmin(data: EnquiryEmailData): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[Email Service] EMAIL_USER or EMAIL_APP_PASSWORD is not set. Skipping admin enquiry notification.");
    return false;
  }

  const senderEmail = process.env.EMAIL_USER;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || senderEmail;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 24px;">
    <h2 style="color: #2f4f4f; margin-top: 0;">📬 New Website Enquiry</h2>
    <p>A new enquiry was submitted through your website contact form:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 25%;">Name:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${data.name}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Phone:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.phone || "Not provided"}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Subject:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${data.subject || "General Consultation"}</td></tr>
    </table>

    <div style="margin-top: 16px;">
      <p style="color: #64748b; margin-bottom: 6px; font-size: 13px;">Message:</p>
      <div style="background-color: #f1f5f9; padding: 14px 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #1e293b; border-left: 4px solid #2f4f4f;">${data.message}</div>
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
      💡 You can hit <strong>Reply</strong> to respond directly to ${data.name} at <em>${data.email}</em>.
    </p>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Website Contact Form" <${senderEmail}>`,
    to: adminEmail,
    replyTo: data.email,
    subject: `💬 New Enquiry: ${data.name} - "${data.subject || "General Inquiry"}"`,
    html,
  });

  return true;
}

/**
 * Send enquiry auto-reply to the client
 */
export async function sendEnquiryAutoReplyToClient(data: EnquiryEmailData): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const senderEmail = process.env.EMAIL_USER;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; border-spacing: 0;">
    <tr>
      <td style="background-color: #2f4f4f; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600;">Aswathy</h1>
        <p style="margin: 4px 0 0; font-size: 12px; color: #d1fae5; text-transform: uppercase; letter-spacing: 1px;">Counselling Psychologist</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 24px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Thank You for Reaching Out</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Dear <strong>${data.name}</strong>,<br><br>
          I have received your message regarding "<strong>${data.subject || "General Consultation"}</strong>".
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          I review all enquiries personally and strive to respond within <strong>24 to 48 business hours</strong>.
        </p>
        <div style="background-color: #f8fafc; border-left: 3px solid #94a3b8; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #64748b; font-style: italic;">
          "${data.message}"
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          <strong>Please note:</strong> If you are experiencing an immediate emotional crisis or medical emergency, please contact your local 24/7 crisis helpline (such as Vandrevala Foundation at 9999 666 555 or Tele-MANAS at 14416) or visit the nearest hospital emergency room.
        </p>
        <p style="margin-top: 24px; font-size: 14px; color: #334155; line-height: 1.5;">
          Warm regards,<br>
          <strong>Aswathy</strong><br>
          <span style="font-size: 12px; color: #64748b;">roottherapyonline@gmail.com</span>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Aswathy" <${senderEmail}>`,
    to: data.email,
    replyTo: senderEmail,
    subject: `Thank you for reaching out - Aswathy`,
    html,
  });

  return true;
}

// ---------------------------------------------------------------------------
// 3. MANUAL STATUS CHANGE & RESCHEDULE EMAILS (ADMIN ACTIONS)
// ---------------------------------------------------------------------------

/**
 * Send email when admin manually confirms, completes, or cancels a booking
 */
export async function sendBookingStatusEmailToClient(
  data: BookingEmailData,
  status: "confirmed" | "completed" | "cancelled",
  note?: string
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const senderEmail = process.env.EMAIL_USER;
  const isOnline = (data.format || "online").toLowerCase() !== "in-person";

  let badgeText = "✓ Booking Confirmed • Thank You for Choosing Us";
  let badgeColor = "#047857";
  let badgeBg = "#ecfdf5";
  let badgeBorder = "#a7f3d0";
  let subject = `Thank you for choosing us! Booking Confirmed: ${data.serviceName} (${data.appointmentDate})`;
  let headline = "Thank You for Choosing Us!";
  let messageContent = `<strong>Thank you so much for choosing us!</strong> Your consultation appointment has been officially confirmed by Aswathy. <strong>We will contact you soon</strong> with full session access, preparation guidance, and your private telehealth link.`;

  if (status === "completed") {
    badgeText = "✓ Session Completed";
    badgeColor = "#1d4ed8";
    badgeBg = "#eff6ff";
    badgeBorder = "#bfdbfe";
    subject = `Thank You for Attending Your Session - Aswathy`;
    headline = "Session Completed";
    messageContent = `Thank you for taking the time for your session today. Giving yourself space to explore your thoughts and emotions is a meaningful step. If you would like to reserve a follow-up appointment or have any questions, you are welcome to schedule again anytime.`;
  } else if (status === "cancelled") {
    badgeText = "✕ Appointment Cancelled";
    badgeColor = "#b91c1c";
    badgeBg = "#fef2f2";
    badgeBorder = "#fecaca";
    subject = `Appointment Update: ${data.serviceName} Cancelled (${data.appointmentDate})`;
    headline = "Session Cancellation Notice";
    messageContent = `Your scheduled appointment on <strong>${data.appointmentDate} at ${data.appointmentTime}</strong> has been cancelled. If you would like to reschedule or choose an alternative date, please feel free to visit the website or reply to this email.`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; border-spacing: 0;">
    <tr>
      <td style="background-color: #2f4f4f; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 600;">Aswathy</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #d1fae5; text-transform: uppercase; letter-spacing: 1px;">Counselling Psychologist &amp; Psychotherapist</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 13px; font-weight: 600; padding: 4px 14px; border-radius: 9999px; border: 1px solid ${badgeBorder};">
            ${badgeText}
          </span>
          <h2 style="color: #0f172a; margin: 12px 0 6px; font-size: 20px;">${headline}</h2>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Booking Reference: <strong>${data.bookingId || "Verified"}</strong></p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Dear <strong>${data.clientName}</strong>,<br><br>
          ${messageContent}
        </p>

        <table style="width: 100%; margin: 20px 0; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;">Service</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Date</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.appointmentDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Time</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.appointmentTime}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b;">Format</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600;">
              ${isOnline ? "Online (Telehealth / Google Meet)" : "In-Person Consultation"}
            </td>
          </tr>
        </table>

        ${note ? `
        <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #854d0e; margin: 16px 0;">
          <strong>Message from Aswathy:</strong> ${note}
        </div>` : ""}

        ${status === "confirmed" ? `
        <!-- Informed Consent Form Card -->
        <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">📋 Mandatory Pre-Session Step</p>
          <h3 style="margin: 0 0 10px; font-size: 17px; color: #0f172a; font-weight: 700;">Informed Consent Form</h3>
          <p style="margin: 0 0 16px; font-size: 14px; color: #334155; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
            Prior to your session, please review and complete the Informed Consent Form. This ensures confidential, safe, and ethical therapeutic care.
          </p>
          <a href="${INFORMED_CONSENT_FORM_URL}" target="_blank" style="display: inline-block; background-color: #2f4f4f; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            📝 Fill Informed Consent Form
          </a>
          <p style="margin: 12px 0 0; font-size: 12px; color: #64748b; word-break: break-all;">
            Direct link: <a href="${INFORMED_CONSENT_FORM_URL}" target="_blank" style="color: #059669; font-weight: 600;">${INFORMED_CONSENT_FORM_URL}</a>
          </p>
        </div>` : ""}

        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 24px;">
          If you have questions or need assistance, you can reply directly to this email at any time.
        </p>

        <p style="margin-top: 28px; font-size: 14px; color: #334155; line-height: 1.5;">
          Warm regards,<br>
          <strong>Aswathy</strong><br>
          <span style="font-size: 12px; color: #64748b;">roottherapyonline@gmail.com</span>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Aswathy Jeyarajasekar" <${senderEmail}>`,
    to: data.clientEmail,
    replyTo: senderEmail,
    subject,
    html,
  });

  return true;
}

/**
 * Send email when admin reschedules a booking
 */
export async function sendBookingRescheduledEmailToClient(
  data: BookingEmailData,
  note?: string
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const senderEmail = process.env.EMAIL_USER;
  const isOnline = (data.format || "online").toLowerCase() !== "in-person";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; border-spacing: 0;">
    <tr>
      <td style="background-color: #2f4f4f; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 600;">Aswathy</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #d1fae5; text-transform: uppercase; letter-spacing: 1px;">Counselling Psychologist &amp; Psychotherapist</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 13px; font-weight: 600; padding: 4px 14px; border-radius: 9999px; border: 1px solid #fde68a;">
            🕒 Session Rescheduled
          </span>
          <h2 style="color: #0f172a; margin: 12px 0 6px; font-size: 20px;">New Appointment Time</h2>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Booking Reference: <strong>${data.bookingId || "Verified"}</strong></p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Dear <strong>${data.clientName}</strong>,<br><br>
          Your consultation appointment for <strong>${data.serviceName}</strong> has been rescheduled to a new time.
        </p>

        <table style="width: 100%; margin: 20px 0; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;">New Date</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0; color: #047857;">${data.appointmentDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">New Time</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0; color: #047857;">${data.appointmentTime}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Service</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b;">Format</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600;">
              ${isOnline ? "Online (Telehealth / Google Meet)" : "In-Person Consultation"}
            </td>
          </tr>
        </table>

        ${note ? `
        <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #475569; margin: 16px 0;">
          <strong>Note:</strong> ${note}
        </div>` : ""}

        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 24px;">
          If this new timing does not work with your schedule, please reply directly to this email so we can find a time that suits you better.
        </p>

        <p style="margin-top: 28px; font-size: 14px; color: #334155; line-height: 1.5;">
          Warm regards,<br>
          <strong>Aswathy</strong><br>
          <span style="font-size: 12px; color: #64748b;">roottherapyonline@gmail.com</span>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Aswathy Jeyarajasekar" <${senderEmail}>`,
    to: data.clientEmail,
    replyTo: senderEmail,
    subject: `Appointment Rescheduled: ${data.serviceName} (${data.appointmentDate} at ${data.appointmentTime})`,
    html,
  });

  return true;
}

// ---------------------------------------------------------------------------
// 4. PAYMENT RECEIPT / PAYMENT STATUS UPDATE EMAIL
// ---------------------------------------------------------------------------

/**
 * Send payment receipt / status email to client
 */
export async function sendPaymentReceiptEmailToClient(
  data: BookingEmailData,
  paymentStatus: "paid" | "pending" | "refunded" | string,
  note?: string
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[Email Service] SMTP not configured. Skipping payment receipt email.");
    return false;
  }

  const senderEmail = process.env.EMAIL_USER;
  const isPaid = paymentStatus === "paid";
  const isRefunded = paymentStatus === "refunded";

  let badgeText = "✓ Payment Received & Verified";
  let badgeColor = "#047857";
  let badgeBg = "#ecfdf5";
  let badgeBorder = "#a7f3d0";
  let subject = `Payment Verified: ${data.serviceName} with Aswathy (Ref #${data.bookingId || "Verified"})`;
  let headline = "Payment Verified & Received";
  let messageContent = `Thank you! Your payment of <strong>₹${data.price || 1800}</strong> for <strong>${data.serviceName}</strong> has been successfully verified and recorded in our system.`;

  if (isRefunded) {
    badgeText = "↩ Payment Refunded";
    badgeColor = "#b91c1c";
    badgeBg = "#fef2f2";
    badgeBorder = "#fecaca";
    subject = `Payment Refunded: ${data.serviceName} (Ref #${data.bookingId || "Verified"})`;
    headline = "Refund Issued";
    messageContent = `A refund of <strong>₹${data.price || 1800}</strong> has been processed for your consultation booking <strong>#${data.bookingId || ""}</strong>.`;
  } else if (!isPaid) {
    badgeText = "⏳ Payment Pending Settlement";
    badgeColor = "#b45309";
    badgeBg = "#fef3c7";
    badgeBorder = "#fde68a";
    subject = `Payment Status: Pending - ${data.serviceName} (${data.appointmentDate})`;
    headline = "Payment Pending Settlement";
    messageContent = `This is a reminder regarding the consultation fee (₹${data.price || 1800}) for your scheduled appointment on <strong>${data.appointmentDate} at ${data.appointmentTime}</strong>. You may settle this via Cash or UPI at your session.`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; border-spacing: 0;">
    <!-- Header -->
    <tr>
      <td style="background-color: #2f4f4f; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">Aswathy</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #d1fae5; text-transform: uppercase; letter-spacing: 1px;">Counselling Psychologist &amp; Psychotherapist</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 13px; font-weight: 600; padding: 4px 14px; border-radius: 9999px; border: 1px solid ${badgeBorder};">
            ${badgeText}
          </span>
          <h2 style="color: #0f172a; margin: 12px 0 6px; font-size: 22px;">${headline}</h2>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Booking Reference: <strong>#${data.bookingId || "Verified"}</strong></p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Dear <strong>${data.clientName}</strong>,<br><br>
          ${messageContent}
        </p>

        <!-- Receipt Table -->
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;">Service</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Session Time</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.appointmentDate} at ${data.appointmentTime}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Amount</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">₹${data.price || 1800}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #64748b;">Payment Status</td>
            <td style="padding: 12px 16px; font-size: 14px; color: ${badgeColor}; font-weight: 700;">
              ${isPaid ? "PAID (Verified)" : isRefunded ? "REFUNDED" : "PENDING"}
            </td>
          </tr>
        </table>

        ${isPaid && data.meetingLink && data.meetingLink.startsWith("http") ? `
        <!-- Google Meet Video Room Card -->
        <div style="background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.5px;">Your Google Meet Session</p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">Your payment has been verified. You can join your confidential consultation directly via the Google Meet link below:</p>
          <a href="${data.meetingLink}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            📹 Join Google Meet Session
          </a>
          <p style="margin: 12px 0 0; font-size: 12px; color: #64748b; word-break: break-all;">Direct link: <a href="${data.meetingLink}" style="color: #059669;">${data.meetingLink}</a></p>
        </div>` : !isPaid ? `
        <div style="background-color: #fffbeb; border: 1px dashed #d97706; border-radius: 8px; padding: 14px 16px; margin: 20px 0; text-align: left;">
          <strong style="color: #92400e; font-size: 13px;">📌 Meeting details will be shared after payment confirmation</strong>
          <p style="margin: 4px 0 0; font-size: 12px; color: #78350f;">Your private Google Meet link will be generated and emailed to you once your payment is confirmed.</p>
        </div>` : ""}

        ${note ? `
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #166534; margin: 16px 0;">
          <strong>Settlement Note:</strong> ${note}
        </div>` : ""}

        ${isPaid ? `
        <!-- Informed Consent Form Card -->
        <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">📋 Mandatory Pre-Session Step</p>
          <h3 style="margin: 0 0 10px; font-size: 17px; color: #0f172a; font-weight: 700;">Informed Consent Form</h3>
          <p style="margin: 0 0 16px; font-size: 14px; color: #334155; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
            Prior to your session, please review and complete the Informed Consent Form. This ensures confidential, safe, and ethical therapeutic care.
          </p>
          <a href="${INFORMED_CONSENT_FORM_URL}" target="_blank" style="display: inline-block; background-color: #2f4f4f; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            📝 Fill Informed Consent Form
          </a>
          <p style="margin: 12px 0 0; font-size: 12px; color: #64748b; word-break: break-all;">
            Direct link: <a href="${INFORMED_CONSENT_FORM_URL}" target="_blank" style="color: #059669; font-weight: 600;">${INFORMED_CONSENT_FORM_URL}</a>
          </p>
        </div>` : ""}

        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 24px;">
          Thank you for choosing us. If you have any questions regarding your receipt or session, feel free to reply directly to this email at <a href="mailto:roottherapyonline@gmail.com" style="color: #2f4f4f; font-weight: 600;">roottherapyonline@gmail.com</a>.
        </p>

        <p style="margin-top: 28px; font-size: 14px; color: #334155; line-height: 1.5;">
          Warm regards,<br>
          <strong>Aswathy</strong><br>
          <span style="font-size: 12px; color: #64748b;">Counselling Psychologist &amp; Psychotherapist | roottherapyonline@gmail.com</span>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
        Official Payment Receipt &amp; Communication. Aswathy Counselling Practice.
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await transporter.sendMail({
    from: `"Aswathy Jeyarajasekar" <${senderEmail}>`,
    to: data.clientEmail,
    replyTo: senderEmail,
    subject,
    html,
  });

  return true;
}


