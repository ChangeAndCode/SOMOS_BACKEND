// controllers/transparency.js
import Transparency from '../models/Transparency.js';
import supabase from '../services/supabase.js';

export async function listPublic(req, res) {
  try {
    const {
      category,
      q,
      year,
      type,
      sort = 'new',
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
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { tags: new RegExp(q, 'i') },
        aquí,
      ];
    }

    if (type) filter.mimeType = new RegExp(type, 'i');

    let sortBy = { publishedAt: -1, createdAt: -1 };
    if (sort === 'old') sortBy = { publishedAt: 1, createdAt: 1 };
    if (sort === 'title') sortBy = { title: 1 };

    const docs = await Transparency.find(filter)
      .sort(sortBy)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Transparency.countDocuments(filter);

    res.json({ page: Number(page), total, items: docs });
  } catch (e) {
    res.status(500).json({ message: 'Error al listar', error: e.message });
  }
}

export async function listAll(req, res) {
  try {
    const {
      category,
      q,
      year,
      type,
      sort = 'new',
      page = 1,
      limit = 50,
    } = req.query;
    const filter = {}; // Sin filtro de isPublic - muestra todos
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
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { tags: new RegExp(q, 'i') },
      ];
    }

    if (type) filter.mimeType = new RegExp(type, 'i');

    let sortBy = { createdAt: -1 }; // Ordenar por fecha de creación para admin
    if (sort === 'old') sortBy = { createdAt: 1 };
    if (sort === 'fileName') sortBy = { fileName: 1 };
    if (sort === 'published') sortBy = { publishedAt: -1 };

    const docs = await Transparency.find(filter)
      .sort(sortBy)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Transparency.countDocuments(filter);

    res.json({ page: Number(page), total, items: docs });
  } catch (e) {
    res
      .status(500)
      .json({ message: 'Error al listar todos', error: e.message });
  }
}

export async function getOne(req, res) {
  try {
    const doc = await Transparency.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'No encontrado' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener', error: e.message });
  }
}

export async function createTransparency(req, res) {
  try {
    const { title, category, period, description, publishedAt, tags } =
      req.body;
    const file = req.files?.file?.[0];
    if (!file)
      return res
        .status(400)
        .json({ message: 'Archivo requerido (field: file)' });

    // Subir archivo a Supabase y obtener URL pública y publicId
    const { url: fileUrl, publicId, error } = await uploadDocument(file);
    if (error)
      return res.status(500).json({ message: 'Error al subir archivo', error });

    const doc = await Transparency.create({
      title,
      category,
      period,
      description,
      tags: Array.isArray(tags)
        ? tags
        : tags
        ? String(tags)
            .split(',')
            .map((s) => s.trim())
        : [],
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileUrl,
      filePublicId: publicId,
      createdBy: req.user?.userId || null,
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: 'Error al crear', error: e.message });
  }
}

export async function updateTransparency(req, res) {
  try {
    const { id } = req.params;
    const prev = await Transparency.findById(id);
    if (!prev) return res.status(404).json({ message: 'No encontrado' });

    const updates = {
      title: req.body.title ?? prev.title,
      category: req.body.category ?? prev.category,
      period: req.body.period ?? prev.period,
      description: req.body.description ?? prev.description,
      tags: (() => {
        if (!req.body.tags) return prev.tags;
        let tagsValue = req.body.tags;
        if (Array.isArray(tagsValue)) return tagsValue;
        if (typeof tagsValue === 'string') {
          let cleanTags = tagsValue.trim();
          if (cleanTags.startsWith('[') || cleanTags.startsWith('"')) {
            try {
              let parsed = JSON.parse(cleanTags);
              if (Array.isArray(parsed)) return parsed;
              return String(parsed)
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
            } catch (e) {
              console.error('Error parsing tags JSON:', e);
            }
          }
          return cleanTags
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        }
        return prev.tags;
      })(),
      publishedAt: req.body.publishedAt
        ? new Date(req.body.publishedAt)
        : prev.publishedAt,
    };

    // ¿reemplazo de archivo?
    const file = req.files?.file?.[0];
    if (file) {
      // Subir archivo a Supabase y obtener URL pública y publicId
      const { url: fileUrl, publicId, error } = await uploadDocument(file);
      if (error)
        return res
          .status(500)
          .json({ message: 'Error al subir archivo', error });
      updates.fileName = file.originalname;
      updates.mimeType = file.mimetype;
      updates.size = file.size;
      updates.fileUrl = fileUrl;
      updates.filePublicId = publicId;
      // Eliminar archivo anterior de Supabase
      if (prev.filePublicId) {
        const { success, error } = await deleteDocument(prev.filePublicId);
        if (error) {
          return res
            .status(500)
            .json({ message: 'Error al eliminar archivo', error });
        }
      }
    }

    const updated = await Transparency.findByIdAndUpdate(id, updates, {
      new: true,
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: 'Error al actualizar', error: e.message });
  }
}

export async function deleteTransparency(req, res) {
  try {
    const { id } = req.params;
    const doc = await Transparency.findById(id);
    if (!doc) return res.status(404).json({ message: 'No encontrado' });
    const url = doc.filePublicId;
    if (url) {
      const { success, error } = await deleteDocument(url);
      if (error) {
        return res
          .status(500)
          .json({ message: 'Error al eliminar archivo', error });
      }
    }
    await doc.deleteOne();
    res.json({ message: 'Eliminado' });
  } catch (e) {
    res.status(400).json({ message: 'Error al eliminar', error: e.message });
  }
}

// controllers/transparency.js
export async function uploadTransparencyFile(req, res) {
  try {
    const file = req.files?.file?.[0];
    if (!file) {
      return res
        .status(400)
        .json({ message: 'Archivo requerido (field: file)' });
    }
    const result = await uploadDocument(file);
    if (result.error) {
      return res
        .status(500)
        .json({ message: 'Error al subir archivo', error: result.error });
    }
    res.json({ url: result.url });
  } catch (e) {
    res.status(500).json({ message: 'Error inesperado', error: e.message });
  }
}

export async function uploadDocument(file) {
  const safeName = file.originalname
    .replace(/\s+/g, '_') // Reemplaza espacios por guiones bajos
    .normalize('NFD') // Elimina acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, ''); // Elimina caracteres especiales

  const fileName = `${Date.now()}-${safeName}`;
  const filePath = `transparency/${fileName}`;
  const { data, error } = await supabase.storage
    .from('Somos')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    console.error('Error:', error);
    return { url: null, publicId: null, error: error.message };
  }

  const { data: publicData, error: urlError } = supabase.storage
    .from('Somos')
    .getPublicUrl(filePath);

  if (urlError) {
    console.error('Error obteniendo URL:', urlError);
    return { url: null, publicId: filePath, error: urlError.message };
  }

  return { url: publicData.publicUrl, publicId: filePath, error: null };
}

export async function deleteDocument(filePublicId) {
  const { error } = await supabase.storage.from('Somos').remove([filePublicId]); // filePublicId es la ruta guardada, ej: 'transparency/123-nombre.pdf'
  if (error) {
    console.error('Error eliminando archivo:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
