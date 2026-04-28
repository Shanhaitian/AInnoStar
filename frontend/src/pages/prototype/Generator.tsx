import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Cpu, Plug, FolderOpen, Loader2, Globe } from 'lucide-react';
import { api } from '../../lib/api';

const PATHS = [
  { key: 'agent', label: '多 Agent 生成', desc: 'AI 自动拆解 PRD，流水线生成页面代码', icon: <Cpu size={20} />, color: '#10b981' },
  { key: 'mcp', label: 'MCP / Skill 集成', desc: '调用外部 AI 设计工具（Pixso / Stitch）', icon: <Plug size={20} />, color: '#f59e0b' },
  { key: 'local', label: '挂载本地项目', desc: '输入项目地址，在框架内实时预览并汇报', icon: <FolderOpen size={20} />, color: '#8b5cf6' },
];

export default function Generator() {
  const navigate = useNavigate();
  const [prdId, setPrdId] = useState('');
  const [name, setName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedPath, setSelectedPath] = useState('agent');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prdId || !name) return;
    if (selectedPath === 'local' && !previewUrl.trim()) return;
    setGenerating(true);
    try {
      const proto = await api.createPrototype(Number(prdId), name, selectedPath, selectedPath === 'local' ? previewUrl : undefined);
      if (selectedPath !== 'local') {
        const generated = await api.generatePrototype(proto.id);
        setResult(generated);
      } else {
        setResult(proto);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>AI 原型生成</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>基于 PRD 自动生成可交互原型，选择合适的生成路径</p>
      </div>

      {/* Config */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(239,246,255,0.66))', border: '1px solid var(--ui-border)', backdropFilter: 'blur(18px)', boxShadow: '0 18px 44px rgba(15,23,42,0.06)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--ui-text)' }}>关联 PRD ID</label>
            <input value={prdId} onChange={(e) => setPrdId(e.target.value)} placeholder="输入 PRD 文档 ID"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--ui-text)' }}>原型名称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="给原型起个名字"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
          </div>
        </div>

        {/* Preview URL for local path */}
        {selectedPath === 'local' && (
          <div className="animate-slide-up">
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--ui-text)' }}>
              <Globe size={14} /> 项目地址
            </label>
            <input value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="http://localhost:3000"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }} />
            <p className="text-xs mt-1.5" style={{ color: 'var(--ui-muted)' }}>输入本地运行的项目地址，挂载后可在平台内 iframe 预览</p>
          </div>
        )}
      </div>

      {/* Path Selection */}
      <div>
        <h3 className="text-base font-bold mb-3" style={{ color: 'var(--ui-text)' }}>选择生成路径</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PATHS.map((path) => (
            <button key={path.key} onClick={() => setSelectedPath(path.key)}
              className="p-4 rounded-2xl text-left transition-all"
              style={{
                background: selectedPath === path.key ? 'linear-gradient(145deg, rgba(79,107,255,0.14), rgba(14,165,233,0.1))' : 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(239,246,255,0.66))',
                border: selectedPath === path.key ? '2px solid rgba(79,107,255,0.4)' : '1px solid var(--ui-border)',
                boxShadow: selectedPath === path.key ? '0 12px 28px rgba(79,107,255,0.12)' : '0 8px 20px rgba(15,23,42,0.04)',
              }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: path.color }}>{path.icon}</span>
                <span className="font-semibold text-sm" style={{ color: 'var(--ui-text)' }}>{path.label}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--ui-muted)' }}>{path.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button onClick={handleGenerate}
        disabled={generating || !prdId || !name || (selectedPath === 'local' && !previewUrl.trim())}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white font-semibold transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #4f6bff, #3b82f6)', boxShadow: '0 10px 28px rgba(79,107,255,0.3)' }}>
        {generating
          ? <><Loader2 size={18} className="animate-spin" /> 生成中...</>
          : selectedPath === 'local'
            ? <><FolderOpen size={18} /> 挂载本地项目</>
            : <><Sparkles size={18} /> 开始生成原型</>}
      </button>

      {/* Result */}
      {result && (
        <div className="rounded-2xl p-5 animate-slide-up space-y-3"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(239,246,255,0.66))', border: '1px solid var(--ui-border)', boxShadow: '0 18px 44px rgba(15,23,42,0.06)' }}>
          <h3 className="font-bold" style={{ color: 'var(--ui-text)' }}>
            {selectedPath === 'local' ? '挂载成功' : '生成结果'}
          </h3>
          <div className="text-sm" style={{ color: 'var(--ui-text)' }}>
            原型 <strong>{result.name}</strong> {selectedPath === 'local' ? '已挂载' : '已生成'}，状态: {result.status}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/prototype/workbench/${result.id}`)}
              className="text-sm font-medium px-4 py-2 rounded-xl text-white" style={{ background: '#4f6bff' }}>
              进入工作台
            </button>
            <a href="/prototype/list" className="text-sm underline flex items-center" style={{ color: '#4f6bff' }}>前往原型库 →</a>
          </div>
        </div>
      )}
    </div>
  );
}
