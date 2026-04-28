import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Sparkles, GitBranch, ChevronLeft } from 'lucide-react';
import { api } from '../../lib/api';

const SECTIONS = [
  { key: 'section_background', label: '背景', icon: '📋' },
  { key: 'section_goals', label: '目标', icon: '🎯' },
  { key: 'section_users', label: '目标用户', icon: '👥' },
  { key: 'section_features', label: '功能清单', icon: '✨' },
  { key: 'section_flow', label: '业务流程', icon: '🔄' },
  { key: 'section_acceptance', label: '验收标准', icon: '✅' },
  { key: 'section_nonfunc', label: '非功能需求', icon: '⚡' },
];

export default function PRDEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prd, setPrd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('section_background');
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getPRD(Number(id)),
      api.listPRDVersions(Number(id)).catch(() => []),
    ]).then(([p, v]) => { setPrd(p); setVersions(v); }).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (key: string, value: string) => {
    setPrd((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!prd) return;
    setSaving(true);
    const updated = await api.updatePRD(prd.id, {
      section_background: prd.section_background,
      section_goals: prd.section_goals,
      section_users: prd.section_users,
      section_features: prd.section_features,
      section_flow: prd.section_flow,
      section_acceptance: prd.section_acceptance,
      section_nonfunc: prd.section_nonfunc,
    });
    setPrd(updated);
    const v = await api.listPRDVersions(prd.id).catch(() => []);
    setVersions(v);
    setSaving(false);
  };

  const handleGenerate = async () => {
    if (!prd) return;
    setSaving(true);
    const updated = await api.generatePRD(prd.id);
    setPrd(updated);
    const v = await api.listPRDVersions(prd.id).catch(() => []);
    setVersions(v);
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>加载中...</div>;
  if (!prd) return <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>文档不存在</div>;

  const currentSection = SECTIONS.find((s) => s.key === activeSection);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/document/prd')} className="p-2 rounded-xl hover:bg-black/5 transition-colors">
            <ChevronLeft size={20} style={{ color: 'var(--ui-muted)' }} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>{prd.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>v{prd.version}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
                {{ draft: '草稿', review: '评审中', published: '已发布', locked: '已锁定' }[prd.status as string] || '草稿'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowVersions(!showVersions)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
            style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}>
            <GitBranch size={14} /> 版本历史
          </button>
          <button onClick={handleGenerate} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
            style={{ border: '1px solid rgba(79,107,255,0.16)', background: 'linear-gradient(135deg, rgba(79,107,255,0.14), rgba(14,165,233,0.1))', color: '#334155' }}>
            <Sparkles size={14} /> AI 生成
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-white text-sm font-medium"
            style={{ background: '#4f6bff' }}>
            <Save size={14} /> {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Section Nav */}
        <div className="w-48 shrink-0 space-y-1">
          {SECTIONS.map((s) => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className="w-full text-left px-3 py-2 rounded-xl text-sm transition-all"
              style={activeSection === s.key
                ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(147,197,253,0.1))', color: '#1d4ed8', fontWeight: 600 }
                : { color: 'var(--ui-muted)' }}>
              <span className="mr-2">{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--ui-border)', background: 'rgba(255,255,255,0.9)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(79,107,255,0.04)', borderBottom: '1px solid var(--ui-border)' }}>
              <span className="text-lg">{currentSection?.icon}</span>
              <span className="font-semibold text-sm" style={{ color: 'var(--ui-text)' }}>{currentSection?.label}</span>
            </div>
            <textarea
              value={prd[activeSection] || ''}
              onChange={(e) => handleChange(activeSection, e.target.value)}
              placeholder={`输入${currentSection?.label}内容...支持 Markdown 格式`}
              className="w-full px-4 py-4 text-sm outline-none resize-none"
              style={{ minHeight: '400px', color: 'var(--ui-text)', background: 'transparent', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            />
          </div>
        </div>

        {/* Version Panel */}
        {showVersions && (
          <div className="w-56 shrink-0 rounded-2xl p-3" style={{ border: '1px solid var(--ui-border)', background: 'rgba(255,255,255,0.9)' }}>
            <h3 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--ui-text)' }}>版本历史</h3>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {versions.length === 0 ? (
                <p className="text-xs px-1" style={{ color: 'var(--ui-muted)' }}>暂无版本记录</p>
              ) : versions.map((v) => (
                <button key={v.id} onClick={() => setSelectedVersion(selectedVersion?.id === v.id ? null : v)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                  style={selectedVersion?.id === v.id
                    ? { background: 'rgba(79,107,255,0.1)', border: '1px solid rgba(79,107,255,0.2)' }
                    : { background: 'rgba(0,0,0,0.02)' }}>
                  <div className="font-medium" style={{ color: 'var(--ui-text)' }}>v{v.version}</div>
                  <div className="mt-0.5 truncate" style={{ color: 'var(--ui-muted)' }}>{v.change_summary || '无说明'}</div>
                  <div className="mt-0.5" style={{ color: 'var(--ui-muted)' }}>
                    {new Date(v.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>
            {selectedVersion && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--ui-border)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--ui-text)' }}>v{selectedVersion.version} 内容快照</p>
                <pre className="text-xs p-2 rounded-lg overflow-auto max-h-48" style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--ui-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {selectedVersion.content || '(空)'}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
