import { X, Upload, ChevronDown, ChevronUp, History, Clock, HelpCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import TactileButton from './TactileButton';
import { useLanguage } from '../contexts/LanguageContext';
import { Voxel } from '../types';

export interface GenerationSettings {
  voxelCount: number;
  style: 'simple' | 'standard' | 'detailed';
  colorStyle: 'vibrant' | 'pastel' | 'monochrome';
}

interface GenerationHistoryItem {
  prompt: string;
  voxels: Voxel[];
  timestamp: number;
}

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, settings: GenerationSettings) => void;
  onJsonImport?: (voxels: any[]) => void; // 新增：直接导入JSON
  isLoading: boolean;
  generationHistory?: GenerationHistoryItem[]; // 生成历史记录
  onLoadHistory?: (voxels: Voxel[]) => void; // 加载历史记录
}

export default function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  onJsonImport,
  isLoading,
  generationHistory = [],
  onLoadHistory,
}: PromptModalProps) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // 显示历史记录
  const [showHelpTooltip, setShowHelpTooltip] = useState(false); // 显示帮助提示
  const [jsonInput, setJsonInput] = useState(''); // 新增：JSON输入内容
  const [settings, setSettings] = useState<GenerationSettings>({
    voxelCount: 350, // 固定最佳值，但保留字段以保持类型兼容
    style: 'standard',
    colorStyle: 'vibrant',
  });
  const jsonFileInputRef = useRef<HTMLInputElement>(null); // 新增：JSON文件输入
  const helpTooltipRef = useRef<HTMLDivElement>(null); // 帮助提示框引用

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit(prompt, settings);
    setPrompt('');
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonInput(content);
      } catch (error) {
        alert('读取文件失败');
      }
    };
    reader.readAsText(file);
  };

  const handleJsonImport = () => {
    if (!jsonInput.trim()) {
      alert('请输入或上传JSON数据');
      return;
    }

    try {
      const voxels = JSON.parse(jsonInput);

      // 验证JSON格式
      if (!Array.isArray(voxels)) {
        throw new Error('JSON必须是数组格式');
      }

      if (voxels.length === 0) {
        throw new Error('JSON数组不能为空');
      }

      // 简单验证第一个元素
      const first = voxels[0];
      if (typeof first.x !== 'number' || typeof first.y !== 'number' ||
          typeof first.z !== 'number' || typeof first.c !== 'string') {
        throw new Error('JSON格式错误，需要包含 {x, y, z, c} 字段');
      }

      // 调用导入回调
      if (onJsonImport) {
        onJsonImport(voxels);
        setJsonInput('');
        onClose();
      }
    } catch (error) {
      alert(`JSON解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-6 p-8 pb-4">
          <h2 className="text-3xl font-bold text-gray-800">{t("modal.title")}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 px-8 pb-4 overflow-y-auto flex-1">
          {/* 文本输入 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t("modal.describe")}
              </label>
              {/* 问号提示按钮 */}
              <div className="relative group">
                <button
                  className="p-1.5 bg-gradient-to-r from-sky-100 to-purple-100 rounded-full hover:from-sky-200 hover:to-purple-200 transition-colors"
                  title="查看提示建议"
                >
                  <HelpCircle size={18} className="text-sky-600" />
                </button>
                {/* 提示信息悬停显示 */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 text-white text-xs rounded-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 shadow-2xl">
                  <p className="font-bold mb-2 text-sky-300">✨ 如何描述模型</p>
                  <p className="mb-2">为了获得完整密实的模型，建议在描述中添加：</p>
                  <ul className="space-y-1">
                    <li>• "完整的、实心的"</li>
                    <li>• "所有部位填充满体素"</li>
                    <li>• "不要有空洞或缺失"</li>
                    <li>• "密实、完整的模型"</li>
                  </ul>
                  <p className="mt-2 text-gray-300">例如：一只完整的实心大象，身体、四肢和鼻子都填充满体素</p>
                </div>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A colorful castle with towers..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-sky-500 focus:outline-none resize-none"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* 生成提示信息 */}
          <div className="bg-gradient-to-r from-sky-50 to-purple-50 rounded-2xl p-4 border border-sky-200">
            <h3 className="text-sm font-bold text-gray-800 mb-2">💡 {t('modal.tips') || '生成提示'}</h3>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>• <strong>简单风格 (Simple)</strong>: 基础形状，快速生成 (~200体素)</li>
              <li>• <strong>标准风格 (Standard)</strong>: 均衡细节，推荐使用 (~350体素)</li>
              <li>• <strong>详细风格 (Detailed)</strong>: 丰富纹理，需要更多体素 (~500体素)</li>
              <li className="pt-1 border-t border-sky-200">
                ⚡ <strong>超大模型 (>500体素)</strong>: 自动使用压缩格式，可生成超精细模型 (~8000+体素)
              </li>
            </ul>
          </div>

          {/* 生成历史记录 */}
          {generationHistory && generationHistory.length > 0 && (
            <div className="border-t-2 border-gray-200 pt-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-gray-700 font-semibold hover:text-green-500 transition-colors"
                disabled={isLoading}
              >
                {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                <History size={20} />
                生成历史 ({generationHistory.length})
              </button>

              {showHistory && (
                <div className="mt-4 space-y-2 bg-green-50 rounded-2xl p-4 max-h-64 overflow-y-auto">
                  {generationHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => onLoadHistory && onLoadHistory(item.voxels)}
                      disabled={isLoading}
                      className="w-full text-left p-3 bg-white rounded-xl hover:bg-green-100 transition-colors border border-green-200 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">
                            {item.prompt}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.voxels.length} 体素
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                          <Clock size={12} />
                          {new Date(item.timestamp).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* JSON导入区域 */}
          <div className="border-t-2 border-gray-200 pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">📥 导入JSON数据</h3>

            <div className="space-y-4 bg-purple-50 rounded-2xl p-4">
              <p className="text-sm text-gray-600">
                粘贴或上传JSON格式的体素数据，格式：<code className="bg-gray-200 px-1 rounded">[{`{x, y, z, c}`}, ...]</code>
              </p>

              {/* JSON文件上传 */}
              <div>
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleJsonFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-purple-300 rounded-2xl hover:border-purple-500 transition-colors flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                  disabled={isLoading}
                >
                  <Upload size={20} />
                  上传JSON文件
                </button>
              </div>

              {/* JSON文本输入 */}
              <div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='粘贴JSON数据，例如：[{"x":0,"y":0,"z":0,"c":"#ff0000"}, ...]'
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none resize-none font-mono text-xs"
                  rows={6}
                  disabled={isLoading}
                />
              </div>

              {/* 导入按钮 */}
              <TactileButton
                variant="sky"
                onClick={handleJsonImport}
                disabled={isLoading || !jsonInput.trim()}
                className="w-full"
              >
                导入并加载模型
              </TactileButton>
            </div>
          </div>
        </div>

        {/* 固定的底部按钮区域 */}
        <div className="border-t-2 border-gray-200 bg-gray-50 px-8 py-4">
          <div className="flex gap-3">
            <TactileButton
              variant="sky"
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="flex-1"
            >
              {isLoading ? t('btn.generating') : t('btn.generate')}
            </TactileButton>
            <TactileButton variant="rose" onClick={onClose} disabled={isLoading}>
              {t('btn.cancel')}
            </TactileButton>
          </div>
        </div>
      </div>
    </div>
  );
}
