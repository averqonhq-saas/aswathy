import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { getCurrentAdmin, hashPassword, verifyPassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    return NextResponse.json({ settings: db.settings });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tab, general, booking, account, notifications, passwordUpdate } = body;

    const db = await getDatabase();

    if (general) {
      db.settings.general = { ...db.settings.general, ...general };
      const rawPhone = general.contactPhone || general.phone;
      if (rawPhone) {
        const clean = rawPhone.replace(/[^0-9]/g, "");
        if (clean) {
          db.settings.general.whatsapp = `https://wa.me/${clean}`;
        }
      }
    }

    if (booking) {
      db.settings.booking = { ...db.settings.booking, ...booking };
    }

    if (account) {
      db.settings.account = { ...db.settings.account, ...account };
      const currentAdmin = db.admins.find((a) => a.id === session.adminId);
      if (currentAdmin) {
        if (account.adminName) currentAdmin.name = account.adminName;
        if (account.email) currentAdmin.email = account.email;
        if (account.profileImage) currentAdmin.profileImage = account.profileImage;
        currentAdmin.updatedAt = new Date().toISOString();
      }
    }

    if (notifications) {
      db.settings.notifications = {
        ...db.settings.notifications,
        ...notifications,
      };
    }

    // Handle password update if provided
    if (passwordUpdate) {
      const { currentPassword, newPassword } = passwordUpdate;
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Both current and new password are required." },
          { status: 400 }
        );
      }

      const admin = db.admins.find((a) => a.id === session.adminId);
      if (!admin) {
        return NextResponse.json({ error: "Admin not found." }, { status: 404 });
      }

      if (!verifyPassword(currentPassword, admin.passwordHash)) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 400 }
        );
      }

      admin.passwordHash = hashPassword(newPassword);
      admin.updatedAt = new Date().toISOString();
    }

    await saveDatabase(db);
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
