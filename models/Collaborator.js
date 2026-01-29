import mongoose from "mongoose";

const collaboratorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: { type: String, required: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Collaborator", collaboratorSchema);
