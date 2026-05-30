const { Pool } = require('pg');

// Pool de conexões com o PostgreSQL.
// SSL é necessário para a maioria dos bancos cloud (Neon, Supabase, Render).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Tratamento de erros silenciosos no pool (evita crash do processo).
pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

/**
 * Inicializa o banco de dados:
 * 1. Cria a tabela `jogos` se não existir.
 * 2. Insere os dados de seed (Zelda e FIFA 23) se a tabela estiver vazia.
 */
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jogos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        nota NUMERIC NOT NULL,
        review TEXT NOT NULL
      );
    `);

    const result = await pool.query('SELECT COUNT(*) AS total FROM jogos');
    const total = parseInt(result.rows[0].total, 10);

    if (total === 0) {
      await pool.query(`
        INSERT INTO jogos (nome, tipo, nota, review) VALUES
        ('The Legend of Zelda', 'Aventura', 10, 'Um clássico absoluto.'),
        ('FIFA 23', 'Esporte', 7, 'Bom para jogar com amigos.');
      `);
      console.log('Banco inicializado com dados de seed.');
    } else {
      console.log(`Banco já populado (${total} jogos cadastrados).`);
    }
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
    throw err;
  }
}

module.exports = { pool, initDatabase };