//server/src/modules/flow/server.js
import express from "express";
import bodyParser from "body-parser"; 

import {flow} from './flow.model.js';
import flowEngine from './flow.engine.js';

const app = express();
app.use(bodyParser.json());

const engine = new flowEngine(flow);

const sessions = {}; 

app.post("/chat", async(req, res) => {
    try{
        const {userId, message} = req.body;
    //Criar uma sessão
    
    const session = sessions[userId] || {
      currentNodeId: "start",
      context: {}  
    };

    //Executa o fluxo
    const result = await engine.run({
        currentNodeId: session.currentNodeId,
        data: message,
        context: session.context
    });
    
    sessions[userId] = {
        currentNodeId: result.nextNodeId,
        context: result.context

    };

    res.json(result); 

}catch (error){
        console.error(error); 
        res.status(500).json({error: error.message});
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});

 
