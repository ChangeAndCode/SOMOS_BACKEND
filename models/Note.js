import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: String,
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    relatedTo: {
        type: {
            type: String, // e.g., "project", "program"
        },
        refId: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true });

export default mongoose.model("Note", noteSchema);
