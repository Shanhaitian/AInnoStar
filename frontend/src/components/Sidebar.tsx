import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, FileText, Sparkles, Settings, ChevronDown,
  FolderKanban, BookOpen, Wrench, Handshake,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface NavItem { to: string; label: string }
interface NavGroup { label: string; icon: React.ReactNode; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  { label: '全局看板', icon: <LayoutDashboard size={20} />, items: [{ to: '/', label: '看板总览' }] },
  {
    label: '用户调研', icon: <Search size={20} />,
    items: [
      { to: '/research', label: '调研项目' },
      { to: '/research/insights', label: '洞察看板' },
    ],
  },
  {
    label: '产品文档', icon: <FileText size={20} />,
    items: [
      { to: '/document/projects', label: '项目管理' },
      { to: '/document/requirements', label: '需求池' },
      { to: '/document/prd', label: 'PRD 文档' },
      { to: '/document/tech', label: '技术文档' },
      { to: '/document/customer', label: '客户文档' },
    ],
  },
  {
    label: 'AI 原型', icon: <Sparkles size={20} />,
    items: [
      { to: '/prototype/generate', label: '生成工作台' },
      { to: '/prototype/list', label: '原型库' },
    ],
  },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV_GROUPS.map((g) => [g.label, true]))
  );

  const toggle = (label: string) => setExpanded((p) => ({ ...p, [label]: !p[label] }));

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r h-screen sticky top-0 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(252,253,255,0.96) 0%, rgba(244,247,255,0.94) 100%)',
        borderColor: 'var(--ui-border)',
      }}>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #4f6bff, #14b8a6)' }}>AI</div>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--ui-text)' }}>AInnoStar</div>
          <div className="text-xs" style={{ color: 'var(--ui-muted)' }}>产品智能管理平台</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <button
              onClick={() => toggle(group.label)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-black/[0.04] transition-colors"
              style={{ color: 'var(--ui-muted)' }}
            >
              {group.icon}
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronDown size={14} className={clsx('transition-transform', expanded[group.label] && 'rotate-180')} />
            </button>
            {expanded[group.label] && (
              <div className="ml-2 mt-0.5 space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      clsx('block px-4 py-1.5 rounded-xl text-sm transition-all', isActive ? 'font-semibold shadow-sm' : 'hover:bg-black/[0.04]')
                    }
                    style={({ isActive }) =>
                      isActive
                        ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.22), rgba(147,197,253,0.12))', color: '#1d4ed8' }
                        : { color: 'var(--ui-muted)' }
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t shrink-0" style={{ borderColor: 'var(--ui-border)' }}>
        <NavLink to="/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-black/[0.04] transition-colors"
          style={{ color: 'var(--ui-muted)' }}>
          <Settings size={18} /><span>设置</span>
        </NavLink>
      </div>
    </aside>
  );
}
