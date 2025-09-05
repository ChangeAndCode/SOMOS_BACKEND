import mongoose from "mongoose";

export async function connectDB() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/miapp";

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("🟢 Conectado a MongoDB");
    } catch (err) {
        console.error("🔴 Error conectando a MongoDB:", err.message);
        process.exit(1); // Detiene la app si falla la conexión
    }
}
