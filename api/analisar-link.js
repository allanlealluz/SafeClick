// Arquivo: api/analisar-link.js

export default async function handler(req, res) {
  // A Vercel bloqueia automaticamente o que não for POST
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { urlParaAnalisar } = req.body;

    // Suas chaves ficam 100% seguras aqui! A Vercel injeta elas no servidor, não no navegador.
    const apiKey = process.env.GOOGLE_API_KEY; 

    // ==========================================
    // COLE AQUI A SUA LÓGICA DO SERVER.JS 
    // (O fetch para o Google Safe Browsing, etc)
    // ==========================================

    // Exemplo de resposta de sucesso:
    return res.status(200).json({ 
      statusFinal: 'safe', // ou 'warning', 'danger'
      mensagem: `A URL ${urlParaAnalisar} foi analisada com sucesso e parece segura.` 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
}