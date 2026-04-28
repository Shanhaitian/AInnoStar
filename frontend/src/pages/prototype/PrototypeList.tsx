import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Eye, Cpu, Plug, FolderOpen, Monitor } from 'lucide-react';
import { api } from '../../lib/api';

const PATH_ICON: Record<string, React.ReactNode> = {
  agent: <Cpu size={16} />,
  mcp: <Plug size={16} />,
  local: <FolderOpen size={16} />,
};

const PATH_LABEL: Record<string, string> = {
  agent: '多 Agent', mcp: 'MCP/Skill', local: '本地项目',
};

const STATUS_STYLE: Record<string, { text: string; color: string; bg: string }> = {
  generating: { text: '生成中', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  preview: { text: '可预览', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  exported: { text: '已导出', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
};

export default function PrototypeList() {
  const navigate = useNavigate();
  const [prototypes, setPrototypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listPrototypes().then(setPrototypes).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>原型库</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>管理所有生成的原型项目，进入工作台预览和汇报</p>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>加载中...</div>
      ) : prototypes.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--ui-panel)', border: '1px solid var(--ui-border)' }}>
          <Sparkles size={40} className="mx-auto mb-3" style={{ color: 'var(--ui-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--ui-muted)' }}>还没有原型，前往生成工作台创建第一个</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prototypes.map((p) => {
            const s = STATUS_STYLE[p.status] || STATUS_STYLE.generating;
            return (
              <div key={p.id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5 animate-slide-up cursor-pointer"
                onClick={() => navigate(`/prototype/workbench/${p.id}`)}
                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(239,246,255,0.7))', border: '1px solid var(--ui-border)', boxShadow: '0 12px 28px rgba(15,23,42,0.04)' }}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold" style={{ color: 'var(--ui-text)' }}>{p.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.text}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--ui-muted)' }}>
                    {PATH_ICON[p.generation_path]} {PATH_LABEL[p.generation_path] || p.generation_path}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>PRD #{p.prd_id}</span>
                  {p.preview_url && (
                    <span className="flex items-center gap-1 text-xs truncate max-w-[120px]" style={{ color: 'var(--ui-muted)' }}>
                      <Monitor size={11} /> {p.preview_url}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#4f6bff' }}>
                    <Eye size={14} /> 进入工作台
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
