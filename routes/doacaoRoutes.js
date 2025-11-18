import express from "express";
import Doacao from "../models/Doacao.js";
import Receptor from "../models/Receptor.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middLewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  [authMiddleware, roleMiddleware("DOADOR")],
  async (req, res) => {
    try {
      const { titulo, descricao, localizacaoRetirada } = req.body;
      const doadorId = req.user.id;

      const novaDoacao = new Doacao({
        titulo,
        descricao,
        localizacaoRetirada,
        doador: doadorId,
      });
      await novaDoacao.save();
      res.status(201).send("Doação criada com sucesso!");
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

router.get(
  "/match",
  [authMiddleware, roleMiddleware("RECEPTOR")],
  async (req, res) => {
    try {
      const receptor = await Receptor.findById(req.user.id);

      const doacoesCompativeis = await Doacao.find({
        status: "disponivel",
        localizacaoRetirada: receptor.localizacao,
      }).populate("doador", "nomeDoEstabelecimento");

      res.status(200).json(doacoesCompativeis);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

router.post(
  "/:id/reservar",
  [authMiddleware, roleMiddleware("RECEPTOR")],
  async (req, res) => {
    try {
      const doacaoId = req.params.id;
      const receptorId = req.user.id;

      const doacao = await Doacao.findById(doacaoId);
      if (!doacao) {
        return res.status(404).send("Doação não encontrada.");
      }
      if (doacao.status !== "disponivel") {
        return res.status(400).send("Esta doação não está mais disponível.");
      }

      doacao.status = "reservado";
      doacao.receptor = receptorId;
      await doacao.save();

      res.status(200).send("Doação reservada com sucesso!");
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

export default router;
