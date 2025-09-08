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
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary no está configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env");
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

export async function uploadImage(bufferOrPath, folder, mimeType = "image/png") {
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

export async function replaceImage(oldUrl, bufferOrPath, folder, mimeType = "image/png") {
    if (oldUrl) await deleteImageByUrl(oldUrl);
    return uploadImage(bufferOrPath, folder, mimeType);
}

export default {
    uploadImage,
    deleteImageByUrl,
    replaceImage,
    getPublicIdFromUrl,
};


