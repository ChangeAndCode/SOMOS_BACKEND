import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    images: [String],
    status: { type: String, enum: ["draft", "active", "completed", "archived"], default: "draft" },
    startDate: Date,
    endDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    programs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }]
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
