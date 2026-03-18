import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, RefreshCw, X, Plus, Server, Activity, ArrowRight, Computer } from 'lucide-react';
import Sidebar from './Sidebar';

interface ConfigType {
  id: string;
  nome: string;
  sitesBloqueados: string[];
  intervaloPing: number;
}

interface Machine {
  id: string;
  hostname: string;
  ipAddress: string;
  version: string;
  lastPing: string;
}

interface NotificationType {
  msg: string;
  type: 'success' | 'error';
}

export default function Dashboard() {
  const [ambientes, setAmbientes] = useState<ConfigType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [newSite, setNewSite] = useState<string>('');
  const [notification, setNotification] = useState<NotificationType | null>(null);

  // Modal Máquinas Conectadas
  const [showMachines, setShowMachines] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(false);

  useEffect(() => {
    fetchAmbientes();
  }, []);

  const fetchMachines = async (ambienteId: string) => {
    setLoadingMachines(true);
    try {
      const { data } = await axios.get<Machine[]>(`/api/machine/ambiente/${ambienteId}`);
      setMachines(data);
    } catch (error) {
      showNotification('Erro ao carregar máquinas conectadas', 'error');
    } finally {
      setLoadingMachines(false);
    }
  };

  const fetchAmbientes = async () => {
    try {
      const { data } = await axios.get<ConfigType[]>('/api/ambiente/meus');
      setAmbientes(data);
      if (data.length > 0 && !selectedId) {
        handleSelectAmbiente(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching environments', error);
      showNotification('Erro ao carregar salas', 'error');
    }
  };

  const handleSelectAmbiente = async (id: string) => {
    setSelectedId(id);
    setLoadingConfig(true);
    try {
      const { data } = await axios.get<ConfigType>(`/api/ambiente/${id}/config`);
      setConfig(data);
    } catch (error) {
      showNotification('Erro ao carregar configurações da sala', 'error');
      setConfig(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleCreateAmbiente = async (nome: string) => {
    try {
      const { data } = await axios.post<ConfigType>('/api/ambiente/novo', { nome });
      setAmbientes([...ambientes, data]);
      handleSelectAmbiente(data.id);
      showNotification(`Sala "${nome}" criada com sucesso!`);
    } catch (error) {
      showNotification('Erro ao criar sala', 'error');
    }
  };

  const handleForceSync = async () => {
    if (!selectedId) return;
    setSyncing(true);
    try {
      await axios.post(`/api/agent/force-sync/${selectedId}`);
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
    
    if (!site || !config || !selectedId) return;
    
    if (!isValidUrl(site)) {
      showNotification('Formato de domínio inválido. Tente algo como "exemplo.com"', 'error');
      return;
    }
    
    // Check if sitesBloqueados is null (it shouldn't be based on our new API, but good for safety)
    const currentSites = config.sitesBloqueados || [];
    
    if (currentSites.includes(site)) {
      showNotification('Este site já está na lista de bloqueio.', 'error');
      return;
    }
    
    const updatedSites = [...currentSites, site];
    
    try {
        await axios.post(`/api/ambiente/${selectedId}/config`, { ...config, sitesBloqueados: updatedSites });
        setConfig(prev => prev ? ({ ...prev, sitesBloqueados: updatedSites }) : prev);
        setNewSite('');
        showNotification('Novo site salvo remotamente com sucesso!');
    } catch (e) {
        showNotification('Erro ao salvar no banco de dados', 'error');
    }
  };

  const handleRemoveSite = async (site: string) => {
    if (!config || !selectedId) return;
    const currentSites = config.sitesBloqueados || [];
    const updatedSites = currentSites.filter(s => s !== site);
    
    try {
        await axios.post(`/api/ambiente/${selectedId}/config`, { ...config, sitesBloqueados: updatedSites });
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

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden -mx-4 md:-mx-8 -mt-4 md:-mt-8">
      {/* Sidebar for Room Management */}
      <Sidebar 
        ambientes={ambientes} 
        selectedId={selectedId} 
        onSelect={handleSelectAmbiente} 
        onCreate={handleCreateAmbiente} 
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
            notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'
          }`}>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <p className="font-medium">{notification.msg}</p>
            </div>
          </div>
        )}

        {!selectedId ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <Server className="w-16 h-16 mb-4 opacity-50 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">Nenhuma Sala Selecionada</h2>
            <p className="max-w-md">Crie uma nova sala no menu lateral ou selecione uma existente para configurar as regras de bloqueio.</p>
          </div>
        ) : loadingConfig ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-2xl h-24 shadow-sm border border-gray-100"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl h-96 shadow-sm border border-gray-100"></div>
              <div className="bg-gray-800 rounded-2xl h-64 shadow-md"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 fade-in pb-12">
            {/* Header / Info da Sala */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">{config?.nome || 'Carregando...'}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 font-mono mt-0.5">
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
                <span>{syncing ? 'Sincronizar' : 'Forçar Sincronização'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Bloqueios Form + List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Sites Bloqueados</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Gerencie os domínios que os agentes bloquearão nas estações de trabalho vinculadas a esta Sala.
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gray-50/50">
                    <form onSubmit={handleAddSite} className="flex gap-2 mb-6">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 font-medium select-none pointer-events-none">
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
                      <button type="submit" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-1 font-medium shadow-sm">
                        <Plus className="w-5 h-5" /> Adicionar
                      </button>
                    </form>

                    <div className="space-y-3">
                      {!config?.sitesBloqueados || config?.sitesBloqueados?.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                          <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhum site bloqueado no momento.</p>
                        </div>
                      ) : (
                        config?.sitesBloqueados?.map(site => (
                          <div key={site} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 hover:border-red-100 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-red-400"></div>
                              <span className="font-medium text-gray-700 text-sm md:text-base">{site}</span>
                            </div>
                            <button 
                              onClick={() => handleRemoveSite(site)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
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

              {/* Status and Connected Machines Teaser */}
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
                        Os agentes conectados a esta sala irão aplicar automaticamente os bloqueios configurados. 
                        Qualquer mudança salva é sincronizada em tempo real (via SSE).
                      </p>
                      <button 
                        onClick={() => {
                          setShowMachines(true);
                          fetchMachines(selectedId!);
                        }}
                        className="text-blue-400 hover:bg-white/10 p-2 -mx-2 rounded-lg text-sm font-medium flex items-center justify-between w-full group transition-colors"
                      >
                        <span className="flex items-center gap-2"><Computer className="w-4 h-4"/> Ver Máquinas Conectadas</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* MODAL: Máquinas Conectadas */}
      {showMachines && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Computer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">Máquinas Conectadas</h3>
                  <p className="text-sm text-gray-500">Computadores monitorados na sala atual</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMachines(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingMachines ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  <p>Buscando conexões ativas...</p>
                </div>
              ) : machines.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <Computer className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-gray-500">Nenhuma máquina conectada ainda.</p>
                  <p className="text-sm mt-1 max-w-sm mx-auto">Instale o agente nos computadores desta sala utilizando o ID <strong className="text-gray-700">{selectedId}</strong></p>
                </div>
              ) : (
                <div className="space-y-3">
                  {machines.map((machine) => {
                    // Calcula se a máquina está online (ping nas ultimas 3x o intervalo ou 3 mins fallback)
                    const lastPingDate = new Date(machine.lastPing);
                    const now = new Date();
                    const diffSeconds = (now.getTime() - lastPingDate.getTime()) / 1000;
                    const isOnline = diffSeconds < ((config?.intervaloPing || 60) * 3);

                    return (
                      <div key={machine.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full shadow-sm ${isOnline ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-300'}`}></div>
                          <div>
                            <p className="font-bold text-gray-900">{machine.hostname || 'Desktop Desconhecido'}</p>
                            <p className="text-xs font-mono text-gray-500 mt-0.5">IP: {machine.ipAddress || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isOnline ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                          <p className="text-xs text-gray-400 mt-1.5" title={lastPingDate.toLocaleString()}>
                            Último ping: {isOnline ? 'Agora mesmo' : lastPingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => fetchMachines(selectedId!)}
                disabled={loadingMachines}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loadingMachines ? 'animate-spin' : ''}`} />
                Atualizar Lista
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
