import { useEffect, useState } from 'react';
import { Search, FileText, Sparkles, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  color: string;
}

function StatCard({ icon, label, value, change, color }: StatCardProps) {
  return (
    <div className="rounded-2xl p-5 transition-all hover:-translate-y-0.5 animate-slide-up"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))',
        border: '1px solid var(--ui-border)',
        boxShadow: '0 14px 34px rgba(15,23,42,0.05)',
      }}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color }}>
          {icon}
        </div>
        {change && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight size={12} /> {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-extrabold" style={{ color: 'var(--ui-text)' }}>{value}</div>
        <div className="text-sm mt-0.5" style={{ color: 'var(--ui-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [prds, setPRDs] = useState<any[]>([]);

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {});
    api.listRequirements().then(setRequirements).catch(() => {});
    api.listPRDs().then(setPRDs).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>
          全局看板
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>
          产品全生命周期概览，掌控调研、文档、原型各模块进展
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Search size={20} className="text-blue-600" />}
          label="调研项目"
          value={projects.length}
          color="rgba(59,130,246,0.12)"
        />
        <StatCard
          icon={<FileText size={20} className="text-violet-600" />}
          label="需求池"
          value={requirements.length}
          color="rgba(139,92,246,0.12)"
        />
        <StatCard
          icon={<Activity size={20} className="text-emerald-600" />}
          label="PRD 文档"
          value={prds.length}
          color="rgba(16,185,129,0.12)"
        />
        <StatCard
          icon={<Sparkles size={20} className="text-amber-600" />}
          label="原型项目"
          value="—"
          color="rgba(245,158,11,0.12)"
        />
      </div>

      {/* Funnel + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Requirement Funnel */}
        <div className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(239,246,255,0.66))',
            border: '1px solid var(--ui-border)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 18px 44px rgba(15,23,42,0.06)',
          }}>
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--ui-text)' }}>需求漏斗</h3>
          <div className="space-y-3">
            {[
              { stage: '调研洞察', count: projects.length, color: '#3b82f6', width: '100%' },
              { stage: '需求池', count: requirements.length, color: '#8b5cf6', width: '75%' },
              { stage: 'PRD', count: prds.length, color: '#14b8a6', width: '50%' },
              { stage: '原型', count: 0, color: '#f59e0b', width: '25%' },
            ].map((item) => (
              <div key={item.stage} className="flex items-center gap-3">
                <span className="text-xs w-16 shrink-0 text-right" style={{ color: 'var(--ui-muted)' }}>{item.stage}</span>
                <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <div className="h-full rounded-lg flex items-center px-2 text-xs text-white font-medium transition-all"
                    style={{ width: item.width, background: item.color, minWidth: '2rem' }}>
                    {item.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(239,246,255,0.66))',
            border: '1px solid var(--ui-border)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 18px 44px rgba(15,23,42,0.06)',
          }}>
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--ui-text)' }}>快速操作</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/research', label: '新建调研', icon: <Search size={18} />, color: '#3b82f6' },
              { to: '/document/requirements', label: '添加需求', icon: <FileText size={18} />, color: '#8b5cf6' },
              { to: '/document/prd', label: '生成 PRD', icon: <Activity size={18} />, color: '#14b8a6' },
              { to: '/prototype/generate', label: '生成原型', icon: <Sparkles size={18} />, color: '#f59e0b' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.to}
                className="flex items-center gap-2.5 p-3 rounded-xl transition-all hover:-translate-y-0.5"
                style={{
                  border: '1px solid var(--ui-border)',
                  background: 'rgba(255,255,255,0.78)',
                  color: 'var(--ui-text)',
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${action.color}18` }}>
                  <span style={{ color: action.color }}>{action.icon}</span>
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
