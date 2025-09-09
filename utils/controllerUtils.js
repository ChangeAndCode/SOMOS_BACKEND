import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";
import { normalizeFormData, validateFiles } from "./validation.js";

/**
 * Crear nueva entidad con manejo de imágenes en Cloudinary
 * @param {Model} Model - Modelo de MongoDB
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Object} entityConfig - Configuración: { entityName, cloudinaryFolder, normalizeFunction }
 */
export async function handleEntityCreate(Model, req, res, entityConfig) {
    try {
        const { entityName, cloudinaryFolder, fieldConfig, normalizeFunction } = entityConfig;

        // Normalizar datos del formulario
        const payload = normalizeFunction ? normalizeFunction(req.body) : normalizeFormData(req.body, fieldConfig);
        let images = [];
        
        // Procesar imágenes si se enviaron archivos
        if (req.files && req.files.length > 0) {
            const validation = validateFiles(req.files);
            if (!validation.valid) {
                return res.status(400).json({ 
                    message: "Error de validación de archivos", 
                    error: validation.error 
                });
            }

            // Subir imágenes a Cloudinary
            const uploads = await Promise.all(
                req.files.map((f) => uploadImage(f.buffer, cloudinaryFolder, f.mimetype))
            );
            images = uploads.map(u => u.url);
        }

        // Guardar en base de datos
        const newEntity = new Model({ ...payload, images });
        await newEntity.save();
        res.status(201).json(newEntity);
    } catch (err) {
        res.status(400).json({ message: `Error al crear ${entityName.toLowerCase()}`, error: err.message });
    }
}

/**
 * Actualizar entidad existente con manejo inteligente de imágenes
 * @param {Model} Model - Modelo de MongoDB
 * @param {Object} req - Request de Express (req.params.id, req.body, req.files)
 * @param {Object} res - Response de Express
 * @param {Object} entityConfig - Configuración: { entityName, cloudinaryFolder, normalizeFunction }
 */
export async function handleEntityUpdate(Model, req, res, entityConfig) {
    try {
        const { id } = req.params;
        const { entityName, cloudinaryFolder, fieldConfig, normalizeFunction } = entityConfig;

        // Verificar que la entidad existe
        const existing = await Model.findById(id);
        if (!existing) {
            return res.status(404).json({ message: `${entityName} no encontrado` });
        }

        const payload = normalizeFunction ? normalizeFunction(req.body) : normalizeFormData(req.body, fieldConfig);
        
        // Eliminar imágenes específicas de Cloudinary
        const deletedImages = Array.isArray(payload.deletedImages) ? payload.deletedImages : [];
        if (deletedImages.length > 0) {
            await Promise.all(deletedImages.map((url) => deleteImageByUrl(url)));
        }
        
        // Manejar caso especial: limpiar todas las imágenes
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
        
        // Calcular imágenes que permanecen después de eliminaciones
        const remainingImages = (existing.images || []).filter(url => !deletedImages.includes(url));
        
        // Procesar nuevas imágenes si se enviaron
        if (req.files && req.files.length > 0) {
                    const validation = validateFiles(req.files);
            if (!validation.valid) {
                return res.status(400).json({ 
                    message: "Error de validación de archivos", 
                    error: validation.error 
                });
            }

            // Subir nuevas imágenes y combinar con las existentes
            const uploads = await Promise.all(
                req.files.map((f) => uploadImage(f.buffer, cloudinaryFolder, f.mimetype))
            );
            const uploadedUrls = uploads.map(u => u.url);
            payload.images = [...remainingImages, ...uploadedUrls];
        } else {
            payload.images = remainingImages;
        }

        // Actualizar en base de datos
        const updated = await Model.findByIdAndUpdate(id, payload, { new: true });
        if (!updated) {
            return res.status(404).json({ message: `${entityName} no encontrado` });
        }
        
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: `Error al actualizar ${entityName.toLowerCase()}`, error: err.message });
    }
}

/**
 * Eliminar entidad y sus imágenes asociadas de Cloudinary
 * @param {Model} Model - Modelo de MongoDB
 * @param {Object} req - Request de Express (req.params.id)
 * @param {Object} res - Response de Express
 * @param {Object} entityConfig - Configuración: { entityName }
 */
export async function handleEntityDelete(Model, req, res, entityConfig) {
    try {
        const { id } = req.params;
        const { entityName } = entityConfig;

        // Verificar que la entidad exists
        const existing = await Model.findById(id);
        if (!existing) {
            return res.status(404).json({ message: `${entityName} no encontrado` });
        }

        // Limpiar imágenes de Cloudinary antes de eliminar
        if (Array.isArray(existing.images) && existing.images.length > 0) {
            await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
        }

        // Eliminar de la base de datos
        const deleted = await Model.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: `${entityName} no encontrado` });
        }

        res.json({ message: `${entityName} eliminado` });
    } catch (err) {
        res.status(500).json({ message: `Error al eliminar ${entityName.toLowerCase()}`, error: err.message });
    }
}

/**
 * Obtener todas las entidades con soporte para populate
 * @param {Model} Model - Modelo de MongoDB
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express  
 * @param {Object} entityConfig - Configuración: { entityName, populate? }
 */
export async function handleGetAllEntities(Model, req, res, entityConfig) {
    try {
        const { entityName, populate } = entityConfig;
        
        // Construir query con populate opcional
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

/**
 * Obtener una entidad por ID con soporte para populate
 * @param {Model} Model - Modelo de MongoDB
 * @param {Object} req - Request de Express (req.params.id)
 * @param {Object} res - Response de Express
 * @param {Object} entityConfig - Configuración: { entityName, populate? }
 */
export async function handleGetEntityById(Model, req, res, entityConfig) {
    try {
        const { id } = req.params;
        const { entityName, populate } = entityConfig;
        
        // Construir query con populate opcional
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


