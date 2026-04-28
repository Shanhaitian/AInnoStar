import { useEffect, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { api } from '../../lib/api';

export default function ResearchList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const p = await api.createProject(name, goal);
    setProjects((prev) => [p, ...prev]);
    setName(''); setGoal(''); setShowCreate(false);
  };

  const STATUS_LABEL: Record<string, { text: string; color: string; bg: string }> = {
    planning: { text: '计划中', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    active: { text: '进行中', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    completed: { text: '已完成', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>用户调研</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>管理调研项目，执行访谈分析，沉淀用户洞察</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #4f6bff, #3b82f6)', boxShadow: '0 8px 20px rgba(79,107,255,0.25)' }}>
          <Plus size={16} /> 新建调研项目
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="rounded-2xl p-5 animate-slide-up"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))',
            border: '1px solid var(--ui-border)', boxShadow: '0 14px 34px rgba(15,23,42,0.08)',
          }}>
          <h3 className="font-bold mb-3" style={{ color: 'var(--ui-text)' }}>新建调研项目</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="项目名称"
            className="w-full px-3 py-2 rounded-xl text-sm mb-3 outline-none"
            style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="调研目标（可选）" rows={3}
            className="w-full px-3 py-2 rounded-xl text-sm mb-3 outline-none resize-none"
            style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          <div className="flex gap-2">
            <button onClick={handleCreate}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: '#4f6bff' }}>创建</button>
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--ui-muted)' }}>取消</button>
          </div>
        </div>
      )}

      {/* Project List */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>加载中...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: 'var(--ui-panel)', border: '1px solid var(--ui-border)' }}>
          <Users size={40} className="mx-auto mb-3" style={{ color: 'var(--ui-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--ui-muted)' }}>还没有调研项目，点击上方按钮创建第一个</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => {
            const s = STATUS_LABEL[p.status] || STATUS_LABEL.planning;
            return (
              <div key={p.id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5 animate-slide-up"
                style={{
                  animationDelay: `${i * 60}ms`,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))',
                  border: '1px solid var(--ui-border)', boxShadow: '0 12px 28px rgba(15,23,42,0.04)',
                }}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-base" style={{ color: 'var(--ui-text)' }}>{p.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>
                    {s.text}
                  </span>
                </div>
                {p.goal && <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--ui-muted)' }}>{p.goal}</p>}
                <div className="text-xs" style={{ color: 'var(--ui-muted)' }}>
                  创建于 {new Date(p.created_at).toLocaleDateString('zh-CN')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
