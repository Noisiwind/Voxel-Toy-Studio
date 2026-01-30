import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Plus,
  RotateCw,
  Trash2,
  RefreshCw,
  Download,
  Share2,
  Key,
  Languages,
  Settings,
  Undo,
  Redo,
  Palette,
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Scene from './components/Scene';
import TactileButton from './components/TactileButton';
import PromptModal, { GenerationSettings } from './components/PromptModal';
import EditModal from './components/EditModal';
import HandGestureControl from './components/HandGestureControl';
import { VoxelEngine } from './engine/VoxelEngine';
import { Voxel } from './types';
import { generateVoxelModel } from './utils/gemini';
import { presets } from './utils/presets';
import { useLanguage } from './contexts/LanguageContext';

function App() {
  const { t, language, setLanguage } = useLanguage();
  const [voxels, setVoxels] = useState<Voxel[]>([]);
  const [voxelHistory, setVoxelHistory] = useState<Voxel[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [isPaintMode, setIsPaintMode] = useState(false);
  const [paintColor, setPaintColor] = useState('#3b82f6');
  const [isCounterExpanded, setIsCounterExpanded] = useState(true); // 计数器展开状态
  const [apiProvider, setApiProvider] = useState<string>('deepseek'); // 默认服务商
  const engineRef = useRef<VoxelEngine | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 从 localStorage 加载 API key、历史记录，并加载默认预设模型
  useEffect(() => {
    const savedKey = localStorage.getItem('ai_api_key');
    const savedProvider = localStorage.getItem('ai_provider');
    if (savedKey) {
      setApiKey(savedKey);
    }
    if (savedProvider) {
      setApiProvider(savedProvider);
    }

    // 尝试从localStorage加载保存的历史记录
    try {
      const savedHistory = localStorage.getItem('voxel_history');
      const savedIndex = localStorage.getItem('voxel_history_index');

      if (savedHistory && savedIndex) {
        const history = JSON.parse(savedHistory);
        const index = parseInt(savedIndex);

        if (Array.isArray(history) && history.length > 0 && index >= 0 && index < history.length) {
          console.log('Loading saved history:', history.length, 'states, current index:', index);
          setVoxelHistory(history);
          setHistoryIndex(index);
          setVoxels(history[index]);
          return; // 成功加载，不需要加载默认模型
        }
      }
    } catch (error) {
      console.error('Failed to load saved history:', error);
    }

    // 没有保存的历史记录，加载默认的理想L9模型
    const initialVoxels = presets[0].data;
    setVoxels(initialVoxels);
    setVoxelHistory([initialVoxels]);
    setHistoryIndex(0);
  }, []);

  // 保存历史记录到localStorage
  useEffect(() => {
    // 保存历史记录数组
    localStorage.setItem('voxel_history', JSON.stringify(voxelHistory));
    // 保存当前历史索引
    localStorage.setItem('voxel_history_index', historyIndex.toString());
  }, [voxelHistory, historyIndex]);

  // 保存选中的AI服务商到localStorage
  useEffect(() => {
    localStorage.setItem('ai_provider', apiProvider);
  }, [apiProvider]);

  // 更新voxels并添加到历史记录
  const updateVoxelsWithHistory = useCallback((newVoxels: Voxel[]) => {
    setVoxels(newVoxels);
    const newHistory = voxelHistory.slice(0, historyIndex + 1);
    newHistory.push(newVoxels);
    setVoxelHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [voxelHistory, historyIndex]);

  // 撤销
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setVoxels(voxelHistory[newIndex]);
    }
  }, [historyIndex, voxelHistory]);

  // 重做
  const handleRedo = useCallback(() => {
    if (historyIndex < voxelHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setVoxels(voxelHistory[newIndex]);
    }
  }, [historyIndex, voxelHistory]);

  const handleEngineReady = useCallback((engine: VoxelEngine) => {
    engineRef.current = engine;
  }, []);

  const handleCameraReady = useCallback((camera: THREE.Camera, controls: OrbitControls) => {
    cameraRef.current = camera;
    controlsRef.current = controls;
  }, []);

  const handleDismantle = () => {
    if (engineRef.current) {
      engineRef.current.dismantle();
    }
  };

  const handleRebuild = () => {
    if (engineRef.current && voxels.length > 0) {
      engineRef.current.rebuild(voxels);
    }
  };

  const handleNewModel = async (prompt: string, settings: GenerationSettings, image?: string) => {
    // AI生成功能需要API key，但如果用户只想玩预设模型则不需要
    setIsLoading(true);
    try {
      const newVoxels = await generateVoxelModel(apiKey, prompt, settings, image, apiProvider);
      updateVoxelsWithHistory(newVoxels);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error generating model:', error);
      alert(`${t('msg.generateError')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(voxels, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voxel-model.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const json = JSON.stringify(voxels);
    navigator.clipboard.writeText(json);
    alert(t('msg.copied'));
  };

  const handleLoadPreset = async (preset: { name: string; data: Voxel[]; loadFrom?: string }) => {
    if (preset.loadFrom) {
      // 异步加载大型JSON文件
      try {
        const response = await fetch(preset.loadFrom);
        if (!response.ok) {
          throw new Error(`Failed to load ${preset.name}`);
        }
        const data = await response.json();
        updateVoxelsWithHistory(data);
      } catch (error) {
        console.error('Failed to load preset:', error);
        alert(`加载${preset.name}失败，请检查文件是否存在`);
      }
    } else {
      // 直接使用内嵌数据
      updateVoxelsWithHistory(preset.data);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('ai_api_key', apiKey);
    // apiProvider的保存已经通过useEffect自动处理
    setShowApiInput(false);
  };

  const handleZoom = useCallback((delta: number) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Calculate direction from camera to target
    const direction = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .normalize();

    // Move camera along direction
    camera.position.addScaledVector(direction, -delta);

    // Constrain distance
    const distance = camera.position.distanceTo(controls.target);
    if (distance < 10) {
      camera.position.copy(controls.target).addScaledVector(direction, 10);
    } else if (distance > 60) {
      camera.position.copy(controls.target).addScaledVector(direction, 60);
    }
  }, []);

  const handleRotate = useCallback((deltaX: number, deltaY: number) => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;

    // Rotate around target
    const offset = new THREE.Vector3().subVectors(
      cameraRef.current!.position,
      controls.target
    );

    const spherical = new THREE.Spherical().setFromVector3(offset);

    // Apply rotation deltas
    spherical.theta -= deltaX * 0.01;
    spherical.phi -= deltaY * 0.01;

    // Constrain phi to prevent camera flipping
    spherical.phi = Math.max(0.1, Math.min(Math.PI / 2.2, spherical.phi));

    offset.setFromSpherical(spherical);
    cameraRef.current!.position.copy(controls.target).add(offset);
  }, []);

  const handleGrab = useCallback((handX: number, handY: number, handZ: number) => {
    if (!engineRef.current || !cameraRef.current) return;
    engineRef.current.startGrab(cameraRef.current, handX, handY, handZ);
  }, []);

  const handleGrabMove = useCallback((handX: number, handY: number, handZ: number) => {
    if (!engineRef.current || !cameraRef.current) return;
    engineRef.current.updateGrab(cameraRef.current, handX, handY, handZ);
  }, []);

  const handleGrabRelease = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.releaseGrab();
  }, []);

  const handlePointerMove = useCallback((handX: number, handY: number) => {
    if (!engineRef.current || !cameraRef.current) return;
    engineRef.current.updatePointer(cameraRef.current, handX, handY);
  }, []);

  const handlePointerSelect = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.selectPointed();
  }, []);

  const handleJsonImport = useCallback((voxels: any[]) => {
    console.log('Importing JSON with', voxels.length, 'voxels');
    updateVoxelsWithHistory(voxels);
  }, [updateVoxelsWithHistory]);

  const handleEditApply = useCallback((newVoxels: Voxel[]) => {
    console.log('Applying edited voxels:', newVoxels.length);
    updateVoxelsWithHistory(newVoxels);
  }, [updateVoxelsWithHistory]);

  // 处理体素涂色
  const handleVoxelPaint = useCallback((x: number, y: number, z: number) => {
    console.log('handleVoxelPaint called:', { x, y, z, isPaintMode, paintColor });
    if (!isPaintMode) return;

    const newVoxels = voxels.map(voxel => {
      if (voxel.x === x && voxel.y === y && voxel.z === z) {
        console.log('Found matching voxel, changing color from', voxel.color, 'to', paintColor);
        return { ...voxel, color: paintColor };
      }
      return voxel;
    });

    updateVoxelsWithHistory(newVoxels);
  }, [isPaintMode, voxels, paintColor, updateVoxelsWithHistory]);

  return (
    <div className="relative w-full h-screen">
      {/* 3D 场景 - 涂色模式时改变鼠标样式 */}
      <Scene
        voxels={voxels}
        autoRotate={autoRotate}
        onEngineReady={handleEngineReady}
        onCameraReady={handleCameraReady}
        isPaintMode={isPaintMode}
        onVoxelClick={handleVoxelPaint}
      />

      {/* 涂色模式鼠标样式覆盖层 */}
      {isPaintMode && (
        <div
          className="absolute inset-0 pointer-events-none z-5"
          style={{ cursor: 'crosshair' }}
        />
      )}
      <style>{`
        ${isPaintMode ? 'canvas { cursor: crosshair !important; }' : ''}
      `}</style>

      {/* 顶部像素块计数 - 可展开收起 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => setIsCounterExpanded(!isCounterExpanded)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-2xl border-4 border-white hover:scale-105 transition-transform"
        >
          {isCounterExpanded ? (
            <div className="px-8 py-4">
              <div className="flex items-center gap-3">
                <span className="text-5xl font-black">{voxels.length}</span>
                <span className="text-xl font-bold">{t('voxels.count')}</span>
              </div>
            </div>
          ) : (
            <div className="px-6 py-3">
              <span className="text-2xl font-black">{voxels.length}</span>
            </div>
          )}
        </button>
      </div>

      {/* 语言切换按钮 - 右上角 */}
      <button
        onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
        className="absolute top-8 right-8 p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all hover:scale-110 z-10"
        title={language === 'en' ? 'Switch to Chinese' : '切换到英文'}
      >
        <Languages size={28} />
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap bg-white px-2 rounded-full shadow-sm">
          {language === 'en' ? 'EN' : '中文'}
        </span>
      </button>

      {/* Logo/Title - 右上角，无背景融入 */}
      <div className="absolute top-8 right-32 z-10">
        <div className="flex items-center gap-3">
          <img
            src="/li-auto-logo.png"
            alt="Li Auto Logo"
            className="w-14 h-14 object-contain drop-shadow-md"
          />
          <h1 className="text-2xl font-bold text-gray-800 drop-shadow-md">
            {t('app.title')}
          </h1>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="absolute top-8 left-8 flex flex-col gap-4">
        <TactileButton variant="sky" onClick={() => setIsModalOpen(true)}>
          <Plus className="inline mr-2" size={20} />
          {t('btn.newModel')}
        </TactileButton>

        <TactileButton
          variant="rose"
          onClick={handleDismantle}
          disabled={voxels.length === 0}
        >
          <Trash2 className="inline mr-2" size={20} />
          {t('btn.dismantle')}
        </TactileButton>

        <TactileButton
          variant="emerald"
          onClick={handleRebuild}
          disabled={voxels.length === 0}
        >
          <RefreshCw className="inline mr-2" size={20} />
          {t('btn.rebuild')}
        </TactileButton>

        <TactileButton
          variant={autoRotate ? 'amber' : 'sky'}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          <RotateCw className="inline mr-2" size={20} />
          {t('btn.autoRotate')}
        </TactileButton>

        {/* 手势控制按钮 */}
        <HandGestureControl
          onDismantle={handleDismantle}
          onRebuild={handleRebuild}
          onZoom={handleZoom}
          onRotate={handleRotate}
          onGrab={handleGrab}
          onGrabMove={handleGrabMove}
          onGrabRelease={handleGrabRelease}
          onPointerMove={handlePointerMove}
          onPointerSelect={handlePointerSelect}
        />

        <TactileButton
          variant="indigo"
          onClick={handleUndo}
          disabled={historyIndex <= 0}
        >
          <Undo className="inline mr-2" size={20} />
          {t('btn.undo')}
        </TactileButton>

        <TactileButton
          variant="indigo"
          onClick={handleRedo}
          disabled={historyIndex >= voxelHistory.length - 1}
        >
          <Redo className="inline mr-2" size={20} />
          {t('btn.redo')}
        </TactileButton>

        <TactileButton
          variant={isPaintMode ? 'amber' : 'sky'}
          onClick={() => setIsPaintMode(!isPaintMode)}
          disabled={voxels.length === 0}
        >
          <Palette className="inline mr-2" size={20} />
          {t('btn.paintMode')}
        </TactileButton>

        {/* 涂色模式颜色选择器 - 紧邻按钮 */}
        {isPaintMode && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border-2 border-amber-400">
            <p className="text-xs font-bold text-amber-600 mb-2 text-center">
              🎨 选择颜色
            </p>
            <input
              type="color"
              value={paintColor}
              onChange={(e) => setPaintColor(e.target.value)}
              className="w-full h-16 rounded-xl cursor-pointer border-2 border-gray-300"
            />
            <p className="text-xs font-mono text-gray-600 mt-2 text-center">
              {paintColor}
            </p>
          </div>
        )}

        <TactileButton
          variant="purple"
          onClick={() => setIsEditModalOpen(true)}
          disabled={voxels.length === 0}
        >
          <Settings className="inline mr-2" size={20} />
          {t('btn.editModel')}
        </TactileButton>
      </div>

      {/* 右上角功能按钮 - 调整位置避开语言按钮 */}
      <div className="absolute top-24 right-8 flex flex-col gap-4">
        <button
          onClick={() => setShowApiInput(true)}
          className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title={t('tooltip.apiKey')}
        >
          <Key size={24} />
        </button>

        <button
          onClick={handleExport}
          disabled={voxels.length === 0}
          className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('tooltip.export')}
        >
          <Download size={24} />
        </button>

        <button
          onClick={handleShare}
          disabled={voxels.length === 0}
          className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('tooltip.share')}
        >
          <Share2 size={24} />
        </button>
      </div>

      {/* 预设模型选择 */}
      <div className="absolute bottom-8 right-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-2xl">
          <p className="text-sm font-semibold text-gray-700 mb-3">{t('preset.quickStart')}</p>
          <div className="flex gap-3 flex-wrap max-w-md">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handleLoadPreset(preset)}
                className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg whitespace-nowrap"
                title={`Load ${preset.name}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 编辑模态框 */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentVoxels={voxels}
        onApply={handleEditApply}
      />

      {/* 提示模态框 */}
      <PromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewModel}
        onJsonImport={handleJsonImport}
        isLoading={isLoading}
      />

      {/* API Key 输入框 */}
      {showApiInput && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              AI API Key · 可选
            </h2>
            <p className="text-gray-600 mb-4">
              用AI生成模型需要API key，但可以直接使用右下角的预设模型免费玩耍。
              不填也可以关闭此对话框。
            </p>

            {/* 服务商选择 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">选择服务商</label>
              <select
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-amber-500 focus:outline-none"
              >
                <option value="deepseek">DeepSeek</option>
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI ChatGPT</option>
                <option value="claude">Anthropic Claude</option>
              </select>
            </div>

            <p className="text-sm text-gray-500 mb-2">
              {apiProvider === 'deepseek' && '获取API key: '}<a
                href={apiProvider === 'deepseek' ? 'https://platform.deepseek.com/' :
                     apiProvider === 'gemini' ? 'https://makersuite.google.com/app/apikey' :
                     apiProvider === 'openai' ? 'https://platform.openai.com/api-keys' :
                     'https://console.anthropic.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-500 hover:underline"
              >
                {apiProvider === 'deepseek' ? 'DeepSeek Platform' :
                 apiProvider === 'gemini' ? 'Google AI Studio' :
                 apiProvider === 'openai' ? 'OpenAI Platform' :
                 'Anthropic Console'}
              </a>
            </p>

            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`${apiProvider === 'deepseek' ? 'sk-...' : apiProvider === 'gemini' ? 'AIza...' : apiProvider === 'openai' ? 'sk-...' : 'sk-ant-...'} (可选)`}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-amber-500 focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <TactileButton
                variant="amber"
                onClick={saveApiKey}
                className="flex-1"
              >
                保存
              </TactileButton>
              <TactileButton
                variant="rose"
                onClick={() => setShowApiInput(false)}
                className="flex-1"
              >
                跳过
              </TactileButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
