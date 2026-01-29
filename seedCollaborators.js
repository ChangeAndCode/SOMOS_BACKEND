import mongoose from "mongoose";
import dotenv from "dotenv";
import Collaborator from "./models/Collaborator.js";

dotenv.config();

const collaboratorsData = [
  {
    name: "COPREV",
    logo: "https://res.cloudinary.com/dintpt52z/image/upload/v1757366751/somos/logos/coprev.jpg",
    order: 1
  },
  {
    name: "SOMOS",
    logo: "https://res.cloudinary.com/dintpt52z/image/upload/v1757366753/somos/logos/somos.png",
    order: 2
  },
  {
    name: "Red Emprende",
    logo: "https://res.cloudinary.com/dintpt52z/image/upload/v1757366751/somos/logos/red-emprende.png",
    order: 3
  },
  {
    name: "Red Pro",
    logo: "https://res.cloudinary.com/dintpt52z/image/upload/v1757366751/somos/logos/redpro.png",
    order: 4
  }
];

async function seedCollaborators() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/somos_db";
    await mongoose.connect(uri);
    console.log("🟢 Conectado a MongoDB");

    // Limpiar colección existente
    await Collaborator.deleteMany({});
    console.log("🗑️  Colección de colaboradores limpiada");

    // Insertar datos
    await Collaborator.insertMany(collaboratorsData);
    console.log("✅ Colaboradores insertados exitosamente");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seedCollaborators();
