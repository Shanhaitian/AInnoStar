import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Sparkles, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';

const TEMPLATE_OPTIONS = [
  { value: 'standard', label: '标准模板' },
  { value: 'agile', label: '敏捷模板' },
  { value: 'detailed', label: '详细模板' },
];

export default function PRDList() {
  const navigate = useNavigate();
  const [prds, setPRDs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', template_type: 'standard', project_id: '' });

  useEffect(() => {
    Promise.all([
      api.listPRDs(),
      api.listDocProjects().catch(() => []),
    ]).then(([p, proj]) => { setPRDs(p); setProjects(proj); }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const prd = await api.createPRD({
      title: form.title,
      template_type: form.template_type,
      project_id: form.project_id ? Number(form.project_id) : undefined,
      requirement_ids: [],
    });
    setPRDs((prev) => [prd, ...prev]);
    setForm({ title: '', template_type: 'standard', project_id: '' });
    setShowCreate(false);
  };

  const handleGenerate = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await api.generatePRD(id);
    setPRDs((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const STATUS_STYLE: Record<string, { text: string; color: string; bg: string }> = {
    draft: { text: '草稿', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    review: { text: '评审中', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    published: { text: '已发布', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    locked: { text: '已锁定', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  };

  const TEMPLATE_LABEL: Record<string, string> = { agile: '敏捷', standard: '标准', detailed: '详细' };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>PRD 管理</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>创建、编辑、版本管理产品需求文档，支持 AI 生成初稿</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #4f6bff, #3b82f6)', boxShadow: '0 8px 20px rgba(79,107,255,0.25)' }}>
          <Plus size={16} /> 新建 PRD
        </button>
      </div>

      {showCreate && (
        <div className="rounded-2xl p-5 animate-slide-up space-y-3"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))', border: '1px solid var(--ui-border)', boxShadow: '0 14px 34px rgba(15,23,42,0.08)' }}>
          <h3 className="font-bold" style={{ color: 'var(--ui-text)' }}>新建 PRD</h3>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="文档标题 *"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.template_type} onChange={(e) => setForm({ ...form, template_type: e.target.value })}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
              {TEMPLATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
              <option value="">关联项目（可选）</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: '#4f6bff' }}>创建</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--ui-muted)' }}>取消</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>加载中...</div>
      ) : prds.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--ui-panel)', border: '1px solid var(--ui-border)' }}>
          <FileText size={40} className="mx-auto mb-3" style={{ color: 'var(--ui-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--ui-muted)' }}>还没有 PRD 文档</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prds.map((prd) => {
            const s = STATUS_STYLE[prd.status] || STATUS_STYLE.draft;
            return (
              <div key={prd.id} onClick={() => navigate(`/document/prd/${prd.id}`)}
                className="flex items-center justify-between p-4 rounded-xl transition-all hover:-translate-y-0.5 animate-slide-up cursor-pointer"
                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(239,246,255,0.66))', border: '1px solid var(--ui-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(79,107,255,0.12)' }}>
                    <FileText size={20} style={{ color: '#4f6bff' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--ui-text)' }}>{prd.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.text}</span>
                      <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>v{prd.version}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--ui-muted)' }}>
                        {TEMPLATE_LABEL[prd.template_type] || '标准'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => handleGenerate(prd.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{ border: '1px solid rgba(79,107,255,0.16)', background: 'linear-gradient(135deg, rgba(79,107,255,0.14), rgba(14,165,233,0.1))', color: '#334155' }}>
                    <Sparkles size={14} /> AI 生成
                  </button>
                  <ChevronRight size={16} style={{ color: 'var(--ui-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
