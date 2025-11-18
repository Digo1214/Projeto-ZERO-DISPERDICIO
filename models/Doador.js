import mongoose from "mongoose";

const doadorSchema = new mongoose.Schema(
  {
    nomeDoEstabelecimento: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    localizacao: { type: String, required: true },
    role: { type: String, default: "DOADOR" },
  },
  { timestamps: true }
);

export default mongoose.model("Doador", doadorSchema);
