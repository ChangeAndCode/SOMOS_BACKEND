// controllers/transparency.js
import Transparency from "../models/Transparency.js";
import { uploadBuffer, deleteByPublicId } from "../services/cloudinary.js";

export async function listPublic(req, res) {
  try {
    const {
      category,
      q,
      year,
      type,
      sort = "new",
      page = 1,
      limit = 12,
    } = req.query;
    const filter = { isPublic: true };
    if (category) filter.category = category;

    if (year) {
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
      filter.$or = [
        { publishedAt: { $gte: start, $lt: end } },
        { createdAt: { $gte: start, $lt: end } },
      ];
    }

    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { tags: new RegExp(q, "i") },
      ];
    }

    if (type) filter.mimeType = new RegExp(type, "i");

    let sortBy = { publishedAt: -1, createdAt: -1 };
    if (sort === "old") sortBy = { publishedAt: 1, createdAt: 1 };
    if (sort === "title") sortBy = { title: 1 };

    const docs = await Transparency.find(filter)
      .sort(sortBy)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Transparency.countDocuments(filter);

    res.json({ page: Number(page), total, items: docs });
  } catch (e) {
    res.status(500).json({ message: "Error al listar", error: e.message });
  }
}

export async function getOne(req, res) {
  try {
    const doc = await Transparency.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "No encontrado" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: "Error al obtener", error: e.message });
  }
}

export async function createTransparency(req, res) {
  try {
    const { title, category, period, description, publishedAt, tags } =
      req.body;
    if (!req.file)
      return res
        .status(400)
        .json({ message: "Archivo requerido (field: file)" });

    // Subir a Cloudinary como RAW
    const uploaded = await uploadBuffer(req.file.buffer, {
      folder: "somos/transparency",
      mimeType: req.file.mimetype,
      resourceType: "raw",
    });

    const doc = await Transparency.create({
      title,
      category,
      period,
      description,
      tags: Array.isArray(tags)
        ? tags
        : tags
        ? String(tags)
            .split(",")
            .map((s) => s.trim())
        : [],
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      fileUrl: uploaded.url,
      filePublicId: uploaded.publicId, // <- requerido por el modelo
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      createdBy: req.user?.userId || null,
    });

    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: "Error al crear", error: e.message });
  }
}

export async function updateTransparency(req, res) {
  try {
    const { id } = req.params;
    const prev = await Transparency.findById(id);
    if (!prev) return res.status(404).json({ message: "No encontrado" });

    const updates = {
      title: req.body.title ?? prev.title,
      category: req.body.category ?? prev.category,
      period: req.body.period ?? prev.period,
      description: req.body.description ?? prev.description,
      tags: req.body.tags
        ? Array.isArray(req.body.tags)
          ? req.body.tags
          : String(req.body.tags)
              .split(",")
              .map((s) => s.trim())
        : prev.tags,
      publishedAt: req.body.publishedAt
        ? new Date(req.body.publishedAt)
        : prev.publishedAt,
    };

    // ¿reemplazo de archivo?
    if (req.file) {
      // borra el anterior en Cloudinary
      if (prev.filePublicId) await deleteByPublicId(prev.filePublicId, "raw");
      // sube el nuevo
      const uploaded = await uploadBuffer(req.file.buffer, {
        folder: "somos/transparency",
        mimeType: req.file.mimetype,
        resourceType: "raw",
      });
      updates.fileUrl = uploaded.url;
      updates.filePublicId = uploaded.publicId;
      updates.fileName = req.file.originalname;
      updates.mimeType = req.file.mimetype;
      updates.size = req.file.size;
    }

    const updated = await Transparency.findByIdAndUpdate(id, updates, {
      new: true,
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: "Error al actualizar", error: e.message });
  }
}

export async function deleteTransparency(req, res) {
  try {
    const { id } = req.params;
    const doc = await Transparency.findById(id);
    if (!doc) return res.status(404).json({ message: "No encontrado" });

    if (doc.filePublicId) await deleteByPublicId(doc.filePublicId, "raw");
    await doc.deleteOne();

    res.json({ message: "Eliminado" });
  } catch (e) {
    res.status(400).json({ message: "Error al eliminar", error: e.message });
  }
}
