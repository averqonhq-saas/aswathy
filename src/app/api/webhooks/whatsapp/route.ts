import { NextRequest, NextResponse } from "next/server";
import { getPgPool } from "@/lib/supabase-db";

/**
 * WhatsApp Cloud API Webhook Handler
 * 
 * 1. GET: Handles verification handshake from Meta (hub.challenge, hub.verify_token)
 * 2. POST: Handles incoming message status updates (sent, delivered, read, failed)
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "aswathy_wa_webhook_secret";

  if (mode === "subscribe" && token === expectedToken) {
    console.info("[WhatsApp Webhook] Verification successful.");
    return new Response(challenge || "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn(
    `[WhatsApp Webhook] Verification failed. Received token: "${token}", Expected: "${expectedToken}"`
  );
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify WhatsApp event
    if (payload.object !== "whatsapp_business_account") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const entries = payload.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value;
        if (!value) continue;

        // Delivery Status Updates (sent, delivered, read, failed)
        if (value.statuses && Array.isArray(value.statuses)) {
          for (const statusObj of value.statuses) {
            const messageId = statusObj.id;
            const status = statusObj.status; // 'sent', 'delivered', 'read', 'failed'
            const recipientId = statusObj.recipient_id;

            console.info(
              `[WhatsApp Webhook] Status Update: ${messageId} -> ${status} (Recipient: ${recipientId})`
            );

            // If message failed, log error details
            if (status === "failed" && statusObj.errors) {
              console.error(
                `[WhatsApp Webhook] Message Delivery Failed:`,
                JSON.stringify(statusObj.errors)
              );
            }

            // Optionally update Supabase bookings status if matching
            try {
              const pool = getPgPool();
              await pool.query(
                `UPDATE bookings
                 SET whatsapp_status = $1
                 WHERE phone = $2 OR phone LIKE $3`,
                [status, recipientId, `%${recipientId.slice(-10)}`]
              );
            } catch (dbErr) {
              // Non-blocking log
              console.warn("[WhatsApp Webhook] DB update note:", dbErr);
            }
          }
        }

        // Incoming messages (customer replies)
        if (value.messages && Array.isArray(value.messages)) {
          for (const msg of value.messages) {
            console.info(
              `[WhatsApp Webhook] Incoming message from ${msg.from} (${msg.type}):`,
              msg.text?.body || msg[msg.type]
            );
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[WhatsApp Webhook Error]:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
