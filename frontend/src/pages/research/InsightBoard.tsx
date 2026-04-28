import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function InsightBoard() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listInsights().then(setInsights).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const TYPE_LABEL: Record<string, { text: string; color: string; bg: string }> = {
    feature: { text: '功能需求', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    experience: { text: '体验优化', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    bug: { text: 'Bug', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    painpoint: { text: '痛点', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ui-text)', letterSpacing: '-0.03em' }}>洞察看板</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ui-muted)' }}>汇聚所有调研中提取的洞察标签，按类型和频次可视化</p>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>加载中...</div>
      ) : insights.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: 'var(--ui-panel)', border: '1px solid var(--ui-border)' }}>
          <p className="text-sm" style={{ color: 'var(--ui-muted)' }}>暂无洞察标签，完成访谈分析后自动沉淀</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((item) => {
            const t = TYPE_LABEL[item.tag_type] || TYPE_LABEL.feature;
            return (
              <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl animate-slide-up"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(239,246,255,0.66))',
                  border: '1px solid var(--ui-border)',
                }}>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5" style={{ background: t.bg, color: t.color }}>
                  {t.text}
                </span>
                <p className="text-sm flex-1" style={{ color: 'var(--ui-text)' }}>{item.content}</p>
                <span className="text-xs shrink-0" style={{ color: 'var(--ui-muted)' }}>
                  {new Date(item.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
