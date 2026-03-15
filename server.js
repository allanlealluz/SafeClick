// server.js
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors');

const app = express();

// Permite receber JSON e conversar com o React
app.use(express.json());
app.use(cors());

// Rota principal que o seu React vai chamar
app.post('/api/analisar-link', async (req, res) => {
    const { urlParaAnalisar } = req.body;

    if (!urlParaAnalisar) {
        return res.status(400).json({ erro: "Nenhuma URL fornecida." });
    }

    try {
        // Pega a chave secreta do arquivo .env (não fica no código!)
        const API_KEY = process.env.GOOGLE_API_KEY;
        const endpointGoogle = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;
        
        const corpoRequisicao = {
            client: { clientId: "safeclick-app", clientVersion: "1.0.0" },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: urlParaAnalisar }]
            }
        };

        // O Backend faz a requisição para o Google
        const resposta = await fetch(endpointGoogle, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(corpoRequisicao)
        });

        const dados = await resposta.json();
        
        // Devolve a resposta do Google limpinha para o React
        res.json(dados);

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao consultar a API do Google." });
    }
});

const PORTA = process.env.PORT || 5000;
app.listen(PORTA, () => {
    console.log(`Servidor de segurança rodando na porta ${PORTA} 🛡️`);
});