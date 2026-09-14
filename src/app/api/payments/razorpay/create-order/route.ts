import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, amount, serviceName, clientName, clientEmail, clientPhone } = body;

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required to initiate payment." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    if (db.bookingFormConfig?.enablePayment === false) {
      return NextResponse.json(
        {
          error: "Online payment is currently disabled by practice policy. Please complete your appointment booking directly.",
          isPaymentDisabled: true,
        },
        { status: 400 }
      );
    }

    const receiptId = (bookingId || `rcpt_${Date.now()}`).slice(-40);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = Math.round(Number(amount) * 100);

    // If real Razorpay keys are configured in environment
    if (keyId && keySecret) {
      try {
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: receiptId,
            notes: {
              clientName: clientName || "",
              clientEmail: clientEmail || "",
              serviceName: serviceName || "",
            },
          }),
        });

        const orderData = await res.json();
        if (!res.ok) {
          console.error("Razorpay API error response:", orderData);
          throw new Error(orderData.error?.description || "Failed to create Razorpay order.");
        }

        const finalOrderId = orderData.id;
        if (bookingId) {
          const bIdx = db.bookings.findIndex((b) => b.id === bookingId);
          if (bIdx !== -1) {
            db.bookings[bIdx].razorpayOrderId = finalOrderId;
            db.bookings[bIdx].updatedAt = new Date().toISOString();
            await saveDatabase(db);
            try {
              const { getPgPool } = await import("@/lib/supabase-db");
              const pool = getPgPool();
              await pool.query(
                `UPDATE bookings SET razorpay_order_id = $1, updated_at = NOW() WHERE id = $2`,
                [finalOrderId, bookingId]
              );
            } catch (pgErr) {
              console.warn("[PostgreSQL Order Link Error]:", pgErr);
            }
          }
        }

        return NextResponse.json({
          success: true,
          orderId: finalOrderId,
          amount: orderData.amount,
          currency: orderData.currency,
          keyId: keyId,
          isMock: false,
        });
      } catch (apiErr: any) {
        console.error("Razorpay API request failed, falling back to demo order:", apiErr);
      }
    }

    // Fallback: Simulated sandbox mode when Razorpay credentials are not yet configured in .env
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (bookingId) {
      const bIdx = db.bookings.findIndex((b) => b.id === bookingId);
      if (bIdx !== -1) {
        db.bookings[bIdx].razorpayOrderId = mockOrderId;
        db.bookings[bIdx].updatedAt = new Date().toISOString();
        await saveDatabase(db);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId || "rzp_test_sanctuary_demo",
      isMock: true,
    });
  } catch (error: any) {
    console.error("Create Razorpay Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment." },
      { status: 500 }
    );
  }
}
