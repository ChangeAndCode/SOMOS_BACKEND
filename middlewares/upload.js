// middlewares/upload.js
import multer from "multer";

const storage = multer.memoryStorage();

/* ========= IMÁGENES ========= */
const allowedImages = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function imageFilter(req, file, cb) {
  if (allowedImages.has(file.mimetype)) return cb(null, true);
  cb(new Error("Tipo no permitido. Solo imágenes: JPG, JPEG, PNG, WEBP."));
}

export const uploadSingleImage = multer({
  storage,
  fileFilter: imageFilter,
}).single("image"); // campo: 'image'

export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFilter,
}).array("images", 10); // campo: 'images' (máx 10)

/* ========= DOCUMENTOS ========= */
const allowedDocs = new Set([
  "application/pdf", // .pdf
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain", // .txt
  "text/csv", // .csv
  "application/zip", // .zip
]);

function docFilter(req, file, cb) {
  if (allowedDocs.has(file.mimetype)) return cb(null, true);
  cb(
    new Error(
      "Tipo de archivo no permitido. Solo documentos (PDF, Word, Excel, etc.)."
    )
  );
}

export const uploadSingleDoc = multer({
  storage,
  fileFilter: docFilter,
}).single("file"); // campo: 'file'

export const uploadMultipleDocs = multer({
  storage,
  fileFilter: docFilter,
}).array("files", 10); // campo: 'files' (máx 10)

// Middleware mixto para formularios que pueden enviar tanto documentos como imágenes
export const uploadMixed = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Aceptar tanto imágenes como documentos
    if (allowedImages.has(file.mimetype) || allowedDocs.has(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Tipo de archivo no permitido."));
  }
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

/* ========= OPCIONAL: límites de tamaño =========
  (descomenta si quieres limitar tamaño)
const limits5MB = { fileSize: 5 * 1024 * 1024 };
export const uploadSingleImage5MB = multer({ storage, fileFilter: imageFilter, limits: limits5MB }).single("image");
*/
