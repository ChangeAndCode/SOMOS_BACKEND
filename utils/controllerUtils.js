import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";
import { normalizeFormData, validateFiles } from "./validation.js";

export async function handleEntityCreate(Model, req, res, entityConfig) {
    try {
        const { entityName, cloudinaryFolder, fieldConfig, normalizeFunction } = entityConfig;

        // Normalizar datos del body
        const payload = normalizeFunction ? normalizeFunction(req.body) : normalizeFormData(req.body, fieldConfig);
        let images = [];
        
        // Subir imágenes si las hay
        if (req.files && req.files.length > 0) {
            // Validar archivos
            const validation = validateFiles(req.files);
            if (!validation.valid) {
                return res.status(400).json({ 
                    message: "Error de validación de archivos", 
                    error: validation.error 
                });
            }

            const uploads = await Promise.all(
                req.files.map((f) => uploadImage(f.buffer, cloudinaryFolder, f.mimetype))
            );
            images = uploads.map(u => u.url);
        }

        // Crear nueva entidad
        const newEntity = new Model({ ...payload, images });
        await newEntity.save();
        res.status(201).json(newEntity);
    } catch (err) {
        res.status(400).json({ message: `Error al crear ${entityName.toLowerCase()}`, error: err.message });
    }
}

export async function handleEntityUpdate(Model, req, res, entityConfig) {
    try {
        const { id } = req.params;
        const { entityName, cloudinaryFolder, fieldConfig, normalizeFunction } = entityConfig;

        const existing = await Model.findById(id);
        if (!existing) {
            return res.status(404).json({ message: `${entityName} no encontrado` });
        }

        const payload = normalizeFunction ? normalizeFunction(req.body) : normalizeFormData(req.body, fieldConfig);
        
        const deletedImages = Array.isArray(payload.deletedImages) ? payload.deletedImages : [];
        if (deletedImages.length > 0) {
            await Promise.all(deletedImages.map((url) => deleteImageByUrl(url)));
        }
        
        const removeAllFlag = String(payload.removeAllImages || "").toLowerCase() === "true";
        const imagesField = payload.images;
        const wantsEmptyImages = Array.isArray(imagesField) && imagesField.length === 0;

        if ((removeAllFlag || wantsEmptyImages) && (!req.files || req.files.length === 0)) {
            if (Array.isArray(existing.images) && existing.images.length > 0) {
                await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
            }
            const updated = await Model.findByIdAndUpdate(
                id,
                { $set: { images: [] } },
                { new: true }
            );
            return res.json(updated);
        }
        
        const remainingImages = (existing.images || []).filter(url => !deletedImages.includes(url));
        
        if (req.files && req.files.length > 0) {
                    const validation = validateFiles(req.files);
            if (!validation.valid) {
                return res.status(400).json({ 
                    message: "Error de validación de archivos", 
                    error: validation.error 
                });
            }

            const uploads = await Promise.all(
                req.files.map((f) => uploadImage(f.buffer, cloudinaryFolder, f.mimetype))
            );
            const uploadedUrls = uploads.map(u => u.url);
            payload.images = [...remainingImages, ...uploadedUrls];
        } else {
            // Sin nuevas imágenes, mantener solo las restantes
            payload.images = remainingImages;
        }

        const updated = await Model.findByIdAndUpdate(id, payload, { new: true });
        if (!updated) {
            return res.status(404).json({ message: `${entityName} no encontrado` });
        }
        
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: `Error al actualizar ${entityName.toLowerCase()}`, error: err.message });
    }
}

// Función genérica para manejar eliminación de entidades con imágenes
export async function handleEntityDelete(Model, req, res, entityConfig) {
    try {
        const { id } = req.params;
        const { entityName } = entityConfig;

        // Buscar entidad existente
        const existing = await Model.findById(id);
        if (!existing) {
            return res.status(404).json({ message: `${entityName} no encontrado` });
        }

        // Eliminar imágenes de Cloudinary si las hay
        if (Array.isArray(existing.images) && existing.images.length > 0) {
            await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
        }

        // Eliminar entidad de la base de datos
        const deleted = await Model.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: `${entityName} no encontrado` });
        }

        res.json({ message: `${entityName} eliminado` });
    } catch (err) {
        res.status(500).json({ message: `Error al eliminar ${entityName.toLowerCase()}`, error: err.message });
    }
}

// Función genérica para obtener todas las entidades
export async function handleGetAllEntities(Model, req, res, entityConfig) {
    try {
        const { entityName, populate } = entityConfig;
        
        let query = Model.find();
        if (populate) {
            query = query.populate(populate);
        }
        
        const entities = await query;
        res.json(entities);
    } catch (err) {
        res.status(500).json({ message: `Error al obtener ${entityName.toLowerCase()}s`, error: err.message });
    }
}

// Función genérica para obtener una entidad por ID
export async function handleGetEntityById(Model, req, res, entityConfig) {
    try {
        const { id } = req.params;
        const { entityName, populate } = entityConfig;
        
        let query = Model.findById(id);
        if (populate) {
            query = query.populate(populate);
        }
        
        const entity = await query;
        if (!entity) {
            return res.status(404).json({ message: `${entityName} no encontrado` });
        }
        
        res.json(entity);
    } catch (err) {
        res.status(500).json({ message: `Error al obtener ${entityName.toLowerCase()}`, error: err.message });
    }
}

// ✅ CRUD genérico completado - Todas las operaciones implementadas
// ✅ handleEntityCreate - COMPLETADO
// ✅ handleEntityUpdate - COMPLETADO  
// ✅ handleEntityDelete - COMPLETADO
// ✅ handleGetAllEntities - COMPLETADO
// ✅ handleGetEntityById - COMPLETADO
