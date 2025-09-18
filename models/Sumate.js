import mongoose from 'mongoose';

const sumateSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    birthDate: Date,
    profession: String,
    availability: String,
    availabilityDetails: String,
    interests: String,
    experience: String,
    motivation: String,
    comments: String,
    status: { type: String, default: 'pendiente' },
    emailSent: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Sumate', sumateSchema);