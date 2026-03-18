import EventSource from 'eventsource';
import axios from 'axios';
import * as os from 'os';

const AMBIENTE_ID: string = process.env.AMBIENTE_ID || 'amb_12345';
const BACKEND_URL: string = process.env.BACKEND_URL || 'http://localhost:8080';
const INSTALL_KEY: string = process.env.INSTALL_KEY || 'CHAVE-SECRETA-MUITO-SEGURA';

const VERSION = '1.0.0';

// Captura informações da máquina
const hostname = os.hostname();
const networkInterfaces = os.networkInterfaces();
let ipAddress = 'N/A';

// Tenta achar um IP IPv4 não-loopback
for (const iface of Object.values(networkInterfaces)) {
  if (!iface) continue;
  for (const alias of iface) {
    if (alias.family === 'IPv4' && !alias.internal) {
      ipAddress = alias.address;
      break;
    }
  }
  if (ipAddress !== 'N/A') break;
}

console.log(`[WebBlock Agent v${VERSION}] Hostname: ${hostname} | IP: ${ipAddress}`);
console.log(`[WebBlock Agent] Conectando no Ambiente ID: ${AMBIENTE_ID}`);

interface AmbienteConfig {
  id: string;
  nome: string;
  sitesBloqueados: string[];
  intervaloPing: number;
}

// Aplica os bloqueios (log para debug; implementação real editaria o hosts file)
function applyBlockRules(sites: string[]) {
  if (sites.length === 0) {
    console.log('[WebBlock Agent] Nenhum site para bloquear.');
  } else {
    console.log(`[WebBlock Agent] Bloqueando ${sites.length} site(s): ${sites.join(', ')}`);
  }
}

// Envia heartbeat para o servidor
async function sendHeartbeat() {
  try {
    await axios.post(`${BACKEND_URL}/api/machine/heartbeat`, {
      ambienteId: AMBIENTE_ID,
      installKey: INSTALL_KEY,
      hostname: hostname,
      ipAddress: ipAddress,
      version: VERSION,
    });
    console.log(`[WebBlock Agent] Heartbeat enviado (${new Date().toLocaleTimeString()})`);
  } catch (e: any) {
    console.warn(`[WebBlock Agent] Falha ao enviar heartbeat: ${e.message}`);
  }
}

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

async function startAgent() {
  try {
    console.log('[WebBlock Agent] Autenticando com o servidor...');
    const authResponse = await axios.post(`${BACKEND_URL}/api/auth/agent`, {
      ambienteId: AMBIENTE_ID,
      installKey: INSTALL_KEY,
    });

    const token = authResponse.data.token;
    console.log('[WebBlock Agent] Autenticação bem-sucedida!');

    // Busca config inicial e aplica bloqueios
    const reqConfig = { headers: { Authorization: `Bearer ${token}` } };
    const configResponse = await axios.get<AmbienteConfig>(
      `${BACKEND_URL}/api/ambiente/${AMBIENTE_ID}/config`,
      reqConfig
    );
    const ambienteConfig = configResponse.data;
    applyBlockRules(ambienteConfig.sitesBloqueados);

    // Envia heartbeat imediatamente e agenda repetição
    await sendHeartbeat();
    const pingInterval = (ambienteConfig.intervaloPing || 60) * 1000;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(sendHeartbeat, pingInterval);
    console.log(`[WebBlock Agent] Heartbeat configurado a cada ${ambienteConfig.intervaloPing || 60}s`);

    // Abre conexão SSE para receber atualizações em tempo real
    const sse = new EventSource(`${BACKEND_URL}/api/agent/connect/${AMBIENTE_ID}?token=${token}`);

    sse.onopen = () => {
      console.log('[WebBlock Agent] Conectado ao SSE e escutando comandos.');
    };

    sse.addEventListener('update', async (_e: MessageEvent) => {
      console.log('[WebBlock Agent] Recebeu comando de atualização!');
      try {
        const updated = await axios.get<AmbienteConfig>(
          `${BACKEND_URL}/api/ambiente/${AMBIENTE_ID}/config`,
          reqConfig
        );
        applyBlockRules(updated.data.sitesBloqueados);
      } catch (error: any) {
        console.error('[WebBlock Agent] Falha ao buscar nova configuração:', error.message);
      }
    });

    sse.onerror = () => {
      console.warn('[WebBlock Agent] SSE desconectado. Reconectando em 30s...');
      sse.close();
      setTimeout(startAgent, 30_000);
    };

  } catch (e: any) {
    console.error('[WebBlock Agent] Falha na inicialização:', e.message);
    console.log('[WebBlock Agent] Tentando novamente em 60s...');
    setTimeout(startAgent, 60_000);
  }
}

startAgent();
// Mantém o processo vivo
setInterval(() => {}, 1 << 30);
