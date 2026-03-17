import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

// Configura o Interceptor global do Axios para injetar o Token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('saas_admin_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('saas_admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente para interceptar Erros 401 e deslogar globalmente
const GlobalAxiosInterceptor = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('saas_admin_token');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <GlobalAxiosInterceptor>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Security SaaS</h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      Modo Seguro
                    </span>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('saas_admin_token');
                        window.location.href = '/login';
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                </header>

                <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                  </Routes>
                </main>
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </GlobalAxiosInterceptor>
    </BrowserRouter>
  )
}

export default App;
