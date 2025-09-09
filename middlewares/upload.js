import multer from "multer";

// Usa memoria para poder enviar buffers a Cloudinary sin tocar disco
const storage = multer.memoryStorage();

// Filtro de tipos permitidos
function fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Tipo de archivo no permitido. Solo JPG, JPEG o PNG."));
}

export const uploadSingleImage = multer({ storage, fileFilter }).single("image");
export const uploadMultipleImages = multer({ storage, fileFilter }).array("images", 10);


