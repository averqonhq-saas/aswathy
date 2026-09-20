import { google } from "googleapis";

export const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

export interface CreateMeetEventParams {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  appointmentDate?: string; // YYYY-MM-DD
  appointmentTime?: string; // e.g. "10:00 AM" or "14:30"
  startIso?: string;
  endIso?: string;
  durationMinutes?: number;
  format?: "online" | "in-person";
  isOnline?: boolean;
  adminEmail?: string;
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

export function setupGoogleTokenLogging(oauth2Client: any) {
  oauth2Client.on("tokens", (tokens: any) => {
    console.log("[Google OAuth] Access token refreshed");
    if (tokens.refresh_token) {
      console.log("[Google OAuth] A new refresh token was issued.");
    }
  });
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
    console.error("[Google OAuth] Missing client credentials");
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  setupGoogleTokenLogging(oauth2Client);

  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (refreshToken?.trim()) {
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
  if (!oauth2Client) {
    return null;
  }

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: [GOOGLE_CALENDAR_SCOPE],
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

  const pad = (n: number) => String(n).padStart(2, "0");
  const startIso = `${cleanDate}T${pad(hours)}:${pad(minutes)}:00+05:30`;

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
  const oauth2Client = getGoogleOAuth2Client();
  if (!oauth2Client) {
    return {
      success: false,
      error: "Google OAuth is not configured",
      needsAuth: true,
    };
  }

  if (!process.env.GOOGLE_REFRESH_TOKEN?.trim()) {
    return {
      success: false,
      error: "Google Calendar is not connected",
      needsAuth: true,
    };
  }

  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  const isOnline =
    params.isOnline !== undefined
      ? params.isOnline
      : (params.format || "online").toLowerCase() !== "in-person";

  const adminEmail =
    params.adminEmail ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.EMAIL_USER ||
    "roottherapyonline@gmail.com";

  const { startIso, endIso } =
    params.startIso && params.endIso
      ? { startIso: params.startIso, endIso: params.endIso }
      : parseAppointmentToRFC3339(
          params.appointmentDate || "",
          params.appointmentTime || "10:00 AM",
          params.durationMinutes || 50
        );

  const attendees: Array<{ email: string; displayName?: string }> = [
    {
      email: adminEmail,
      displayName: "Aswathy Psychologist",
    },
  ];

  if (params.clientEmail && params.clientEmail.includes("@")) {
    attendees.push({
      email: params.clientEmail.trim().toLowerCase(),
      displayName: params.clientName,
    });
  }

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: isOnline ? 1 : 0,
      sendUpdates: "all",
      requestBody: {
        summary: `Therapy Consultation: ${params.serviceName}`,
        description: params.clientMessage
          ? `Online counselling appointment\n\nClient Note: ${params.clientMessage}`
          : "Online counselling appointment",
        start: {
          dateTime: startIso,
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: endIso,
          timeZone: "Asia/Kolkata",
        },
        attendees,
        conferenceData: isOnline
          ? {
              createRequest: {
                requestId: `meet-${params.bookingId.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`,
                conferenceSolutionKey: {
                  type: "hangoutsMeet",
                },
              },
            }
          : undefined,
      },
    });

    const event = response.data;
    const meetingLink =
      event.hangoutLink ||
      event.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === "video"
      )?.uri;

    return {
      success: true,
      eventId: event.id || undefined,
      meetingLink: meetingLink || undefined,
      htmlLink: event.htmlLink || undefined,
    };
  } catch (error: any) {
    console.error("[Google Calendar Error]", error?.response?.data || error);
    const googleError = error?.response?.data?.error;
    if (
      googleError === "invalid_grant" ||
      error?.message?.includes("invalid_grant") ||
      error?.message?.includes("expired")
    ) {
      return {
        success: false,
        error: "GOOGLE_REAUTH_REQUIRED",
        needsAuth: true,
      };
    }
    return {
      success: false,
      error: "GOOGLE_CALENDAR_ERROR",
    };
  }
}

/**
 * Deletes an event from Google Calendar and notifies attendees of the cancellation.
 */
export async function deleteCalendarEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  const oauth2Client = getGoogleOAuth2Client();
  if (!oauth2Client) {
    return {
      success: false,
      error: "Google OAuth is not configured",
    };
  }

  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId.trim(),
      sendUpdates: "all",
    });
    return {
      success: true,
    };
  } catch (error: any) {
    console.error(
      "[Google Calendar Delete Error]",
      error?.response?.data || error
    );
    return {
      success: false,
      error: "GOOGLE_CALENDAR_DELETE_ERROR",
    };
  }
}
