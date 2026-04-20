import {processMessage} from "../services/chatbot.service.js";

export default async function webhookRoutes(app){
    app.post('/webhook', async (request, reply) => {
        const data = request.body;

        // Processar a mensagem recebida
        console.log('Mensagem recebida:', data);

        const response = await processMessage(data);

        // Enviar a resposta de volta para o WhatsApp

        console.log('Resposta enviada:', response);

        return reply.status(2000).send({ok: true});
    });
}