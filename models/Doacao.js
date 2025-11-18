import mongoose from "mongoose";

const doacaoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    localizacaoRetirada: { type: String, required: true },
    status: { type: String, default: "disponivel" },

    doador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doador",
      required: true,
    },
    receptor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receptor",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doacao", doacaoSchema);
