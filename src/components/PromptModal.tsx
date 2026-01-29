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
  isLoading: boolean;
}

export default function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: PromptModalProps) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    voxelCount: 300,
    style: 'standard',
    colorStyle: 'vibrant',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

          {/* 高级设置 */}
          <div className="border-t-2 border-gray-200 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-gray-700 font-semibold hover:text-sky-500 transition-colors"
              disabled={isLoading}
            >
              {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              {t("modal.advancedSettings")}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 bg-gray-50 rounded-2xl p-4">
                {/* 体素数量 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('settings.voxelCount')}: {settings.voxelCount}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="800"
                    step="50"
                    value={settings.voxelCount}
                    onChange={(e) =>
                      setSettings({ ...settings, voxelCount: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    disabled={isLoading}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{t('settings.fast')} (50)</span>
                    <span>{t('settings.balanced')} (300)</span>
                    <span>{t('settings.detailed')} (800)</span>
                  </div>
                </div>

                {/* 风格 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('settings.style')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['simple', 'standard', 'detailed'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setSettings({ ...settings, style })}
                        className={`py-2 px-4 rounded-xl font-medium transition-all ${
                          settings.style === style
                            ? 'bg-sky-500 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        disabled={isLoading}
                      >
                        {t(`settings.${style}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 配色方案 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('settings.colorStyle')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['vibrant', 'pastel', 'monochrome'] as const).map((colorStyle) => (
                      <button
                        key={colorStyle}
                        onClick={() => setSettings({ ...settings, colorStyle })}
                        className={`py-2 px-4 rounded-xl font-medium transition-all ${
                          settings.colorStyle === colorStyle
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        disabled={isLoading}
                      >
                        {t(`settings.${colorStyle}`)}
                      </button>
                    ))}
                  </div>
                </div>
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
