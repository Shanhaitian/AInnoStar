import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface Props {
  onLogin: (username: string, password: string) => Promise<any>;
}

export default function Login({ onLogin }: Props) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4f6bff, #14b8a6)' }}>
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>
            AInnoStar
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>产品全生命周期智能管理平台</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl p-6 shadow-lg"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))',
            border: '1px solid var(--ui-border)',
            backdropFilter: 'blur(18px)',
          }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ui-text)' }}>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1px solid rgba(148,163,184,0.28)',
                  background: 'rgba(255,255,255,0.9)',
                  color: 'var(--ui-text)',
                }}
                placeholder="请输入用户名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ui-text)' }}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1px solid rgba(148,163,184,0.28)',
                  background: 'rgba(255,255,255,0.9)',
                  color: 'var(--ui-text)',
                }}
                placeholder="请输入密码"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #4f6bff, #3b82f6)',
                boxShadow: '0 8px 24px rgba(79,107,255,0.3)',
              }}
            >
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
