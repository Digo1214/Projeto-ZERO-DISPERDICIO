import mongoose from "mongoose";

const receptorSchema = new mongoose.Schema(
  {
    nomeDaOrganizacao: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    localizacao: { type: String, required: true },
    role: { type: String, default: "RECEPTOR" },
  },
  { timestamps: true }
);

export default mongoose.model("Receptor", receptorSchema);
