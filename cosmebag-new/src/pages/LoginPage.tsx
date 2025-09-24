import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('test@mail.com');
  const [password, setPassword] = useState('test@mail.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CosmeBag</h1>
          <p className="text-white/80 text-sm">Ваша цифровая косметичка</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 backdrop-blur text-white px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-purple-600 font-semibold rounded-2xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="text-white/80 text-sm hover:text-white transition-colors"
          >
            Нет аккаунта? Регистрация
          </Link>
        </div>

        {/* Test Account Info */}
        <div className="mt-8 p-4 bg-white/10 backdrop-blur rounded-2xl">
          <p className="text-white/80 text-xs text-center">
            Тестовый аккаунт:<br />
            test@mail.com / test@mail.com
          </p>
        </div>
      </div>
    </div>
  );
};