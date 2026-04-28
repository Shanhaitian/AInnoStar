import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import type { User } from '../hooks/useAuth';

interface Props {
  user: User | null;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: Props) {
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b"
          style={{
            background: 'rgba(245,247,251,0.8)',
            backdropFilter: 'blur(16px)',
            borderColor: 'var(--ui-border)',
          }}>
          <div />
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--ui-muted)' }}>
            {user && (
              <>
                <span className="font-medium" style={{ color: 'var(--ui-text)' }}>{user.username}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{user.role}</span>
                <button onClick={onLogout} className="hover:underline text-red-500">退出</button>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
