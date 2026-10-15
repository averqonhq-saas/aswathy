import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Please upload JPG, PNG, WEBP, GIF, or SVG images.",
        },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File size exceeds the 10MB limit (uploaded: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(1)}MB).`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Sanitize base name for public ID
    const ext = path.extname(file.name) || ".jpg";
    const baseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 40);

    const publicId = `${baseName}-${Date.now()}`;

    // 1. Primary: Upload directly to Cloudinary
    try {
      const cloudinaryResult = await uploadBufferToCloudinary(buffer, {
        folder: "aswathy-psychology/gallery",
        publicId,
        tags: ["gallery", "events", "aswathy-psychologist"],
      });

      return NextResponse.json({
        success: true,
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        filename: `${publicId}${ext}`,
        sizeBytes: cloudinaryResult.bytes || file.size,
        mimeType: file.type,
        provider: "cloudinary",
      });
    } catch (cloudErr) {
      console.warn("Cloudinary upload failed, falling back to local storage:", cloudErr);

      // 2. Fallback: Save locally if cloud error occurs
      const uniqueName = `${publicId}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
      await fs.mkdir(uploadDir, { recursive: true });

      const targetFilePath = path.join(uploadDir, uniqueName);
      await fs.writeFile(targetFilePath, buffer);

      const publicUrl = `/uploads/gallery/${uniqueName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: uniqueName,
        sizeBytes: file.size,
        mimeType: file.type,
        provider: "local-fallback",
      });
    }
  } catch (error: any) {
    console.error("Gallery file upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image file." },
      { status: 500 }
    );
  }
}
