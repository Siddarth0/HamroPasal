import multer from "multer";
import { ApiError } from "../utils/api-error";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Memory storage — files arrive as Buffers and are streamed to Cloudinary
// (see config/cloudinary.ts), so nothing is written to disk.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only image files are allowed", 400));
    }
  },
});
