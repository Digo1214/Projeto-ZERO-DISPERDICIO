import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Doador from "../models/Doador.js";
import Receptor from "../models/Receptor.js";

const router = express.Router();


router.post("/register/receptor", async (req, res) => {
  try {
    console.log("1. ROTA /register/receptor FOI ACESSADA");

    const { nomeDaOrganizacao, email, senha, cnpj, localizacao } = req.body;

    console.log("2. Antes de verificar se o email existe...");

    const emailExiste = await Receptor.findOne({ email: email });

    console.log("3. Depois de verificar o email");

    if (emailExiste) {
      console.log("Email já existe. Enviando erro 400.");
      return res.status(400).json({ message: "Este email já está em uso." });
    }

    console.log("4. Hasheando a senha...");
    const senhaHash = await bcrypt.hash(senha, 10);

    console.log("5. Antes de salvar o novo receptor...");

    const novoReceptor = new Receptor({
      nomeDaOrganizacao,
      email,
      senha: senhaHash,
      cnpj,
      localizacao,
    });
    await novoReceptor.save();

    console.log("6. Receptor salvo! Enviando resposta 201.");

    res.status(201).send("Receptor cadastrado com sucesso!");
  } catch (err) {
    console.error("CAIU NO CATCH! O erro é:", err.message);

    res
      .status(500)
      .json({ message: "Erro interno no servidor", error: err.message });
  }
});


router.post("/register/doador", async (req, res) => {
  try {
    const { nomeDoEstabelecimento, email, senha, cnpj, localizacao } = req.body;

   
    const emailExiste = await Doador.findOne({ email: email });
    if (emailExiste) {
      return res.status(400).json({ message: "Este email já está em uso." });
    }

   
    const senhaHash = await bcrypt.hash(senha, 10);

    const novoDoador = new Doador({
      nomeDoEstabelecimento,
      email,
      senha: senhaHash,
      cnpj,
      localizacao,
    });
    
    await novoDoador.save();

    res.status(201).send("Doador cadastrado com sucesso!");
  } catch (err) {
    console.error("ERRO NO CADASTRO DOADOR:", err.message);
    res
      .status(500)
      .json({ message: "Erro interno no servidor", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    let usuario = await Doador.findOne({ email });
    if (!usuario) {
      usuario = await Receptor.findOne({ email });
    }
    if (!usuario) {
      return res.status(404).send("Email não encontrado.");
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).send("Senha inválida.");
    }

    const token = jwt.sign(
      { id: usuario._id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;