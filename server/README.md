# Backend JetGO

Primeira organizacao do backend do JetGO para a entrega inicial da disciplina.

## O que ja ficou pronto nesta base

- Express configurado com `express.json()` e `cors()`;
- rota `GET /health`;
- prefixo `/api/v1`;
- middleware de rota nao encontrada;
- middleware global de erro;
- armazenamento temporario em memoria.

## Como rodar

```bash
cd server
npm install
npm run dev
```

Por enquanto esta base prepara o terreno para os endpoints de chatbots, fluxos e webhook fake, que entram na proxima etapa.
