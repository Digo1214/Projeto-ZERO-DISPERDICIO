import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import doacaoRoutes from "./routes/doacaoRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/teste", (req, res) => {
  console.log("BATEU NA ROTA /TESTE ---");
  res.status(200).send("O SERVIDOR ESTÁ FUNCIONANDO!");
});

app.use("/api/auth", authRoutes);
app.use("/api/doacoes", doacaoRoutes);

const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conectado ao MongoDB Atlas!");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err.message);
  });
