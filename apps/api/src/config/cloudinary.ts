import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { ApiError } from "@/shared/utils/api-error";

export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn("⚠️  Cloudinary disabled (CLOUDINARY_* not set) — image uploads will 503");
}

export interface UploadedImage {
  url: string;
  publicId: string;
}

/**
 * Uploads an in-memory file buffer (from multer) to Cloudinary under `folder`.
 * Returns the secure URL + publicId — store both so the image can be deleted later.
 */
export const uploadImage = (
  fileBuffer: Buffer,
  folder: string
): Promise<UploadedImage> => {
  if (!isCloudinaryConfigured) {
    throw new ApiError("Image uploads are not configured", 503);
  }

  return new Promise<UploadedImage>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new ApiError("Image upload failed", 502));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
};

/** Deletes an image by its publicId. Safe to call with a missing/empty id. */
export const deleteImage = async (publicId?: string): Promise<void> => {
  if (!isCloudinaryConfigured || !publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

export { cloudinary };
