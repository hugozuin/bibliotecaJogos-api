require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { pool, initDatabase } = require('./db');

const app = express();

// ========================================
// MIDDLEWARES
// ========================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Formata uma linha do banco como objeto de resposta.
 * Converte `nota` de string (NUMERIC vem como string no pg) para number.
 */
function formatJogo(row) {
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    nota: Number(row.nota),
    review: row.review
  };
}

/**
 * Valida os campos obrigatórios de um jogo.
 * Retorna mensagem de erro se inválido, ou null se ok.
 */
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
  if (typeof nota !== 'number' || !Number.isFinite(nota)) {
    return 'O campo "nota" é obrigatório e deve ser um número finito.';
  }
  if (typeof review !== 'string' || review.trim() === '') {
    return 'O campo "review" é obrigatório e deve ser uma string não vazia.';
  }
  return null;
}

// ========================================
// ROTA RAIZ E HEALTH CHECK
// ========================================

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'API Biblioteca de Jogos rodando.',
    versao: '2.0.0',
    endpoints: [
      'POST /login',
      'GET /jogos',
      'GET /jogos/:id',
      'POST /jogos',
      'PUT /jogos/:id',
      'DELETE /jogos/:id',
      'GET /health'
    ]
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Health check falhou:', err);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// ========================================
// POST /login
// ========================================
app.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (email === 'usuario@esoft.com' && password === 'Abc123') {
    return res.status(200).json({ token: crypto.randomUUID() });
  }

  return res.status(401).json({ erro: 'Credenciais inválidas.' });
});

// ========================================
// GET /jogos
// ========================================
app.get('/jogos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jogos ORDER BY id ASC');
    return res.status(200).json(result.rows.map(formatJogo));
  } catch (err) {
    console.error('Erro em GET /jogos:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// ========================================
// GET /jogos/:id
// ========================================
app.get('/jogos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ erro: 'O parâmetro "id" deve ser um número.' });
  }

  try {
    const result = await pool.query('SELECT * FROM jogos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Jogo não encontrado.' });
    }

    return res.status(200).json(formatJogo(result.rows[0]));
  } catch (err) {
    console.error('Erro em GET /jogos/:id:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// ========================================
// POST /jogos
// ========================================
app.post('/jogos', async (req, res) => {
  const erroValidacao = validarCamposJogo(req.body);
  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }

  const { nome, tipo, nota, review } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO jogos (nome, tipo, nota, review) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, tipo, nota, review]
    );
    return res.status(201).json(formatJogo(result.rows[0]));
  } catch (err) {
    console.error('Erro em POST /jogos:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// ========================================
// PUT /jogos/:id
// ========================================
app.put('/jogos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ erro: 'O parâmetro "id" deve ser um número.' });
  }

  const erroValidacao = validarCamposJogo(req.body);
  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }

  const { nome, tipo, nota, review } = req.body;

  try {
    const result = await pool.query(
      'UPDATE jogos SET nome = $1, tipo = $2, nota = $3, review = $4 WHERE id = $5 RETURNING *',
      [nome, tipo, nota, review, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Jogo não encontrado.' });
    }

    return res.status(200).json(formatJogo(result.rows[0]));
  } catch (err) {
    console.error('Erro em PUT /jogos/:id:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// ========================================
// DELETE /jogos/:id
// ========================================
app.delete('/jogos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ erro: 'O parâmetro "id" deve ser um número.' });
  }

  try {
    const result = await pool.query('DELETE FROM jogos WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Jogo não encontrado.' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('Erro em DELETE /jogos/:id:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// ========================================
// TRATAMENTO DE JSON MALFORMADO
// ========================================
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error('Erro não tratado:', err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// ========================================
// INICIALIZAÇÃO
// ========================================
const PORT = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
  });