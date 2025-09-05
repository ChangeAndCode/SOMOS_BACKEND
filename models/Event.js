import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    startDate: Date,
    location: String,
    images: [String],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    program: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
