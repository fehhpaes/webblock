import EventSource from 'eventsource';
import axios from 'axios';

const AMBIENTE_ID: string = process.env.AMBIENTE_ID || 'amb_12345';
const BACKEND_URL: string = process.env.BACKEND_URL || 'http://localhost:8080';
const INSTALL_KEY: string = process.env.INSTALL_KEY || 'CHAVE-SECRETA-MUITO-SEGURA';

console.log(`[Agente TS] Iniciando... Conectando no Ambiente ID: ${AMBIENTE_ID}`);

interface AmbienteConfig {
  id: string;
  nome: string;
  sitesBloqueados: string[];
  intervaloPing: number;
}

// 1. Obter JWT do Servidor
async function startAgent() {
    try {
        console.log('[Agente TS] Autenticando com o servidor...');
        const authResponse = await axios.post(`${BACKEND_URL}/api/auth/agent`, {
            ambienteId: AMBIENTE_ID,
            installKey: INSTALL_KEY
        });
        
        const token = authResponse.data.token;
        console.log('[Agente TS] Autenticação bem-sucedida! Token recebido.');

        // 2. Conectar ao SSE usando o token na Query String
        const sse = new EventSource(`${BACKEND_URL}/api/agent/connect/${AMBIENTE_ID}?token=${token}`);

        sse.onopen = () => {
            console.log('[Agente TS] Conectado ao servidor SSE e escutando comandos.');
        };

        sse.addEventListener('update', async (e: MessageEvent) => {
            console.log(`[Agente TS] Recebeu comando de atualização da nuvem: ${e.data}`);
            
            try {
                // Ao buscar regras REST, também é preciso mandar o JWT
                const reqConfig = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get<AmbienteConfig>(`${BACKEND_URL}/api/ambiente/${AMBIENTE_ID}/config`, reqConfig);
                
                const config = response.data;
                console.log(`[Agente TS] ATUALIZAÇÃO SUCESSO!`);
                console.log(`[Agente TS] Aplicando Bloqueios:`, config.sitesBloqueados);
            } catch (error: any) {
                console.error('[Agente TS] Falha ao fazer fetch da nova configuração:', error.message);
            }
        });

        sse.onerror = (err: Event) => {
            console.error('[Agente TS] Conexão SSE perdida. Tentando reconectar...');
        };

    } catch (e: any) {
        console.error('[Agente TS] Falha grave na autenticação inicial:', e.message);
        process.exit(1);
    }
}

startAgent();
setInterval(() => {}, 1 << 30);
