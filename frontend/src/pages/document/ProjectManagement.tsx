import { useEffect, useState } from 'react';
import { Plus, FolderKanban, Users } from 'lucide-react';
import { api } from '../../lib/api';

export default function ProjectManagement() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', client_name: '' });

  useEffect(() => {
    api.listDocProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const p = await api.createDocProject(form);
    setProjects((prev) => [p, ...prev]);
    setForm({ name: '', code: '', description: '', client_name: '' });
    setShowCreate(false);
  };

  const STATUS_STYLE: Record<string, { text: string; color: string; bg: string }> = {
    active: { text: '进行中', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    archived: { text: '已归档', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>项目管理</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>管理产品项目，关联需求、文档、原型</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #4f6bff, #3b82f6)', boxShadow: '0 8px 20px rgba(79,107,255,0.25)' }}>
          <Plus size={16} /> 新建项目
        </button>
      </div>

      {showCreate && (
        <div className="rounded-2xl p-5 animate-slide-up space-y-3"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))', border: '1px solid var(--ui-border)', boxShadow: '0 14px 34px rgba(15,23,42,0.08)' }}>
          <h3 className="font-bold" style={{ color: 'var(--ui-text)' }}>新建项目</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="项目名称 *"
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="项目编号（如 PRJ-001）"
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          </div>
          <input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="客户名称"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="项目描述" rows={2}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: '#4f6bff' }}>创建</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--ui-muted)' }}>取消</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>加载中...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--ui-panel)', border: '1px solid var(--ui-border)' }}>
          <FolderKanban size={40} className="mx-auto mb-3" style={{ color: 'var(--ui-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--ui-muted)' }}>还没有项目，创建第一个开始吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const s = STATUS_STYLE[p.status] || STATUS_STYLE.active;
            return (
              <div key={p.id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5 animate-slide-up cursor-pointer"
                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))', border: '1px solid var(--ui-border)', boxShadow: '0 12px 28px rgba(15,23,42,0.04)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base" style={{ color: 'var(--ui-text)' }}>{p.name}</h4>
                    {p.code && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--ui-muted)' }}>{p.code}</span>}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.text}</span>
                </div>
                {p.client_name && (
                  <div className="flex items-center gap-1 text-xs mb-2" style={{ color: 'var(--ui-muted)' }}>
                    <Users size={12} /> {p.client_name}
                  </div>
                )}
                {p.description && <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--ui-muted)' }}>{p.description}</p>}
                <div className="text-xs" style={{ color: 'var(--ui-muted)' }}>{new Date(p.created_at).toLocaleDateString('zh-CN')}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
