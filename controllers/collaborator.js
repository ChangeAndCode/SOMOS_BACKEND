import Collaborator from "../models/Collaborator.js";
import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";

export async function getAllCollaborators(req, res) {
    try {
        const collaborators = await Collaborator.find().sort({ order: 1 });
        res.json(collaborators);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener colaboradores", error: err.message });
    }
}

export async function getCollaboratorById(req, res) {
    const { id } = req.params;
    try {
        const collaborator = await Collaborator.findById(id);
        if (!collaborator) {
            return res.status(404).json({ message: "Colaborador no encontrado" });
        }
        res.json(collaborator);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener colaborador", error: err.message });
    }
}

export async function createCollaborator(req, res) {
    try {
        const { name, order } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "El nombre es requerido" });
        }

        let logoUrl = null;
        
        // Procesar imagen si se envió
        if (req.files && req.files.length > 0) {
            const upload = await uploadImage(req.files[0].buffer, 'somos/logos', req.files[0].mimetype);
            logoUrl = upload.url;
        }

        if (!logoUrl) {
            return res.status(400).json({ message: "El logo es requerido" });
        }

        // Si no se especifica orden, asignar el siguiente número disponible
        let finalOrder = order;
        if (!order || order === '' || order === '0') {
            const maxOrder = await Collaborator.findOne().sort({ order: -1 }).select('order');
            finalOrder = maxOrder ? maxOrder.order + 1 : 1;
        }

        const newCollaborator = new Collaborator({ 
            name, 
            logo: logoUrl,
            order: finalOrder
        });
        
        await newCollaborator.save();
        res.status(201).json(newCollaborator);
    } catch (err) {
        console.error('Error en createCollaborator:', err);
        res.status(400).json({ message: "Error al crear colaborador", error: err.message });
    }
}

export async function updateCollaborator(req, res) {
    const { id } = req.params;
    try {
        const existing = await Collaborator.findById(id);
        if (!existing) {
            return res.status(404).json({ message: "Colaborador no encontrado" });
        }

        const { name, order } = req.body;
        const updateData = { name, order: order || 0 };

        // Si se envió una nueva imagen, eliminar la anterior y subir la nueva
        if (req.files && req.files.length > 0) {
            // Eliminar imagen anterior de Cloudinary
            if (existing.logo) {
                await deleteImageByUrl(existing.logo);
            }
            
            // Subir nueva imagen
            const upload = await uploadImage(req.files[0].buffer, 'somos/logos', req.files[0].mimetype);
            updateData.logo = upload.url;
        }

        const updated = await Collaborator.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar colaborador", error: err.message });
    }
}

export async function deleteCollaborator(req, res) {
    const { id } = req.params;
    try {
        const existing = await Collaborator.findById(id);
        if (!existing) {
            return res.status(404).json({ message: "Colaborador no encontrado" });
        }

        // Eliminar imagen de Cloudinary
        if (existing.logo) {
            await deleteImageByUrl(existing.logo);
        }

        await Collaborator.findByIdAndDelete(id);
        res.json({ message: "Colaborador eliminado exitosamente" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar colaborador", error: err.message });
    }
}
