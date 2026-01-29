// Función genérica para normalizar campos que llegan como string vía FormData
export function normalizeFormData(body, fieldConfig = {}) {
    const normalized = { ...body };

    // Normalizar deletedImages (común para todos)
    if (typeof normalized.deletedImages === "string") {
        try {
            normalized.deletedImages = JSON.parse(normalized.deletedImages);
        } catch {
            normalized.deletedImages = [];
        }
    }

    // Normalizar campos específicos según configuración
    Object.entries(fieldConfig).forEach(([field, type]) => {
        if (type === 'json-array' && typeof normalized[field] === "string") {
            try {
                const parsed = JSON.parse(normalized[field]);
                if (Array.isArray(parsed)) {
                    normalized[field] = parsed;
                } else {
                    // Fallback: separar por comas si no es JSON válido
                    normalized[field] = String(normalized[field])
                        .split(",")
                        .map(s => s.trim())
                        .filter(Boolean);
                }
            } catch {
                // Fallback: separar por comas
                normalized[field] = String(normalized[field])
                    .split(",")
                    .map(s => s.trim())
                    .filter(Boolean);
            }
        } else if (type === 'json-object' && typeof normalized[field] === "string") {
            try {
                normalized[field] = JSON.parse(normalized[field]);
            } catch {
                // Si no es JSON válido, mantener como string
                normalized[field] = normalized[field];
            }
        } else if (type === 'date' && typeof normalized[field] === "string" && normalized[field]) {
            normalized[field] = new Date(normalized[field]);
        }
    });

    // Asegurar que arrays sean arrays
    Object.entries(fieldConfig).forEach(([field, type]) => {
        if (type === 'json-array' && normalized[field] && !Array.isArray(normalized[field])) {
            normalized[field] = [normalized[field]];
        }
    });

    return normalized;
}

// Validación de archivos
export function validateFiles(files) {
    if (!files || files.length === 0) return { valid: true };

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 10;
    const allowedTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif', 
        'image/webp'
    ];

    // Verificar número de archivos
    if (files.length > maxFiles) {
        return {
            valid: false,
            error: `Máximo ${maxFiles} archivos permitidos`
        };
    }

    // Verificar cada archivo
    for (const file of files) {
        // Verificar tipo
        if (!allowedTypes.includes(file.mimetype)) {
            return {
                valid: false,
                error: `Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten: ${allowedTypes.join(', ')}`
            };
        }

        // Verificar tamaño
        if (file.size > maxFileSize) {
            return {
                valid: false,
                error: `Archivo demasiado grande: ${file.originalname}. Máximo 5MB`
            };
        }

        // Verificar que tenga contenido
        if (!file.buffer || file.buffer.length === 0) {
            return {
                valid: false,
                error: `Archivo vacío: ${file.originalname}`
            };
        }
    }

    return { valid: true };
}

export const FIELD_CONFIGS = {
    project: {
        programs: 'json-array',
        startDate: 'date',
        endDate: 'date'
    },
    program: {
        startDate: 'date',
        endDate: 'date'
    },
    event: {
        startDate: 'date'
    },
    note: {
        relatedTo: 'json-object'
    },
    collaborator: {
        order: 'number'
    }
}
