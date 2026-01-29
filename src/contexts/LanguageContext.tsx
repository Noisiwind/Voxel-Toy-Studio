import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface Translations {
  en: Record<string, string>;
  zh: Record<string, string>;
}

const translations: Translations = {
  en: {
    // Header
    'app.title': 'Li Auto Voxel Studio',
    'voxels.count': 'voxels',
    'voxels.empty': 'Let Li help you create your first model',

    // Buttons
    'btn.newModel': 'New Model',
    'btn.dismantle': 'Dismantle',
    'btn.rebuild': 'Rebuild',
    'btn.autoRotate': 'Auto Rotate',
    'btn.generate': 'Generate',
    'btn.generating': 'Li is creating...',
    'btn.cancel': 'Cancel',
    'btn.save': 'Save',

    // Modal
    'modal.title': 'Create New Model',
    'modal.describe': 'Chat with Li',
    'modal.placeholder': 'Li, help me build a colorful castle with towers...',
    'modal.uploadImage': 'Or upload an image (optional)',
    'modal.clickUpload': 'Click to upload image',
    'modal.advancedSettings': 'Advanced Settings',

    // Advanced Settings
    'settings.voxelCount': 'Voxel Count',
    'settings.fast': 'Fast',
    'settings.balanced': 'Balanced',
    'settings.detailed': 'Detailed',
    'settings.style': 'Style',
    'settings.simple': 'Simple',
    'settings.standard': 'Standard',
    'settings.colorStyle': 'Color Style',
    'settings.vibrant': 'Vibrant',
    'settings.pastel': 'Pastel',
    'settings.monochrome': 'Monochrome',

    // Presets
    'preset.quickStart': 'Quick Start',
    'preset.car': '🚗 Car',
    'preset.cat': '🐱 Cat',
    'preset.eagle': '🦅 Eagle',
    'preset.house': '🏠 House',

    // API Key
    'api.title': 'Gemini API Key',
    'api.description': 'Enter your Google Gemini API key to generate voxel models. Get your key at',
    'api.placeholder': 'AIza...',

    // Tooltips
    'tooltip.apiKey': 'API Key Settings',
    'tooltip.export': 'Export JSON',
    'tooltip.share': 'Copy to Clipboard',

    // Messages
    'msg.copied': 'Model data copied to clipboard!',
    'msg.enterApiKey': 'Please enter your Gemini API key first',
    'msg.generateError': 'Failed to generate model',
  },
  zh: {
    // 标题
    'app.title': '理想同学像素玩具工作室',
    'voxels.count': '个体素',
    'voxels.empty': '让理想同学帮你创建第一个模型',

    // 按钮
    'btn.newModel': '新建模型',
    'btn.dismantle': '拆解',
    'btn.rebuild': '重组',
    'btn.autoRotate': '自动旋转',
    'btn.generate': '生成',
    'btn.generating': '理想同学正在创建中...',
    'btn.cancel': '取消',
    'btn.save': '保存',

    // 对话框
    'modal.title': '创建新模型',
    'modal.describe': '和理想同学聊聊',
    'modal.placeholder': '理想同学，帮我构建一座带有塔楼的彩色城堡...',
    'modal.uploadImage': '或上传图片（可选）',
    'modal.clickUpload': '点击上传图片',
    'modal.advancedSettings': '高级设置',

    // 高级设置
    'settings.voxelCount': '体素数量',
    'settings.fast': '快速',
    'settings.balanced': '平衡',
    'settings.detailed': '详细',
    'settings.style': '风格',
    'settings.simple': '简单',
    'settings.standard': '标准',
    'settings.colorStyle': '配色方案',
    'settings.vibrant': '鲜艳',
    'settings.pastel': '柔和',
    'settings.monochrome': '单色',

    // 预设
    'preset.quickStart': '快速开始',
    'preset.car': '🚗 汽车',
    'preset.cat': '🐱 猫咪',
    'preset.eagle': '🦅 老鹰',
    'preset.house': '🏠 房子',

    // API 密钥
    'api.title': 'Gemini API 密钥',
    'api.description': '输入你的 Google Gemini API 密钥来生成体素模型。在此获取密钥：',
    'api.placeholder': 'AIza...',

    // 提示
    'tooltip.apiKey': 'API 密钥设置',
    'tooltip.export': '导出 JSON',
    'tooltip.share': '复制到剪贴板',

    // 消息
    'msg.copied': '模型数据已复制到剪贴板！',
    'msg.enterApiKey': '请先输入你的 Gemini API 密钥',
    'msg.generateError': '生成模型失败',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh'); // 默认中文

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
