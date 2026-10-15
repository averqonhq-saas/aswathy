import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "qt8svx7a",
  api_key: process.env.CLOUDINARY_API_KEY || "854679241532487",
  api_secret: process.env.CLOUDINARY_API_SECRET || "utWdJy47bPW0YfxRx4zSE2Xr8Lg",
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: any[];
}

/**
 * Uploads a Buffer (from file upload) to Cloudinary via upload_stream
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options?: CloudinaryUploadOptions
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder || "aswathy-psychology/gallery",
        public_id: options?.publicId,
        tags: options?.tags || ["gallery", "aswathy-psychologist"],
        resource_type: "image",
        overwrite: true,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Generates an optimized, auto-formatted Cloudinary URL
 */
export function getOptimizedImageUrl(publicIdOrUrl: string, width = 1200): string {
  if (!publicIdOrUrl) return "";

  // If already full URL, return it
  if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
    // If it's a Cloudinary URL, we can inject auto formatting
    if (publicIdOrUrl.includes("res.cloudinary.com") && !publicIdOrUrl.includes("/f_auto,q_auto/")) {
      return publicIdOrUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
    }
    return publicIdOrUrl;
  }

  return cloudinary.url(publicIdOrUrl, {
    fetch_format: "auto",
    quality: "auto",
    width,
    crop: "limit",
    secure: true,
  });
}
