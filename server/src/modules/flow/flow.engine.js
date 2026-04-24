//motor de fluxo baseado em grafo
//execução de nodes por tipo
//contexto persistente
//suporte a API
//template dinâmico
//execução de fluxo (nodes + edges)
//controle de estado (context)
//múltiplos tipos de node (input, message, api, set)
//avaliação de condições
//interpolação de variáveis ({{name}})
//estrutura extensível
class FlowEngine{
    constructor(flow){
        this.flow = flow;
        this.edges = flow.edges;
        this.states = flow.states;
    }
    //executa o fluxo a partir do nó atual e dos dados de entrada do usuário
    async run({currentNodeId, data, context = {}}){
        this.context = context;
        //recupera o nó atual com base no ID
        let node = this.getNode(currentNodeId);
        let responses = [];
        let safety = 0;
        while(node.type !== 'input' && safety < 20){ //limite de segurança para evitar loops infinitos
            //executa a lógica do nó atual, que pode atualizar o contexto ou realizar outras ações
            await this.executeNode(node, data);
            const response = this.buildResponse(node);
            //se o nó atual tiver uma mensagem, adiciona a resposta à lista de respostas
            if(response.message){
                responses.push(response);
            }
            //determina o próximo nó com base no nó atual e na entrada do usuário
            const nextNodeId = this.getNextNodeId(node.id, data);
            node = this.getNode(nextNodeId);
            //recupera o próximo nó com base no ID
            safety++;
            //se o próximo nó for o mesmo que o atual, significa que não há transição válida, então sai do loop
            node = this.getNode(nextNodeId);
        }
        if(safety === 20){
            throw new Error('Safety limit reached, possible infinite loop detected');
        }
        return{
            responses, //retorna as respostas acumuladas durante a execução do fluxo    
            context: this.context, 
            nextNodeId,
        };

       
    }
    //recupera o nó atual com base no ID
    getNode(nodeId){
        const node = this.states.find(state => state.id === nodeId);
        //Caso o nó não seja encontrado, lança um erro
        if (!node){
            throw new Error(`Node with id ${nodeId} not found`);
        } 
        
        return node;
    }
    //determina o próximo nó com base no nó atual e na entrada do usuário
    getNextNodeId(currentNodeId, userInput){
        //recupera as edges que saem do nó atual
        const possibleEdges = this.edges.filter(
            edge => edge.from === currentNodeId
        );
            
    //avalia cada edge possível para encontrar a próxima transição válida
        for (const edge of possibleEdges){
            //avalia a condição do edge com base na entrada do usuário
            if (this.evaluateCondition(edge.condition, userInput)){
                return edge.to;
            }
        }
        return currentNodeId; //se nenhuma transição for válida, permanece no nó atual
    }

    //avalia a condição do edge 
    evaluateCondition(condition, input){
        //implementar a lógica de avaliação da condição
        if(!condition) return true; //se não houver condição, sempre retorna truer
        if(input == null) return false; //se não houver input, retorna false
        //se for uma função, executa a função com o input
        if(typeof condition === 'function'){
            return condition(input, this.context);
        }
        //se for string, compara com o input
        if(typeof condition === 'string'){
            return input.toLowerCase().includes(condition.toLowerCase());
        }

        return false; //se a condição não for reconhecida, retorna false
    }
    //constrói a resposta para o usuário com base no nó atual
    // 
    buildResponse(node){
        //implementar a lógica de construção da resposta com base no tipo do nó
        let message = node.message || null;
        //substitui as variáveis na mensagem com os valores do contexto
        if (message) {
            message = message.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                return this.context[key.trim()] || `{{${key}}}`;
    });
}
        return {
            //constrói a resposta com base no tipo do nó
            message,
            options: node.options || null,
            delay: node.delay || 0, //opcional, pode ser usado para adicionar um atraso antes de enviar a resposta  
    };
}
    async executeNode(node, input){
        //implementar a lógica de execução do nó com base no tipo do nó
        if(!node) return;
        switch(node.type){
            case 'input':
                if(node.variable){
                this.context[node.variable] = input;
                }
                break;
                //para o nó de mensagem, a resposta já é construída na função buildResponse, então não precisa fazer nada aqui
            case 'message':
                //a resposta já é construída na função buildResponse, então não precisa fazer nada aqui
                break;  
                //implementar a lógica para o nó de escolha, onde o usuário pode escolher entre várias opções
            case 'choice':
                break; 
            //implementar outros tipos de nó conforme necessário, como 'api', 'set', etc.
            case 'api':
                if(node.url && node.saveAs){
                const response = await fetch(node.url); 
                const data = await response.json();
                this.context[node.saveAs] = data; 
                }
                break;
            //para o nó de set, atualiza o contexto com a chave e valor especificados no nó
            case 'set':
                this.context[node.key] = node.value;
                break; 
            //se o tipo do nó não for reconhecido, apenas loga um aviso e continua
            default:
                console.warn(`Unknown node type: ${node.type}`);    
                break;
            }
        }
    }
