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

export function uploadBuffer(
  buffer,
  { folder, mimeType, resourceType = "auto", publicId, originalFilename } = {}
) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    // Extraer extensión del filename o mimeType
    let format = null;
    if (originalFilename) {
      const ext = originalFilename.split('.').pop()?.toLowerCase();
      if (ext) format = ext;
    } else if (mimeType) {
      const mimeToExt = {
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'text/plain': 'txt',
        'text/csv': 'csv',
        'application/zip': 'zip'
      };
      format = mimeToExt[mimeType];
    }

    const options = {
      folder,
      resource_type: resourceType,
      public_id: publicId,
      overwrite: true,
      use_filename: true,
      unique_filename: !publicId, // Solo si no hay publicId específico
    };

    // Agregar format solo si lo tenemos
    if (format) {
      options.format = format;
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
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
export async function deleteByPublicId(publicId, resourceType = "image") {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

// Función para documentos - FUERZA resource_type raw
export function uploadDocument(buffer, { folder, originalFilename, publicId } = {}) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    // IMPORTANTE: Para documentos (PDF, DOCX, etc.) SIEMPRE usar "raw"
    const options = {
      folder,
      resource_type: "raw", // ✅ Forzar RAW para todos los documentos
      public_id: publicId,
      overwrite: true,
      use_filename: true,
      unique_filename: !publicId,
    };

    console.log("📤 Cloudinary upload options (FORCED RAW):", options);
    console.log("📄 Original filename:", originalFilename);

    const stream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => {
        if (err) {
          console.error("❌ Cloudinary upload error:", err);
          reject(err);
        } else {
          console.log("✅ Cloudinary result (FORCED RAW):", {
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format,
            bytes: result.bytes
          });
          resolve({ 
            url: result.secure_url,
            publicId: result.public_id 
          });
        }
      }
    );
    stream.end(buffer);
  });
}

// Nueva función específica para PDFs como imágenes (fallback si raw falla)
export function uploadPdfAsImage(buffer, { folder, originalFilename, publicId } = {}) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    // TRUCO: Para PDFs, usar resourceType 'image' evita restricciones pero crea problemas de acceso
    const options = {
      folder,
      resource_type: "image",
      public_id: publicId,
      overwrite: true,
      use_filename: true,
      unique_filename: !publicId,
      format: "pdf",
    };

    const stream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            url: result.secure_url,
            publicId: result.public_id 
          });
        }
      }
    );
    stream.end(buffer);
  });
}

export default {
  uploadImage,
  deleteImageByUrl,
  getPublicIdFromUrl,
  uploadBuffer,
  uploadDocument,
  uploadPdfAsImage,
  deleteByPublicId,
};
