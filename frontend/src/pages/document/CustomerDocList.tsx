import { useEffect, useState } from 'react';
import { Plus, ArrowDownToLine, ArrowUpFromLine, FileText } from 'lucide-react';
import { api } from '../../lib/api';

const CATEGORIES = [
  { value: 'requirement', label: '需求文档' },
  { value: 'material', label: '资料素材' },
  { value: 'deliverable', label: '交付物' },
  { value: 'meeting', label: '会议纪要' },
  { value: 'contract', label: '合同协议' },
];

const CAT_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  requirement: { text: '需求文档', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  material: { text: '资料素材', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  deliverable: { text: '交付物', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  meeting: { text: '会议纪要', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  contract: { text: '合同协议', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
};

const STATUS_STYLE: Record<string, { text: string; color: string; bg: string }> = {
  draft: { text: '草稿', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  review: { text: '评审中', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  approved: { text: '已通过', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  published: { text: '已发布', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
};

export default function CustomerDocList() {
  const [docs, setDocs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [projectFilter, setProjectFilter] = useState<number | ''>('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', direction: 'inbound', category: 'requirement', project_id: '', file_url: '' });

  const fetchDocs = () => {
    setLoading(true);
    const params: any = {};
    if (direction !== 'all') params.direction = direction;
    if (projectFilter) params.project_id = projectFilter;
    api.listCustomerDocs(params).then(setDocs).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
    api.listDocProjects().then(setProjects).catch(() => {});
  }, [direction, projectFilter]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const doc = await api.createCustomerDoc({
      ...form,
      project_id: form.project_id ? Number(form.project_id) : undefined,
    });
    setDocs((prev) => [doc, ...prev]);
    setForm({ title: '', description: '', direction: 'inbound', category: 'requirement', project_id: '', file_url: '' });
    setShowCreate(false);
  };

  const inboundDocs = docs.filter((d) => d.direction === 'inbound');
  const outboundDocs = docs.filter((d) => d.direction === 'outbound');

  const DocCard = ({ doc }: { doc: any }) => {
    const cat = CAT_LABEL[doc.category] || CAT_LABEL.requirement;
    const st = STATUS_STYLE[doc.status] || STATUS_STYLE.draft;
    const isInbound = doc.direction === 'inbound';
    return (
      <div className="flex items-center justify-between p-4 rounded-xl transition-all hover:-translate-y-0.5 animate-slide-up"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(239,246,255,0.66))', border: '1px solid var(--ui-border)' }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: isInbound ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)' }}>
            {isInbound ? <ArrowDownToLine size={16} style={{ color: '#3b82f6' }} /> : <ArrowUpFromLine size={16} style={{ color: '#10b981' }} />}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: 'var(--ui-text)' }}>{doc.title}</div>
            {doc.description && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--ui-muted)' }}>{doc.description}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cat.bg, color: cat.color }}>{cat.text}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.text}</span>
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: '#4f6bff' }}>查看文件</a>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs shrink-0 ml-4" style={{ color: 'var(--ui-muted)' }}>
          {new Date(doc.created_at).toLocaleDateString('zh-CN')}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>客户文档</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>管理客户提供及需提交给客户的文档资料</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-1.5 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
            <option value="">全部项目</option>
            {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #4f6bff, #3b82f6)' }}>
            <Plus size={14} /> 新建文档
          </button>
        </div>
      </div>

      {/* Direction Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
        {([['all', '全部', FileText], ['inbound', '客户提供', ArrowDownToLine], ['outbound', '我方提交', ArrowUpFromLine]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setDirection(key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center"
            style={direction === key
              ? { background: '#fff', color: 'var(--ui-text)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: 'var(--ui-muted)' }}>
            <Icon size={14} /> {label}
            {key !== 'all' && <span className="text-xs ml-1">({key === 'inbound' ? inboundDocs.length : outboundDocs.length})</span>}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="rounded-2xl p-5 animate-slide-up space-y-3"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))', border: '1px solid var(--ui-border)' }}>
          <h3 className="font-bold" style={{ color: 'var(--ui-text)' }}>新建客户文档</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="文档标题 *"
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
            <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as 'inbound' | 'outbound' })}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
              <option value="inbound">客户提供（收文）</option>
              <option value="outbound">我方提交（发文）</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
              {CATEGORIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
              <option value="">关联项目（可选）</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="文档描述" rows={2}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          <input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="文件链接（可选）"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
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
          <FileText size={40} className="mx-auto mb-3" style={{ color: 'var(--ui-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--ui-muted)' }}>还没有客户文档</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => <DocCard key={doc.id} doc={doc} />)}
        </div>
      )}
    </div>
  );
}
