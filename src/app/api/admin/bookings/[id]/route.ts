import { NextResponse } from "next/server";
import { bookingService } from "@/lib/booking-adapter";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, saveDatabase } from "@/lib/db";
import { getPgPool } from "@/lib/supabase-db";
import {
  sendBookingStatusEmailToClient,
  sendBookingRescheduledEmailToClient,
  sendPaymentReceiptEmailToClient,
} from "@/lib/email";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { sendWhatsAppConfirmation } from "@/lib/whatsapp";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await bookingService.getBooking(id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, status, paymentStatus, internalNotes, date, time, note } = body;

    let updated = null;

    if (action === "generate_meet" || action === "sync_calendar") {
      const b = await bookingService.getBooking(id);
      if (!b) {
        return NextResponse.json({ error: "Booking not found." }, { status: 404 });
      }

      const calResult = await createCalendarEventWithMeet({
        bookingId: b.id,
        clientName: b.clientName,
        clientEmail: b.clientEmail,
        clientPhone: b.clientPhone,
        serviceName: b.serviceName,
        appointmentDate: b.appointmentDate,
        appointmentTime: b.appointmentTime,
        durationMinutes: b.durationMinutes,
        format: b.format,
        clientMessage: b.clientMessage,
      });

      if (!calResult.success || !calResult.meetingLink) {
        return NextResponse.json(
          {
            error:
              calResult.error ||
              calResult.warning ||
              "Could not generate Google Meet. Check Google OAuth credentials.",
          },
          { status: 400 }
        );
      }

      const db = await getDatabase();
      const target = db.bookings.find(
        (item) => item.id === b.id || item.id.toLowerCase() === b.id.toLowerCase()
      );
      const now = new Date().toISOString();

      if (target) {
        target.meetingLink = calResult.meetingLink;
        target.calendarEventId = calResult.eventId;
        target.updatedAt = now;
        if (!target.history) target.history = [];
        target.history.unshift({
          timestamp: now,
          action: `Google Meet link generated & calendar invitation dispatched`,
        });
        await saveDatabase(db);
      }

      try {
        const pool = getPgPool();
        await pool.query(
          `UPDATE bookings SET meeting_link = $1, updated_at = $2 WHERE id = $3 OR LOWER(id) = LOWER($3)`,
          [calResult.meetingLink, now, b.id]
        );
      } catch (sqlErr) {
        console.warn("[PATCH Booking] Error updating relational meeting_link:", sqlErr);
      }

      updated = await bookingService.getBooking(id);
    } else if (action === "send_payment_receipt") {
      updated = await bookingService.getBooking(id);
      if (updated && paymentStatus && updated.paymentStatus !== paymentStatus) {
        updated = await bookingService.updatePaymentStatus(id, paymentStatus, note);
      }
    } else if (action === "update_payment_status" && paymentStatus) {
      updated = await bookingService.updatePaymentStatus(id, paymentStatus, note);
    } else if (action === "update_status" && status) {
      updated = await bookingService.updateBookingStatus(id, status, note);
    } else if (action === "update_notes" && internalNotes !== undefined) {
      updated = await bookingService.updateBookingNotes(id, internalNotes);
    } else if (action === "reschedule" && date && time) {
      updated = await bookingService.rescheduleBooking(id, date, time, note);
    } else if (paymentStatus && !status) {
      updated = await bookingService.updatePaymentStatus(id, paymentStatus, note);
    } else if (status) {
      updated = await bookingService.updateBookingStatus(id, status, note);
    } else {
      updated = await bookingService.getBooking(id);
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Booking not found or update failed." },
        { status: 404 }
      );
    }

    // Trigger emails for admin status updates (Confirm, Cancel, Complete, Reschedule)
    if ((action === "update_status" || status) && status) {
      try {
        await sendBookingStatusEmailToClient(
          {
            bookingId: updated.id,
            clientName: updated.clientName,
            clientEmail: updated.clientEmail,
            clientPhone: updated.clientPhone,
            serviceName: updated.serviceName,
            appointmentDate: updated.appointmentDate,
            appointmentTime: updated.appointmentTime,
            format: updated.format,
            price: updated.price,
            paymentStatus: updated.paymentStatus,
            meetingLink: updated.meetingLink,
            clientMessage: updated.clientMessage,
          },
          status,
          note
        );
      } catch (emailErr) {
        console.error("[Email Notification Error - Manual Status Update]:", emailErr);
      }
    } else if (action === "reschedule" && date && time) {
      try {
        await sendBookingRescheduledEmailToClient(
          {
            bookingId: updated.id,
            clientName: updated.clientName,
            clientEmail: updated.clientEmail,
            clientPhone: updated.clientPhone,
            serviceName: updated.serviceName,
            appointmentDate: updated.appointmentDate,
            appointmentTime: updated.appointmentTime,
            format: updated.format,
            price: updated.price,
            paymentStatus: updated.paymentStatus,
            meetingLink: updated.meetingLink,
            clientMessage: updated.clientMessage,
          },
          note
        );
      } catch (emailErr) {
        console.error("[Email Notification Error - Reschedule]:", emailErr);
      }
    } else if (
      (action === "update_payment_status" || action === "send_payment_receipt" || paymentStatus) &&
      body.sendEmail !== false
    ) {
      try {
        await sendPaymentReceiptEmailToClient(
          {
            bookingId: updated.id,
            clientName: updated.clientName,
            clientEmail: updated.clientEmail,
            clientPhone: updated.clientPhone,
            serviceName: updated.serviceName,
            appointmentDate: updated.appointmentDate,
            appointmentTime: updated.appointmentTime,
            durationMinutes: updated.durationMinutes,
            format: updated.format,
            price: updated.price,
            paymentStatus: updated.paymentStatus,
            meetingLink: updated.meetingLink,
            clientMessage: updated.clientMessage,
          },
          updated.paymentStatus || "paid",
          note
        );
      } catch (emailErr) {
        console.error("[Email Notification Error - Payment Receipt]:", emailErr);
      }

      // Send WhatsApp confirmation when manually marked as paid — only if Meet link exists
      if (
        (paymentStatus === "paid" || updated.paymentStatus === "paid") &&
        updated.meetingLink &&
        updated.meetingLink.startsWith("http")
      ) {
        try {
          const waResult = await sendWhatsAppConfirmation({
            phone: updated.clientPhone,
            customerName: updated.clientName,
            serviceName: updated.serviceName,
            appointmentDate: updated.appointmentDate,
            appointmentTime: updated.appointmentTime,
            duration: `${updated.durationMinutes || 50} minutes`,
            meetingLink: updated.meetingLink,
            psychologistName:
              process.env.WHATSAPP_PSYCHOLOGIST_NAME || "Aswathy | roottherapyonline.com",
          });

          if (waResult.success) {
            try {
              const pool = getPgPool();
              await pool.query(
                `UPDATE bookings SET whatsapp_status = 'sent', whatsapp_sent = TRUE WHERE id = $1`,
                [updated.id]
              );
            } catch {}
            console.info(
              `[Admin Manual Pay] WhatsApp confirmation sent to ${updated.clientPhone} for booking ${updated.id}`
            );
          } else if (waResult.warning) {
            console.info(
              `[Admin Manual Pay] WhatsApp in simulation mode for ${updated.id}: ${waResult.warning}`
            );
          }
        } catch (waErr) {
          console.error("[Admin Manual Pay - WhatsApp Error]:", waErr);
        }
      } else if (paymentStatus === "paid" && !updated.meetingLink) {
        console.warn(
          `[Admin Manual Pay] WhatsApp skipped for booking ${updated.id}: no Google Meet link yet. Generate Meet first, then notify.`
        );
      }
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDatabase();
    
    let found = false;

    // 1. Remove from JSONB collections / db.bookings
    const bookingIndex = db.bookings.findIndex((b) => b.id === id);
    if (bookingIndex !== -1) {
      db.bookings.splice(bookingIndex, 1);
      await saveDatabase(db);
      found = true;
    }

    // 2. Remove from PostgreSQL relational table
    try {
      const pool = getPgPool();
      const res = await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
      if (res.rowCount && res.rowCount > 0) {
        found = true;
      }
    } catch (sqlErr) {
      console.warn("SQL table booking delete notice:", sqlErr);
    }

    if (!found) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Booking removed successfully." });
  } catch (error) {
    console.error("Delete booking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
