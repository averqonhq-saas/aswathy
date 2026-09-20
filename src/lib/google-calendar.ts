import { google } from "googleapis";
import fs from "fs";
import path from "path";

export interface CreateMeetEventParams {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:00 AM" or "14:30"
  durationMinutes?: number;
  format?: "online" | "in-person";
  clientMessage?: string;
}

export interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  meetingLink?: string;
  htmlLink?: string;
  error?: string;
  warning?: string;
  needsAuth?: boolean;
}

/**
 * Returns OAuth2 client configured with Google credentials
 */
export function getGoogleOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    "https://www.aswathypsychologist.com/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (refreshToken && refreshToken.trim() !== "") {
    oauth2Client.setCredentials({
      refresh_token: refreshToken.trim(),
    });
  }

  return oauth2Client;
}

/**
 * Generates the Google OAuth authorization URL for the admin to authorize Calendar access
 */
export function getGoogleCalendarAuthUrl(): string | null {
  const oauth2Client = getGoogleOAuth2Client();
  if (!oauth2Client) return null;

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
}

/**
 * Parses appointment date and time into start and end RFC3339 strings in Asia/Kolkata (+05:30)
 */
export function parseAppointmentToRFC3339(
  dateStr: string,
  timeStr: string,
  durationMinutes: number = 50
): { startIso: string; endIso: string } {
  // Ensure dateStr is YYYY-MM-DD
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim();

  let hours = 10;
  let minutes = 0;

  const cleanTime = (timeStr || "10:00 AM").trim();
  const ampmMatch = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

  if (ampmMatch) {
    let rawHours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3] ? ampmMatch[3].toUpperCase() : null;

    if (period === "PM" && rawHours < 12) {
      hours = rawHours + 12;
    } else if (period === "AM" && rawHours === 12) {
      hours = 0;
    } else {
      hours = rawHours;
    }
  }

  // Create start time in IST (+05:30)
  const pad = (n: number) => String(n).padStart(2, "0");
  const startIso = `${cleanDate}T${pad(hours)}:${pad(minutes)}:00+05:30`;

  // Calculate end time
  const totalStartMinutes = hours * 60 + minutes;
  const totalEndMinutes = totalStartMinutes + durationMinutes;
  const endHours = Math.floor(totalEndMinutes / 60) % 24;
  const endMinutes = totalEndMinutes % 60;
  const endIso = `${cleanDate}T${pad(endHours)}:${pad(endMinutes)}:00+05:30`;

  return { startIso, endIso };
}

/**
 * Creates a Google Calendar event with Google Meet enabled, inviting both admin and client.
 */
export async function createCalendarEventWithMeet(
  params: CreateMeetEventParams
): Promise<CalendarEventResult> {
  const {
    bookingId,
    clientName,
    clientEmail,
    clientPhone,
    serviceName,
    appointmentDate,
    appointmentTime,
    durationMinutes = 50,
    format = "online",
    clientMessage,
  } = params;

  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.EMAIL_USER ||
    "roottherapyonline@gmail.com";

  const oauth2Client = getGoogleOAuth2Client();

  if (!oauth2Client) {
    console.warn(
      "[Google Calendar] Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) missing."
    );
    return {
      success: false,
      error: "Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) missing.",
      needsAuth: true,
    };
  }

  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken || refreshToken.trim() === "") {
    console.warn(
      "[Google Calendar] GOOGLE_REFRESH_TOKEN not set. Calendar authorization required."
    );
    return {
      success: false,
      error: "Google Calendar is not authorized. Please connect Google Calendar in admin dashboard.",
      needsAuth: true,
    };
  }

  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const { startIso, endIso } = parseAppointmentToRFC3339(
      appointmentDate,
      appointmentTime,
      durationMinutes
    );

    const isOnline = format === "online";
    const eventSummary = `${serviceName} - ${clientName} | Root Therapy`;
    const eventDescription = [
      `Psychological Consultation Session - Root Therapy`,
      `Client: ${clientName}`,
      `Email: ${clientEmail}`,
      `Phone: ${clientPhone || "Not provided"}`,
      `Service: ${serviceName}`,
      `Format: ${isOnline ? "Online (Google Meet)" : "In-Person Clinic"}`,
      `Appointment Ref: ${bookingId}`,
      clientMessage ? `Client Note: ${clientMessage}` : "",
      "",
      "--------------------------------------------------",
      "Confidential Therapy Session. Please join 5 minutes prior to the start time.",
    ]
      .filter(Boolean)
      .join("\n");

    const attendees: Array<{ email: string; displayName?: string }> = [
      { email: adminEmail, displayName: "Root Therapy Admin" },
    ];

    if (clientEmail && clientEmail.includes("@")) {
      attendees.push({ email: clientEmail.trim().toLowerCase(), displayName: clientName });
    }

    const requestBody: any = {
      summary: eventSummary,
      description: eventDescription,
      start: {
        dateTime: startIso,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endIso,
        timeZone: "Asia/Kolkata",
      },
      attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hours
          { method: "popup", minutes: 30 }, // 30 minutes
        ],
      },
    };

    // If online, generate Google Meet link automatically via conferenceData
    if (isOnline) {
      requestBody.conferenceData = {
        createRequest: {
          requestId: `meet-${bookingId.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      };
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: isOnline ? 1 : 0,
      sendUpdates: "all", // Triggers Google's official calendar invite to attendees
      requestBody,
    });

    const event = response.data;
    const meetingLink =
      event.hangoutLink ||
      event.conferenceData?.entryPoints?.find(
        (ep) => ep.entryPointType === "video"
      )?.uri ||
      undefined;

    return {
      success: true,
      eventId: event.id || undefined,
      meetingLink,
      htmlLink: event.htmlLink || undefined,
      warning:
        isOnline && !meetingLink
          ? "Calendar event created, but Google Meet link was not returned by Google."
          : undefined,
    };
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.error_description ||
      error?.response?.data?.error ||
      error?.message ||
      "Google Calendar API error";

    const isInvalidGrant =
      error?.response?.data?.error === "invalid_grant" ||
      String(errorMsg).includes("invalid_grant") ||
      String(errorMsg).includes("Token has been expired or revoked");

    console.error(
      "[Google Calendar Error - Insert Event]:",
      isInvalidGrant ? "invalid_grant (Token expired/revoked)" : errorMsg
    );

    return {
      success: false,
      error: isInvalidGrant
        ? "Google Calendar authorization has expired (invalid_grant). Please click 'Connect Google Calendar' in the admin dashboard."
        : `Google Calendar Error: ${errorMsg}`,
      needsAuth: isInvalidGrant,
    };
  }
}
