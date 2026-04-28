import { useEffect, useState, useCallback } from 'react';
import { Plus, Filter, LayoutGrid, List, GripVertical } from 'lucide-react';
import { api } from '../../lib/api';

const COLUMNS = [
  { key: 'draft', label: '草稿', color: '#6366f1' },
  { key: 'approved', label: '已评审', color: '#3b82f6' },
  { key: 'in_dev', label: '开发中', color: '#f59e0b' },
  { key: 'done', label: '已完成', color: '#10b981' },
];

const SOURCE_OPTIONS = [
  { value: '', label: '全部来源' },
  { value: 'insight', label: '调研洞察' },
  { value: 'feedback', label: '用户反馈' },
  { value: 'internal', label: '内部提案' },
  { value: 'competitor', label: '竞品对标' },
  { value: 'customer', label: '客户需求' },
];

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
  P0: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  P1: { color: '#ea580c', bg: 'rgba(234,88,12,0.1)' },
  P2: { color: '#4f6bff', bg: 'rgba(79,107,255,0.1)' },
};

const SOURCE_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  insight: { text: '调研', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  feedback: { text: '反馈', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  internal: { text: '内部', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  competitor: { text: '竞品', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  customer: { text: '客户', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
};

export default function RequirementPool() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'P2', source: 'internal' });
  const [dragId, setDragId] = useState<number | null>(null);

  const fetchReqs = useCallback(() => {
    setLoading(true);
    api.listRequirements(sourceFilter ? { source: sourceFilter } : undefined)
      .then(setRequirements).catch(() => {}).finally(() => setLoading(false));
  }, [sourceFilter]);

  useEffect(() => { fetchReqs(); }, [fetchReqs]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const r = await api.createRequirement(form);
    setRequirements((prev) => [r, ...prev]);
    setForm({ title: '', description: '', priority: 'P2', source: 'internal' });
    setShowCreate(false);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const r = await api.updateRequirement(id, { status: newStatus });
    setRequirements((prev) => prev.map((x) => (x.id === id ? r : x)));
  };

  // Drag & Drop
  const handleDragStart = (id: number) => setDragId(id);
  const handleDrop = (status: string) => {
    if (dragId !== null) handleStatusChange(dragId, status);
    setDragId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>需求池</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>跨项目需求统一管理，拖拽切换状态</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
            {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setView(view === 'kanban' ? 'table' : 'kanban')}
            className="p-2 rounded-xl" style={{ border: '1px solid var(--ui-border)', background: 'rgba(255,255,255,0.78)' }}>
            {view === 'kanban' ? <List size={16} /> : <LayoutGrid size={16} />}
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #4f6bff, #3b82f6)' }}>
            <Plus size={14} /> 添加需求
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-2xl p-5 animate-slide-up space-y-3"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))', border: '1px solid var(--ui-border)' }}>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="需求标题 *"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="需求描述" rows={2}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>优先级</span>
              {['P0', 'P1', 'P2'].map((p) => (
                <button key={p} onClick={() => setForm({ ...form, priority: p })}
                  className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                  style={form.priority === p ? { background: PRIORITY_STYLE[p].color, color: '#fff' } : { background: PRIORITY_STYLE[p].bg, color: PRIORITY_STYLE[p].color }}>{p}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>来源</span>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="px-2 py-1 rounded-lg text-xs outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', color: 'var(--ui-text)' }}>
                {SOURCE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: '#4f6bff' }}>创建</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--ui-muted)' }}>取消</button>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const items = requirements.filter((r) => r.status === col.key);
            return (
              <div key={col.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.key)}
                className="rounded-2xl p-3 min-h-[200px]"
                style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--ui-border)' }}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--ui-text)' }}>{col.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${col.color}18`, color: col.color }}>{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((r) => {
                    const ps = PRIORITY_STYLE[r.priority] || PRIORITY_STYLE.P2;
                    const src = SOURCE_LABEL[r.source];
                    return (
                      <div key={r.id} draggable onDragStart={() => handleDragStart(r.id)}
                        className="p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(239,246,255,0.75))', border: '1px solid var(--ui-border)', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-sm font-medium flex-1 leading-snug" style={{ color: 'var(--ui-text)' }}>{r.title}</p>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ml-2" style={{ background: ps.bg, color: ps.color }}>{r.priority}</span>
                        </div>
                        {r.description && <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--ui-muted)' }}>{r.description}</p>}
                        {src && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: src.bg, color: src.color }}>{src.text}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && !loading && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--ui-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(79,107,255,0.06)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--ui-text)' }}>标题</th>
                <th className="text-left px-4 py-3 font-semibold w-20" style={{ color: 'var(--ui-text)' }}>优先级</th>
                <th className="text-left px-4 py-3 font-semibold w-24" style={{ color: 'var(--ui-text)' }}>状态</th>
                <th className="text-left px-4 py-3 font-semibold w-24" style={{ color: 'var(--ui-text)' }}>来源</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((r) => {
                const ps = PRIORITY_STYLE[r.priority] || PRIORITY_STYLE.P2;
                const st = COLUMNS.find((c) => c.key === r.status);
                const src = SOURCE_LABEL[r.source];
                return (
                  <tr key={r.id} className="hover:bg-blue-50/40 transition-colors" style={{ borderTop: '1px solid var(--ui-border)' }}>
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: 'var(--ui-text)' }}>{r.title}</div>
                      {r.description && <div className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--ui-muted)' }}>{r.description}</div>}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: ps.bg, color: ps.color }}>{r.priority}</span></td>
                    <td className="px-4 py-3">
                      <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg outline-none" style={{ border: '1px solid rgba(148,163,184,0.2)', color: 'var(--ui-text)', background: 'transparent' }}>
                        {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {src && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: src.bg, color: src.color }}>{src.text}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {loading && <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>加载中...</div>}
    </div>
  );
}
