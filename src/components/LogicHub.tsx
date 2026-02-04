import { X, Brain, Clock, Zap, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export interface GenerationLog {
  timestamp: number;
  userPrompt: string;
  systemPrompt: string;
  aiResponse: string;
  settings: any;
  success: boolean;
  error?: string;
}

interface LogicHubProps {
  isOpen: boolean;
  onClose: () => void;
  logs: GenerationLog[];
}

export default function LogicHub({ isOpen, onClose, logs }: LogicHubProps) {
  const [selectedLogIndex, setSelectedLogIndex] = useState(0);

  if (!isOpen) return null;

  const selectedLog = logs[selectedLogIndex];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-end z-50">
      {/* 侧边栏 */}
      <div className="w-full max-w-2xl h-full bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl flex flex-col">
        {/* 头部 */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">LOGIC HUB</h2>
              <p className="text-xs text-slate-400">AI REASONING CONSOLE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {logs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Brain size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">暂无生成记录</p>
                <p className="text-sm mt-2">尝试生成一个模型来查看AI思考过程</p>
              </div>
            </div>
          ) : (
            <>
              {/* 日志选择器 */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {logs.map((log, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedLogIndex(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        selectedLogIndex === index
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 日志详情 */}
              {selectedLog && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* 时间戳 */}
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock size={16} />
                    {new Date(selectedLog.timestamp).toLocaleString('zh-CN')}
                    {selectedLog.success ? (
                      <span className="ml-auto px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">
                        ✓ SUCCESS
                      </span>
                    ) : (
                      <span className="ml-auto px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                        ✗ FAILED
                      </span>
                    )}
                  </div>

                  {/* 用户提示词 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                      <MessageSquare size={16} />
                      USER TASK PAYLOAD
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-slate-300 font-mono text-sm whitespace-pre-wrap">
                        PROMPT: {selectedLog.userPrompt}
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
                        <p>Style: {selectedLog.settings?.style || 'standard'}</p>
                        <p>Color: {selectedLog.settings?.colorStyle || 'vibrant'}</p>
                        <p>Voxels: {selectedLog.settings?.voxelCount || 350}</p>
                      </div>
                    </div>
                  </div>

                  {/* 系统指令 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                      <Zap size={16} />
                      SYSTEM INSTRUCTION
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 max-h-96 overflow-y-auto">
                      <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap">
                        {selectedLog.systemPrompt}
                      </pre>
                    </div>
                  </div>

                  {/* AI响应 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Brain size={16} />
                      RAW AI RESPONSE
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 max-h-96 overflow-y-auto">
                      {selectedLog.error ? (
                        <p className="text-red-400 font-mono text-sm">
                          ERROR: {selectedLog.error}
                        </p>
                      ) : (
                        <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap">
                          {selectedLog.aiResponse.substring(0, 3000)}
                          {selectedLog.aiResponse.length > 3000 && (
                            <span className="text-slate-500">
                              \n\n... ({selectedLog.aiResponse.length - 3000} more characters)
                            </span>
                          )}
                        </pre>
                      )}
                    </div>
                  </div>

                  {/* 底部元数据 */}
                  <div className="pt-4 border-t border-slate-700 text-xs text-slate-500">
                    <p>ENGINE: GEMINI 3 FLASH PREVIEW</p>
                    <p>RESPONSE LENGTH: {selectedLog.aiResponse.length} chars</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
