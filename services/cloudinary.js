import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configuración desde variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function ensureConfigured() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary no está configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env"
    );
  }
}

// Extrae public_id desde una URL de Cloudinary (https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<public_id>.<ext>)
export function getPublicIdFromUrl(url) {
  try {
    const urlObj = new URL(url);
    // Quita path hasta /upload/
    const parts = urlObj.pathname.split("/upload/");
    if (parts.length < 2) return null;
    const rest = parts[1];
    // Quita versión si existe (v123456789/)
    const withoutVersion = rest.replace(/^v\d+\//, "");
    // Quita extensión
    const lastSegment = withoutVersion.split(".");
    lastSegment.pop();
    return lastSegment.join(".");
  } catch {
    return null;
  }
}

// Sube buffer como archivo 'raw' (PDF, XLSX, DOCX, etc.)
export function uploadBuffer(
  buffer,
  { folder, mimeType, resourceType = "raw", publicId } = {}
) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        overwrite: true,
      },
      (err, result) =>
        err
          ? reject(err)
          : resolve({ url: result.secure_url, publicId: result.public_id })
    );
    stream.end(buffer);
  });
}

export async function uploadImage(
  bufferOrPath,
  folder,
  mimeType = "image/png"
) {
  ensureConfigured();
  const options = {
    folder,
    resource_type: "image",
    overwrite: true,
  };

  // Soporta buffer (multer memoryStorage) o ruta temporal
  if (bufferOrPath instanceof Buffer) {
    const base64 = `data:${mimeType};base64,${bufferOrPath.toString("base64")}`;
    const res = await cloudinary.uploader.upload(base64, options);
    return { url: res.secure_url, publicId: res.public_id };
  }
  const res = await cloudinary.uploader.upload(bufferOrPath, options);
  return { url: res.secure_url, publicId: res.public_id };
}

export async function deleteImageByUrl(url) {
  ensureConfigured();
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return { result: "not_found" };
  return cloudinary.uploader.destroy(publicId);
}

// Borra por publicId (preferible) o por URL (fallback)
export async function deleteByPublicId(publicId, resourceType = "raw") {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default {
  uploadImage,
  deleteImageByUrl,
  getPublicIdFromUrl,
  uploadBuffer,
  deleteByPublicId,
};
