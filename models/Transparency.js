// models/Transparency.js
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["financial", "accountability", "board", "other"],
      required: true,
    },
    period: { type: String }, // "2024-Q3", "2025-07" (opcional)
    publishedAt: { type: Date, default: Date.now }, // antes: date
    description: String,
    tags: [{ type: String, trim: true }], // opcional

    fileUrl: { type: String, required: true },
    filePublicId: { type: String, required: true }, // NUEVO
    fileName: String,
    mimeType: String,
    size: Number,

    isPublic: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Índices útiles para listar por categoría/fecha
schema.index({ category: 1, publishedAt: -1, createdAt: -1 });

export default mongoose.model("Transparency", schema);