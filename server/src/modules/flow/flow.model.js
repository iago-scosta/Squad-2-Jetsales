export const flowEngine = {
    states:[
        {
            id: 'start',
            type: 'message',
            message: 'Bem-vindo ao nosso atendimento! Como posso ajudar você hoje?',
            delay: 500
        },
        {
            id:'ask_name',
            type: 'message', 
            message: 'Qual é o seu nome?',
            delay: 500
        },
        {
            id:"get_name",
            type: "input",
            variable: "name",
        },
        {
            id: "welcome_user",
            type: "message",
            message: 'Prazer em conhecê-lo, {{name}}! Em que posso ajudar você hoje?',
            delay: 500
        }
    ],
    edges:[
        {from: 'start', to: 'ask_name'},
        {from: 'ask_name', to: 'get_name'},
        {from: 'get_name', to: 'welcome_user'},
    ]

};