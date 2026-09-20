/**
 * WhatsApp Cloud API Integration (Meta Graph API)
 * Dispatches transactional appointment confirmations and reminders
 * Template: booking_confirmation (7 parameters)
 */

export interface WhatsAppConfirmationParams {
  phone: string;
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration?: string; // e.g. "50 minutes"
  meetingLink?: string;
  psychologistName?: string; // {{7}} in template
}

export interface WhatsAppReminderParams {
  phone: string;
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration?: string;
  meetingLink?: string;
  psychologistName?: string;
}

export interface WhatsAppDeliveryResult {
  success: boolean;
  messageId?: string;
  warning?: string;
  error?: string;
}

/**
 * Standardizes customer phone number to international E.164 format without '+' or spaces.
 * Defaulting to India (+91) if 10-digit standard mobile number is provided.
 */
export function normalizePhoneNumber(rawPhone: string): string {
  let cleaned = (rawPhone || "").replace(/[^0-9]/g, "");

  // If 10 digits (standard Indian mobile number without country code), prepend 91
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = `91${cleaned.substring(1)}`;
  }

  return cleaned;
}

/**
 * Sends booking confirmation message using the approved WhatsApp Cloud API template.
 *
 * Template: booking_confirmation (Utility)
 * Parameters:
 *   {{1}} Customer name
 *   {{2}} Service name
 *   {{3}} Booking date
 *   {{4}} Booking time
 *   {{5}} Session duration
 *   {{6}} Google Meet URL
 *   {{7}} Psychologist / website name
 */
export async function sendWhatsAppConfirmation(
  params: WhatsAppConfirmationParams
): Promise<WhatsAppDeliveryResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName =
    process.env.WHATSAPP_TEMPLATE_NAME || "booking_confirmation";
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v20.0";

  const cleanPhone = normalizePhoneNumber(params.phone);

  if (!cleanPhone || cleanPhone.length < 10) {
    console.warn(
      `[WhatsApp API] Skipped: Invalid phone number "${params.phone}"`
    );
    return {
      success: false,
      warning: "Invalid phone number provided for WhatsApp notification.",
    };
  }

  // Gracefully degrade if credentials are not configured yet
  if (!accessToken || !phoneNumberId) {
    console.info(
      `[WhatsApp API Notice] Credentials (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID) not configured in .env.local. Simulation mode for: ${cleanPhone}`
    );
    return {
      success: true,
      messageId: `wamid.mock_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      warning:
        "WhatsApp API credentials not set. Message logged in simulated mode.",
    };
  }

  // Guard: skip if template name is not yet configured (pending Meta approval)
  if (!templateName) {
    console.warn(
      `[WhatsApp API] Skipped: WHATSAPP_TEMPLATE_NAME is not set. Create and submit the 'booking_confirmation' template in Meta Business Manager → WhatsApp Manager → Message Templates, then set WHATSAPP_TEMPLATE_NAME in .env.local once approved.`
    );
    return {
      success: false,
      warning:
        "WhatsApp template not configured. Set WHATSAPP_TEMPLATE_NAME in .env.local after your template is approved in Meta Business Manager.",
    };
  }

  const duration = params.duration || "50 minutes";
  const psychologistName =
    params.psychologistName ||
    process.env.WHATSAPP_PSYCHOLOGIST_NAME ||
    "Aswathy | aswathypsychologist.com";
  const meetLink =
    params.meetingLink && params.meetingLink.startsWith("http")
      ? params.meetingLink
      : "Your Google Meet link will be shared shortly";

  try {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const bodyPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: process.env.WHATSAPP_TEMPLATE_LANG || "en",
        },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: params.customerName },    // {{1}}
              { type: "text", text: params.serviceName },     // {{2}}
              { type: "text", text: params.appointmentDate }, // {{3}}
              { type: "text", text: params.appointmentTime }, // {{4}}
              { type: "text", text: duration },               // {{5}}
              { type: "text", text: meetLink },               // {{6}}
              { type: "text", text: psychologistName },       // {{7}}
            ],
          },
        ],
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp Cloud API Error]:", data);
      return {
        success: false,
        error: data.error?.message || "Failed to send WhatsApp message",
      };
    }

    const messageId = data.messages?.[0]?.id;
    console.info(
      `[WhatsApp API] Confirmation sent to ${cleanPhone}. Message ID: ${messageId}`
    );
    return {
      success: true,
      messageId,
    };
  } catch (error: any) {
    console.error("[WhatsApp API Exception]:", error);
    return {
      success: false,
      error: error.message || "Network exception sending WhatsApp notification",
    };
  }
}

/**
 * Sends or schedules a pre-session reminder message on WhatsApp
 */
export async function sendWhatsAppReminder(
  params: WhatsAppReminderParams
): Promise<WhatsAppDeliveryResult> {
  const reminderTemplate =
    process.env.WHATSAPP_REMINDER_TEMPLATE_NAME || "session_reminder";

  // Re-use confirmation dispatch with reminder template if defined
  const originalTemplate = process.env.WHATSAPP_TEMPLATE_NAME;
  try {
    process.env.WHATSAPP_TEMPLATE_NAME = reminderTemplate;
    return await sendWhatsAppConfirmation(params);
  } finally {
    process.env.WHATSAPP_TEMPLATE_NAME = originalTemplate;
  }
}

