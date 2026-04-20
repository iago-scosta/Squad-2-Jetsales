export function processMessage(data) {
    // implementação da lógica para processar a mensagem recebida

    const message = data.message?.tolowercase();
    
    if (!message) return "Desculpe, não entendi a mensagem.";

    if (message.includes("olá") || message.includes("oi")) {
        return "Olá! Como posso ajudar você hoje?";
    } else if (message.includes("tchau") || message.includes("adeus")) {
        return "Até logo! Se precisar de algo, é só chamar.";
    } else {
        return "Desculpe, não entendi a mensagem. Você pode tentar dizer 'olá' ou 'tchau'.";
    }   

    if (message === "1"){
        return "Você escolheu suporte"
    }

    if (message === "2"){
        return "Você escolheu vendas";
    }

    return "Desculpe, não entendi a mensagem. Você pode tentar dizer 'olá' ou 'tchau'.";
}   
