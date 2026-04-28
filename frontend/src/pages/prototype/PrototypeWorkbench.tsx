import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  ChevronLeft, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen,
  FileText, Mic, MicOff, Save, Eye, Edit3, Layers, Send,
} from 'lucide-react';
import { api } from '../../lib/api';

type Tab = 'meeting' | 'record' | 'pages';
type NoteMode = 'edit' | 'preview';

// ── Web Speech API types ──────────────────────────────────────────────────
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export default function PrototypeWorkbench() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Prototype data
  const [proto, setProto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  // UI state
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('meeting');

  // Meeting notes
  const [notes, setNotes] = useState<any[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [noteMode, setNoteMode] = useState<NoteMode>('edit');
  const [saving, setSaving] = useState(false);

  // Recording
  const [recording, setRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<number | null>(null);

  // Pages
  const [pages, setPages] = useState<any[]>([]);

  // Load prototype
  useEffect(() => {
    if (!id) return;
    api.getPrototype(Number(id)).then((p) => {
      setProto(p);
      setPreviewUrl(p.preview_url || '');
    }).catch(() => navigate('/prototype/list')).finally(() => setLoading(false));
  }, [id, navigate]);

  // Load notes & pages
  useEffect(() => {
    if (!id) return;
    api.listPrototypeNotes(Number(id)).then(setNotes).catch(() => {});
    api.listPrototypePages(Number(id)).then(setPages).catch(() => {});
  }, [id]);

  // Fullscreen listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const refreshIframe = () => setIframeKey((k) => k + 1);

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (proto && previewUrl !== proto.preview_url) {
        api.updatePrototype(proto.id, { preview_url: previewUrl }).then((p) => setProto(p));
      }
      refreshIframe();
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !id) return;
    setSaving(true);
    try {
      const note = await api.createPrototypeNote(Number(id), noteContent);
      setNotes((prev) => [note, ...prev]);
      setNoteContent('');
      setNoteMode('edit');
    } finally {
      setSaving(false);
    }
  };

  // ── Recording ───────────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert('请允许麦克风权限后重试');
      return;
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      alert('当前浏览器不支持语音识别，请使用 Chrome');
      return;
    }

    const recognition: SpeechRecognitionInstance = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    let finalTranscript = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interim += t;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = () => {
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
    setTranscript('');
    setRecordDuration(0);

    timerRef.current = window.setInterval(() => {
      setRecordDuration((d) => d + 1);
    }, 1000);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const insertTranscriptToNote = () => {
    if (!transcript) return;
    setNoteContent((prev) => prev ? `${prev}\n\n${transcript}` : transcript);
    setActiveTab('meeting');
    setNoteMode('edit');
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (loading) return <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>加载中...</div>;
  if (!proto) return <div className="text-center py-12" style={{ color: 'var(--ui-muted)' }}>原型不存在</div>;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'meeting', label: '会议记录', icon: <FileText size={15} /> },
    { key: 'record', label: '录音转文字', icon: <Mic size={15} /> },
    { key: 'pages', label: '页面列表', icon: <Layers size={15} /> },
  ];

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-64px)]" style={{ background: 'var(--ui-surface)' }}>
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      {!isFullscreen && (
        <div className="flex items-center gap-3 px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid var(--ui-border)', background: 'rgba(255,255,255,0.9)' }}>
          <button onClick={() => navigate('/prototype/list')} className="p-1.5 rounded-lg hover:bg-black/5">
            <ChevronLeft size={18} style={{ color: 'var(--ui-muted)' }} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm shrink-0" style={{ color: 'var(--ui-text)' }}>{proto.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              {{ generating: '生成中', preview: '可预览', exported: '已导出' }[proto.status as string] || proto.status}
            </span>
          </div>
          <div className="flex-1 mx-4">
            <input
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              placeholder="输入项目地址，如 http://localhost:3000，回车加载"
              className="w-full px-3 py-1.5 rounded-xl text-xs outline-none"
              style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)' }}
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setToolbarOpen(!toolbarOpen)}
              className="p-2 rounded-xl hover:bg-black/5" title={toolbarOpen ? '收起工具栏' : '展开工具栏'}>
              {toolbarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
            <button onClick={toggleFullscreen} className="p-2 rounded-xl hover:bg-black/5" title="全屏">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* ── Main Area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Left Toolbar */}
        {toolbarOpen && !isFullscreen && (
          <div className="w-80 shrink-0 flex flex-col border-r" style={{ borderColor: 'var(--ui-border)', background: 'rgba(252,253,255,0.96)' }}>
            {/* Tab Nav */}
            <div className="flex border-b" style={{ borderColor: 'var(--ui-border)' }}>
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors"
                  style={activeTab === t.key
                    ? { color: '#4f6bff', borderBottom: '2px solid #4f6bff', background: 'rgba(79,107,255,0.04)' }
                    : { color: 'var(--ui-muted)' }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* ── Meeting Notes ──────────────────────────────────────── */}
              {activeTab === 'meeting' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: 'var(--ui-text)' }}>新建记录</span>
                    <div className="flex gap-1">
                      <button onClick={() => setNoteMode('edit')}
                        className="p-1 rounded" style={noteMode === 'edit' ? { background: 'rgba(79,107,255,0.12)', color: '#4f6bff' } : { color: 'var(--ui-muted)' }}>
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => setNoteMode('preview')}
                        className="p-1 rounded" style={noteMode === 'preview' ? { background: 'rgba(79,107,255,0.12)', color: '#4f6bff' } : { color: 'var(--ui-muted)' }}>
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>

                  {noteMode === 'edit' ? (
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="支持 Markdown 格式..."
                      rows={8}
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
                      style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)', color: 'var(--ui-text)', fontFamily: 'ui-monospace, monospace' }}
                    />
                  ) : (
                    <div className="rounded-xl px-3 py-2 text-xs min-h-[160px] prose prose-xs max-w-none"
                      style={{ border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.9)' }}>
                      {noteContent ? <ReactMarkdown>{noteContent}</ReactMarkdown> : <span style={{ color: 'var(--ui-muted)' }}>预览区域</span>}
                    </div>
                  )}

                  <button onClick={handleSaveNote} disabled={saving || !noteContent.trim()}
                    className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-white justify-center disabled:opacity-50"
                    style={{ background: '#4f6bff' }}>
                    <Save size={13} /> {saving ? '保存中...' : '保存记录'}
                  </button>

                  {/* History */}
                  {notes.length > 0 && (
                    <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--ui-border)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'var(--ui-text)' }}>历史记录</span>
                      {notes.map((n) => (
                        <div key={n.id} className="rounded-xl px-3 py-2 text-xs"
                          style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(148,163,184,0.12)' }}>
                          <div className="prose prose-xs max-w-none mb-1" style={{ fontSize: '11px' }}>
                            <ReactMarkdown>{n.content}</ReactMarkdown>
                          </div>
                          <div style={{ color: 'var(--ui-muted)', fontSize: '10px' }}>
                            {new Date(n.created_at).toLocaleString('zh-CN')}
                            {n.note_type === 'annotation' && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>标注</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Recording ─────────────────────────────────────────── */}
              {activeTab === 'record' && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all"
                      style={recording
                        ? { background: 'rgba(239,68,68,0.15)', border: '3px solid #ef4444', color: '#ef4444', animation: 'pulse 1.5s infinite' }
                        : { background: 'rgba(79,107,255,0.12)', border: '3px solid #4f6bff', color: '#4f6bff' }}>
                      {recording ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <div className="mt-3">
                      {recording ? (
                        <div>
                          <div className="text-sm font-semibold" style={{ color: '#ef4444' }}>录音中</div>
                          <div className="text-lg font-mono font-bold mt-1" style={{ color: 'var(--ui-text)' }}>{formatDuration(recordDuration)}</div>
                        </div>
                      ) : (
                        <div className="text-xs" style={{ color: 'var(--ui-muted)' }}>
                          {transcript ? '录音已结束' : '点击开始录音转文字'}
                        </div>
                      )}
                    </div>
                  </div>

                  {transcript && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold" style={{ color: 'var(--ui-text)' }}>识别结果</span>
                        <span className="text-[10px]" style={{ color: 'var(--ui-muted)' }}>{transcript.length} 字</span>
                      </div>
                      <div className="rounded-xl px-3 py-2 text-xs max-h-48 overflow-y-auto"
                        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(148,163,184,0.28)', color: 'var(--ui-text)', whiteSpace: 'pre-wrap' }}>
                        {transcript}
                      </div>
                      <button onClick={insertTranscriptToNote}
                        className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-medium justify-center"
                        style={{ border: '1px solid rgba(79,107,255,0.2)', background: 'rgba(79,107,255,0.08)', color: '#4f6bff' }}>
                        <Send size={13} /> 插入到会议记录
                      </button>
                    </div>
                  )}

                  <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(0,0,0,0.02)', color: 'var(--ui-muted)' }}>
                    <p className="font-medium mb-1" style={{ color: 'var(--ui-text)' }}>使用说明</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>需要浏览器麦克风权限</li>
                      <li>推荐使用 Chrome 浏览器</li>
                      <li>支持中文实时语音识别</li>
                      <li>识别结果可一键插入会议记录</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ── Pages ─────────────────────────────────────────────── */}
              {activeTab === 'pages' && (
                <div className="space-y-2">
                  {pages.length === 0 ? (
                    <div className="text-center py-8 text-xs" style={{ color: 'var(--ui-muted)' }}>
                      {proto.generation_path === 'local'
                        ? '本地项目通过 URL 预览，无独立页面列表'
                        : '暂无页面，点击"生成原型"后查看'}
                    </div>
                  ) : pages.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-black/[0.03] transition-colors"
                      style={{ border: '1px solid rgba(148,163,184,0.12)' }}>
                      <div>
                        <div className="text-xs font-medium" style={{ color: 'var(--ui-text)' }}>{p.page_name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--ui-muted)' }}>{p.route_path}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={p.status === 'done'
                          ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                          : { background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                        {p.status === 'done' ? '完成' : p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Iframe Preview */}
        <div className="flex-1 relative" style={{ background: '#f8fafc' }}>
          {previewUrl ? (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={previewUrl}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              title="原型预览"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style={{ background: 'rgba(79,107,255,0.08)' }}>
                  <Layers size={28} style={{ color: '#4f6bff' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--ui-text)' }}>请输入项目地址</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--ui-muted)' }}>在顶部输入框中输入本地项目 URL（如 http://localhost:3000）并回车</p>
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen exit button */}
          {isFullscreen && (
            <button onClick={toggleFullscreen}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-lg z-50"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
              退出全屏
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
