import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, RefreshCw, X, Plus, Server, Activity, ArrowRight } from 'lucide-react';

const AMBIENTE_ID = import.meta.env.VITE_AMBIENTE_ID || 'amb_12345';

interface ConfigType {
  id: string;
  nome: string;
  sitesBloqueados: string[];
  intervaloPing: number;
}

interface NotificationType {
  msg: string;
  type: 'success' | 'error';
}

export default function Dashboard() {
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [newSite, setNewSite] = useState<string>('');
  const [notification, setNotification] = useState<NotificationType | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await axios.get<ConfigType>(`/api/ambiente/${AMBIENTE_ID}/config`);
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config', error);
      // Fallback in case Backend is down
      setConfig({ 
        id: AMBIENTE_ID, 
        nome: 'Local Fallback', 
        sitesBloqueados: ['facebook.com'], 
        intervaloPing: 60 
      });
      showNotification('Conexão instável. Carregando dados locais.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await axios.post(`/api/agent/force-sync/${AMBIENTE_ID}`);
      showNotification('Sinal de sincronização enviado aos notebooks do ambiente!');
    } catch (e) {
      showNotification('Erro ao enviar sinal', 'error');
    } finally {
      setTimeout(() => setSyncing(false), 1000);
    }
  };

  const isValidUrl = (url: string) => {
    const pattern = new RegExp('^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\\.)+[a-zA-Z]{2,}$');
    return pattern.test(url);
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    const site = newSite.trim().toLowerCase();
    
    if (!site || !config) return;
    
    if (!isValidUrl(site)) {
      showNotification('Formato de domínio inválido. Tente algo como "exemplo.com"', 'error');
      return;
    }
    
    if (config.sitesBloqueados.includes(site)) {
      showNotification('Este site já está na lista de bloqueio.', 'error');
      return;
    }
    
    const updatedSites = [...config.sitesBloqueados, site];
    
    try {
        await axios.post(`/api/ambiente/${AMBIENTE_ID}/config`, { ...config, sitesBloqueados: updatedSites });
        setConfig(prev => prev ? ({ ...prev, sitesBloqueados: updatedSites }) : prev);
        setNewSite('');
        showNotification('Novo site salvo remotamente com sucesso!');
    } catch (e) {
        showNotification('Erro ao salvar no banco de dados', 'error');
    }
  };

  const handleRemoveSite = async (site: string) => {
    if (!config) return;
    const updatedSites = config.sitesBloqueados.filter(s => s !== site);
    
    try {
        await axios.post(`/api/ambiente/${AMBIENTE_ID}/config`, { ...config, sitesBloqueados: updatedSites });
        setConfig(prev => prev ? ({ ...prev, sitesBloqueados: updatedSites }) : prev);
        showNotification('Site removido permanentemente!');
    } catch (e) {
        showNotification('Erro ao deletar regra no servidor', 'error');
    }
  };

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl h-24 shadow-sm border border-gray-100"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl h-96 shadow-sm border border-gray-100"></div>
          <div className="bg-gray-800 rounded-2xl h-64 shadow-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform translate-y-0 ${
          notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'
        }`}>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <p className="font-medium">{notification.msg}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{config?.nome || 'Ambiente Corporativo'}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> ID: {config?.id}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleForceSync}
          disabled={syncing}
          className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span>{syncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Sites Bloqueados</h3>
              </div>
              <p className="text-sm text-gray-500">
                Gerencie os domínios que os agentes bloquearão nas estações de trabalho.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50/50">
              <form onSubmit={handleAddSite} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 font-medium">
                    https://
                  </span>
                  <input 
                    type="text" 
                    className="w-full pl-16 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="exemplo.com"
                    value={newSite}
                    onChange={(e) => setNewSite(e.target.value)}
                  />
                </div>
                <button type="submit" className="bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-1 font-medium shadow-sm">
                  <Plus className="w-5 h-5" /> Adicionar
                </button>
              </form>

              <div className="space-y-3">
                {config?.sitesBloqueados?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum site bloqueado no momento.</p>
                  </div>
                ) : (
                  config?.sitesBloqueados?.map(site => (
                    <div key={site} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-red-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span className="font-medium text-gray-700">{site}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveSite(site)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remover regra"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="font-semibold text-gray-300 text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Agent Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-4xl font-light mb-1">{config?.intervaloPing || 60}<span className="text-lg text-gray-400 font-normal">s</span></p>
                <p className="text-sm text-gray-400">Intervalo de Ping Configurável</p>
              </div>
              
              <div className="pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  Os agentes conectados a este ambiente estão operando em modo Server-Sent Events (SSE). 
                </p>
                <button className="text-blue-400 text-sm font-medium flex items-center gap-1 hover:text-blue-300 group">
                  Ver máquinas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
