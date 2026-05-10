const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());


// DADOS INICIAIS (em memória)
let jogos = [
  {
    id: 1,
    nome: "The Legend of Zelda",
    tipo: "Aventura",
    nota: 10,
    review: "Um clássico absoluto."
  },
  {
    id: 2,
    nome: "FIFA 23",
    tipo: "Esporte",
    nota: 7,
    review: "Bom para jogar com amigos."
  }
];

let proximoId = 3;


// FUNÇÃO AUXILIAR DE VALIDAÇÃO
function validarCamposJogo(body) {
  if (!body || typeof body !== 'object') {
    return 'Corpo da requisição inválido.';
  }
  const { nome, tipo, nota, review } = body;

  if (typeof nome !== 'string' || nome.trim() === '') {
    return 'O campo "nome" é obrigatório e deve ser uma string não vazia.';
  }
  if (typeof tipo !== 'string' || tipo.trim() === '') {
    return 'O campo "tipo" é obrigatório e deve ser uma string não vazia.';
  }
  if (typeof nota !== 'number' || Number.isNaN(nota)) {
    return 'O campo "nota" é obrigatório e deve ser um número.';
  }
  if (typeof review !== 'string' || review.trim() === '') {
    return 'O campo "review" é obrigatório e deve ser uma string não vazia.';
  }
  return null;
}


// ROTA DE STATUS (opcional, útil pro deploy)
app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'API Biblioteca de Jogos rodando.',
    endpoints: [
      'POST /login',
      'GET /jogos',
      'GET /jogos/:id',
      'POST /jogos',
      'PUT /jogos/:id',
      'DELETE /jogos/:id'
    ]
  });
});


// POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (email === 'usuario@esoft.com' && password === 'Abc123') {
    return res.status(200).json({ token: crypto.randomUUID() });
  }

  return res.status(401).json({ erro: 'Credenciais inválidas.' });
});


// GET /jogos
app.get('/jogos', (req, res) => {
  return res.status(200).json(jogos);
});


// GET /jogos/:id
app.get('/jogos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ erro: 'O parâmetro "id" deve ser um número.' });
  }

  const jogo = jogos.find(j => j.id === id);

  if (!jogo) {
    return res.status(404).json({ erro: 'Jogo não encontrado.' });
  }

  return res.status(200).json(jogo);
});


// POST /jogos
app.post('/jogos', (req, res) => {
  const erroValidacao = validarCamposJogo(req.body);
  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }

  const { nome, tipo, nota, review } = req.body;

  const novoJogo = {
    id: proximoId++,
    nome,
    tipo,
    nota,
    review
  };

  jogos.push(novoJogo);
  return res.status(201).json(novoJogo);
});


// PUT /jogos/:id
app.put('/jogos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ erro: 'O parâmetro "id" deve ser um número.' });
  }

  const erroValidacao = validarCamposJogo(req.body);
  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }

  const index = jogos.findIndex(j => j.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: 'Jogo não encontrado.' });
  }

  const { nome, tipo, nota, review } = req.body;

  jogos[index] = { id, nome, tipo, nota, review };
  return res.status(200).json(jogos[index]);
});


// DELETE /jogos/:id
app.delete('/jogos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ erro: 'O parâmetro "id" deve ser um número.' });
  }

  const index = jogos.findIndex(j => j.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: 'Jogo não encontrado.' });
  }

  jogos.splice(index, 1);
  return res.status(204).send();
});


// MIDDLEWARE DE ERRO (JSON malformado)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});


// INICIA O SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});