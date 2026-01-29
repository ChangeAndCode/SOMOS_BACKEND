import mongoose from "mongoose";
import dotenv from "dotenv";
import Collaborator from "./models/Collaborator.js";

dotenv.config();

async function cleanCollaborators() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/somos_db";
    await mongoose.connect(uri);
    console.log("🟢 Conectado a MongoDB");

    // Eliminar todos los colaboradores
    const result = await Collaborator.deleteMany({});
    console.log(`🗑️  ${result.deletedCount} colaboradores eliminados`);

    mongoose.connection.close();
    console.log("✅ Colección limpiada exitosamente");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

cleanCollaborators();
