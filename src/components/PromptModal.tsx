import { X, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef } from 'react';
import TactileButton from './TactileButton';
import { useLanguage } from '../contexts/LanguageContext';

export interface GenerationSettings {
  voxelCount: number;
  style: 'simple' | 'standard' | 'detailed';
  colorStyle: 'vibrant' | 'pastel' | 'monochrome';
}

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, settings: GenerationSettings, image?: string) => void;
  onJsonImport?: (voxels: any[]) => void; // 新增：直接导入JSON
  isLoading: boolean;
}

export default function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  onJsonImport,
  isLoading,
}: PromptModalProps) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false); // 新增：显示JSON导入区域
  const [jsonInput, setJsonInput] = useState(''); // 新增：JSON输入内容
  const [settings, setSettings] = useState<GenerationSettings>({
    voxelCount: 350, // 固定最佳值，但保留字段以保持类型兼容
    style: 'standard',
    colorStyle: 'vibrant',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null); // 新增：JSON文件输入

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 预览图片
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!prompt.trim() && !imageBase64) return;
    onSubmit(prompt, settings, imageBase64 || undefined);
    setPrompt('');
    setImagePreview(null);
    setImageBase64(null);
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
          typeof first.z !== 'number' || typeof first.color !== 'string') {
        throw new Error('JSON格式错误，需要包含 {x, y, z, color} 字段');
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

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{t("modal.title")}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* 文本输入 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("modal.describe")}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A colorful castle with towers..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-sky-500 focus:outline-none resize-none"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Or upload an image (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isLoading}
            />
            {!imagePreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-sky-500 transition-colors flex flex-col items-center gap-2 text-gray-500 hover:text-sky-500"
                disabled={isLoading}
              >
                <Upload size={32} />
                <span className="font-medium">{t("modal.clickUpload")}</span>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-2 border-gray-300">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-contain bg-gray-50"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* JSON导入区域 */}
          <div className="border-t-2 border-gray-200 pt-4">
            <button
              onClick={() => setShowJsonImport(!showJsonImport)}
              className="flex items-center gap-2 text-gray-700 font-semibold hover:text-purple-500 transition-colors"
              disabled={isLoading}
            >
              {showJsonImport ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              直接导入JSON数据
            </button>

            {showJsonImport && (
              <div className="mt-4 space-y-4 bg-purple-50 rounded-2xl p-4">
                <p className="text-sm text-gray-600">
                  粘贴或上传JSON格式的体素数据，格式：<code className="bg-gray-200 px-1 rounded">[{`{x, y, z, color}`}, ...]</code>
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
                    placeholder='粘贴JSON数据，例如：[{"x":0,"y":0,"z":0,"color":"#ff0000"}, ...]'
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
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4">
            <TactileButton
              variant="sky"
              onClick={handleSubmit}
              disabled={isLoading || (!prompt.trim() && !imageBase64)}
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
