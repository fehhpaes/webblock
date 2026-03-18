import React, { useState } from 'react';
import { Server, Plus, ChevronRight } from 'lucide-react';

interface ConfigType {
  id: string;
  nome: string;
}

interface SidebarProps {
  ambientes: ConfigType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (nome: string) => void;
}

export default function Sidebar({ ambientes, selectedId, onSelect, onCreate }: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [novoNome, setNovoNome] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoNome.trim()) {
      onCreate(novoNome.trim());
      setNovoNome('');
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col pt-6 pb-4">
      <div className="px-6 pb-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Minhas Salas</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Nova Sala"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isCreating && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <form onSubmit={handleCreate} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Nome da Sala (ex: Lab 01)"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)} 
                className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-200"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pt-2 px-3">
        {ambientes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-6 p-4 border border-dashed border-gray-200 rounded-xl">
            Nenhuma sala criada.
          </p>
        ) : (
          <ul className="space-y-1">
            {ambientes.map((amb) => (
              <li key={amb.id}>
                <button
                  onClick={() => onSelect(amb.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                    selectedId === amb.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Server className={`w-4 h-4 ${selectedId === amb.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="truncate">{amb.nome}</span>
                  </div>
                  {selectedId === amb.id && <ChevronRight className="w-4 h-4 text-blue-600" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
