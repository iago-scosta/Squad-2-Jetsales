# JetGO / Squad-2-Jetsales

Projeto academico do JetGO, uma plataforma ficticia da JetSales para criacao e
gerenciamento de chatbots, fluxos de atendimento, conversas e integracoes.

Nesta rodada o foco ficou no backend. O frontend continua no repositorio, mas
nao foi alterado aqui.

## Estrutura

- `server/` backend Node.js + Express
- `client/` frontend da equipe

## Backend desta etapa

O backend atual roda com armazenamento em memoria para facilitar os testes da
equipe. Isso significa que:

- o servidor sobe sem PostgreSQL
- as rotas funcionam localmente
- os dados ficam salvos apenas enquanto o processo estiver ativo

## Como rodar o backend

```bash
cd server
npm install
npm start
```

Servidor padrao:

```txt
http://localhost:3001
```

## Como testar o backend

```bash
cd server
npm test
```

## O que ja esta implementado no backend

- chatbots
- fluxos
- nos e edges
- conversas
- mensagens
- webhook fake de WhatsApp
- endpoint fake de IA
- analytics simples

## O que ainda e simulado

- banco em memoria
- IA fake
- WhatsApp fake
- autenticacao nao implementada

Mais detalhes e exemplos de payload estao em [server/README.md](server/README.md).
