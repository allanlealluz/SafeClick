// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/analisar-link', async (req, res) => {
    const { urlParaAnalisar } = req.body;

    if (!urlParaAnalisar) {
        return res.status(400).json({ erro: "Nenhuma URL fornecida." });
    }

    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
        const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

        // ==========================================
        // 1. VERIFICAÇÃO NO GOOGLE SAFE BROWSING
        // ==========================================
        const endpointGoogle = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;
        const corpoGoogle = {
            client: { clientId: "safeclick-app", clientVersion: "1.0.0" },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: urlParaAnalisar }]
            }
        };

        const respostaGoogle = await fetch(endpointGoogle, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(corpoGoogle)
        });
        const dadosGoogle = await respostaGoogle.json();

        // ==========================================
        // 2. VERIFICAÇÃO NO VIRUSTOTAL (API v3)
        // ==========================================
        // O VT exige que a URL seja convertida para formato "base64url"
        const urlBase64 = Buffer.from(urlParaAnalisar).toString('base64url');
        const endpointVT = `https://www.virustotal.com/api/v3/urls/${urlBase64}`;

        const respostaVT = await fetch(endpointVT, {
            method: 'GET',
            headers: { 
                'x-apikey': VIRUSTOTAL_API_KEY,
                'Accept': 'application/json'
            }
        });
        const dadosVT = await respostaVT.json();

        // ==========================================
        // 3. O CÉREBRO: CRUZANDO OS DADOS
        // ==========================================
        let statusFinal = "safe"; // Pode ser: 'safe', 'warning', 'danger'
        let mensagemFinal = "Parece Seguro! O Google e o VirusTotal não encontraram ameaças para este link.";
        let maliciososVT = 0;

        // A) Avaliando o Google
        const googleAchouPerigo = dadosGoogle.matches && dadosGoogle.matches.length > 0;
        
        // B) Avaliando o VirusTotal
        let vtAchouPerigo = false;
        // Se a URL já tiver sido analisada pelo VT, ele retorna "last_analysis_stats"
        if (dadosVT.data && dadosVT.data.attributes) {
            maliciososVT = dadosVT.data.attributes.last_analysis_stats.malicious;
            const suspeitosVT = dadosVT.data.attributes.last_analysis_stats.suspicious;
            
            if (maliciososVT > 0 || suspeitosVT > 0) {
                vtAchouPerigo = true;
            }
        }

        // C) Tomando a decisão final
        if (googleAchouPerigo || maliciososVT > 2) {
            statusFinal = "danger";
            mensagemFinal = "ALERTA MÁXIMO: O Google ou múltiplos motores do VirusTotal classificaram este site como perigoso!";
        } else if (vtAchouPerigo || (!urlParaAnalisar.startsWith("https://") && statusFinal === "safe")) {
            statusFinal = "warning";
            mensagemFinal = "CUIDADO: Encontramos alertas suspeitos neste link ou ele não possui certificado de segurança (HTTPS).";
        }

        // Envia a resposta mastigada para o React
        res.json({
            statusFinal: statusFinal,
            mensagem: mensagemFinal,
            // Opcional: Mandando os dados puros caso você queira fazer um gráfico depois
            estatisticasVT: maliciososVT 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao consultar as APIs de segurança." });
    }
});

const PORTA = process.env.PORT || 5000;
app.listen(PORTA, () => {
    console.log(`Servidor de segurança rodando na porta ${PORTA} 🛡️`);
});