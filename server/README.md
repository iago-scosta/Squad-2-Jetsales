# Backend JetGO

Sprint 02 do backend do JetGO. A base da Sprint 01 continua igual na API, mas agora o foco passa a ser persistencia real com PostgreSQL usando `pg` puro.

## O que mudou na Sprint 02

- configuracao de conexao com PostgreSQL;
- arquivo `.env.example` para a configuracao local;
- migration SQL inicial das tabelas principais;
- script `npm run db:migrate` para aplicar as migrations;
- preparacao da base para trocar o `memory-store` pela persistencia real.

## Como instalar

```bash
cd server
npm install
```

## Como configurar o .env

Copie o exemplo:

```bash
cp .env.example .env
```

Exemplo de conteudo:

```env
PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/jetsales
```

O arquivo `.env` nao deve ser commitado.

## Como criar o banco local

Se tiver PostgreSQL com linha de comando:

```bash
createdb jetsales
```

Se preferir, o banco tambem pode ser criado pelo pgAdmin ou DBeaver.

## Como rodar a migration

```bash
npm run db:migrate
```

## Fluxo basico da Sprint 02

```bash
cd server
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

## Base URL

```txt
http://localhost:3001
```

## Observacao desta etapa

Neste primeiro passo da Sprint 02, a infraestrutura do PostgreSQL fica pronta. Na sequencia, os endpoints passam a salvar e ler do banco mantendo os contratos principais da API.
