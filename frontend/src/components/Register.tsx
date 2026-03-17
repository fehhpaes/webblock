import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, ArrowRight, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/auth/register', { email, password });
      setSuccess('Conta criada com sucesso! Você já pode fazer login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Ocorreu um erro ao criar a conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Criar Conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Cadastre-se para acessar o painel corporativo
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-medium border border-green-100 text-center">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="sr-only">Endereço de E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Seu E-mail Corporativo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="sr-only">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Defina uma senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!success}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? 'Cadastrando...' : 'Criar Conta'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Já possui uma conta? Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
