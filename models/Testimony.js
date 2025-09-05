import mongoose from "mongoose";

const testimonySchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: String,
    message: { type: String, required: true },
    images: [String],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    program: { type: mongoose.Schema.Types.ObjectId, ref: "Program" }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model("Testimony", testimonySchema);
