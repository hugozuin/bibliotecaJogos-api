# Biblioteca de Jogos - API

API REST para gerenciar uma biblioteca pessoal de jogos e suas reviews.
Trabalho da disciplina de Programação Mobile - 2º Bimestre.

## Tecnologias
- Node.js
- Express

## Como rodar localmente

```bash
npm install
npm start
```

A API ficará disponível em `http://localhost:3000`.

## Endpoints

| Método | Rota          | Descrição                  |
|--------|---------------|----------------------------|
| POST   | /login        | Autenticação               |
| GET    | /jogos        | Lista todos os jogos       |
| GET    | /jogos/:id    | Detalhes de um jogo        |
| POST   | /jogos        | Cadastra um novo jogo      |
| PUT    | /jogos/:id    | Atualiza um jogo existente |
| DELETE | /jogos/:id    | Remove um jogo             |

## Credenciais de teste (POST /login)

```json
{ "email": "usuario@esoft.com", "password": "Abc123" }
```
