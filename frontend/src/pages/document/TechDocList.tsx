import { useEffect, useState } from 'react';
import { Plus, Code2, FileCode, Database, Server } from 'lucide-react';
import { api } from '../../lib/api';

const DOC_TYPES = [
  { value: '', label: '全部类型' },
  { value: 'solution', label: '技术方案' },
  { value: 'api', label: 'API 文档' },
  { value: 'database', label: '数据库设计' },
  { value: 'deployment', label: '部署方案' },
];

const TYPE_ICON: Record<string, typeof Code2> = {
  solution: Code2,
  api: FileCode,
  database: Database,
  deployment: Server,
};

const TYPE_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  solution: { text: '技术方案', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  api: { text: 'API 文档', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  database: { text: '数据库设计', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  deployment: { text: '部署方案', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

const STATUS_STYLE: Record<string, { text: string; color: string; bg: string }> = {
  draft: { text: '草稿', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  review: { text: '评审中', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  approved: { text: '已通过', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  published: { text: '已发布', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
};

export default function TechDocList() {
  const [docs, setDocs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState<number | ''>('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', doc_type: 'solution', project_id: '', content: '' });

  useEffect(() => {
    Promise.all([
      api.listTechDocs({ ...(typeFilter ? { doc_type: typeFilter } : {}), ...(projectFilter ? { project_id: projectFilter as number } : {}) }),
      api.listDocProjects().catch(() => []),
    ]).then(([d, p]) => { setDocs(d); setProjects(p); }).finally(() => setLoading(false));
  }, [typeFilter, projectFilter]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const doc = await api.createTechDoc({
      ...form,
      project_id: form.project_id ? Number(form.project_id) : undefined,
    });
    setDocs((prev) => [doc, ...prev]);
    setForm({ title: '', doc_type: 'solution', project_id: '', content: '' });
    setShowCreate(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>技术文档</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>技术方案、API、数据库设计、部署方案统一管理</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-1.5 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
            <option value="">全部项目</option>
            {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
            {DOC_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #4f6bff, #3b82f6)' }}>
            <Plus size={14} /> 新建文档
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="rounded-2xl p-5 animate-slide-up space-y-3"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))', border: '1px solid var(--ui-border)' }}>
          <h3 className="font-bold" style={{ color: 'var(--ui-text)' }}>新建技术文档</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="文档标题 *"
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
            <select value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
              {DOC_TYPES.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
            <option value="">关联项目（可选）</option>
            {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="文档内容（Markdown）" rows={4}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: '#4f6bff' }}>创建</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--ui-muted)' }}>取消</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>加载中...</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--ui-panel)', border: '1px solid var(--ui-border)' }}>
          <Code2 size={40} className="mx-auto mb-3" style={{ color: 'var(--ui-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--ui-muted)' }}>还没有技术文档</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => {
            const tt = TYPE_LABEL[doc.doc_type] || TYPE_LABEL.solution;
            const st = STATUS_STYLE[doc.status] || STATUS_STYLE.draft;
            const Icon = TYPE_ICON[doc.doc_type] || Code2;
            return (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl transition-all hover:-translate-y-0.5 animate-slide-up"
                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(239,246,255,0.66))', border: '1px solid var(--ui-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: tt.bg }}>
                    <Icon size={20} style={{ color: tt.color }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--ui-text)' }}>{doc.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: tt.bg, color: tt.color }}>{tt.text}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.text}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>{new Date(doc.updated_at || doc.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
