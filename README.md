# Biblioteca de Jogos - API v2

API REST para gerenciar uma biblioteca pessoal de jogos e suas reviews.
Versão 2: integrada com PostgreSQL.

## Tecnologias
- Node.js + Express
- PostgreSQL (via Neon)
- CORS habilitado

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
```

## Como rodar localmente

```bash
npm install
npm start
```

A API ficará disponível em `http://localhost:3000`.

## Endpoints

| Método | Rota         | Descrição                  |
|--------|--------------|----------------------------|
| GET    | /health      | Verifica saúde da API e BD |
| POST   | /login       | Autenticação               |
| GET    | /jogos       | Lista todos os jogos       |
| GET    | /jogos/:id   | Detalhes de um jogo        |
| POST   | /jogos       | Cadastra um novo jogo      |
| PUT    | /jogos/:id   | Atualiza um jogo            |
| DELETE | /jogos/:id   | Remove um jogo             |

## Credenciais de teste

```json
{ "email": "usuario@esoft.com", "password": "Abc123" }
```