import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Plus,
  RotateCw,
  Trash2,
  RefreshCw,
  Download,
  Share2,
  Languages,
  Settings,
  Undo,
  Redo,
  Brain,
  Loader2,
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Scene from './components/Scene';
import TactileButton from './components/TactileButton';
import PromptModal, { GenerationSettings } from './components/PromptModal';
import EditModal from './components/EditModal';
import HandGestureControl from './components/HandGestureControl';
import LogicHub, { GenerationLog } from './components/LogicHub';
import { VoxelEngine } from './engine/VoxelEngine';
import { Voxel } from './types';
import { generateVoxelModel } from './utils/gemini';
import { generateVoxelModelFromWorkflow } from './utils/workflow';
import { presets } from './utils/presets';
import { useLanguage } from './contexts/LanguageContext';

function App() {
  const { t, language, setLanguage } = useLanguage();
  const [voxels, setVoxels] = useState<Voxel[]>([]);
  const [voxelHistory, setVoxelHistory] = useState<Voxel[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [generationHistory, setGenerationHistory] = useState<Array<{ prompt: string; voxels: Voxel[]; timestamp: number }>>([]);
  const [generationLogs, setGenerationLogs] = useState<GenerationLog[]>([]);
  const [isLogicHubOpen, setIsLogicHubOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCounterExpanded, setIsCounterExpanded] = useState(true); // 计数器展开状态

  // 工作流配置 - 硬编码默认值
  const apiMode = 'workflow'; // 固定使用工作流模式
  const workflowUrl = 'https://liai-app.chj.cloud/v1/chat-messages';
  const workflowKey = 'app-mIhY5PkUoC0UrLULTfWDvNf5';

  const engineRef = useRef<VoxelEngine | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 从 localStorage 加载历史记录，并加载默认预设模型
  useEffect(() => {
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

    // 没有保存的历史记录，加载默认的理想同学模型
    const loadDefaultModel = async () => {
      try {
        const firstPreset = presets[0];
        let initialVoxels: Voxel[];

        if (firstPreset.loadFrom) {
          // 异步加载
          const response = await fetch(firstPreset.loadFrom);
          initialVoxels = await response.json();
        } else {
          // 直接使用
          initialVoxels = firstPreset.data;
        }

        setVoxels(initialVoxels);
        setVoxelHistory([initialVoxels]);
        setHistoryIndex(0);
      } catch (error) {
        console.error('Failed to load default model:', error);
      }
    };

    loadDefaultModel();
  }, []);

  // 保存历史记录到localStorage
  useEffect(() => {
    // 保存历史记录数组
    localStorage.setItem('voxel_history', JSON.stringify(voxelHistory));
    // 保存当前历史索引
    localStorage.setItem('voxel_history_index', historyIndex.toString());
  }, [voxelHistory, historyIndex]);

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

  const handleNewModel = async (prompt: string, settings: GenerationSettings) => {
    setIsLoading(true);
    const timestamp = Date.now();
    let systemPrompt = '';
    let aiResponse = '';
    let success = false;
    let errorMsg = '';

    try {
      let newVoxels: Voxel[];

      // 使用工作流API
      newVoxels = await generateVoxelModelFromWorkflow(
        { apiUrl: workflowUrl, apiKey: workflowKey || undefined },
        prompt,
        settings,
        undefined,
        (sys, ai) => {
          systemPrompt = sys;
          aiResponse = ai;
        }
      );

      updateVoxelsWithHistory(newVoxels);
      success = true;

      // 添加到生成历史记录
      setGenerationHistory(prev => [
        {
          prompt: prompt,
          voxels: newVoxels,
          timestamp,
        },
        ...prev, // 最新的在前面
      ]);

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error generating model:', error);
      errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`${t('msg.generateError')}: ${errorMsg}`);
    } finally {
      // 记录生成日志
      setGenerationLogs(prev => [
        {
          timestamp,
          userPrompt: prompt,
          systemPrompt,
          aiResponse,
          settings,
          success,
          error: errorMsg || undefined,
        },
        ...prev,
      ]);

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

    // 添加到生成历史记录
    setGenerationHistory(prev => [
      {
        prompt: `JSON导入 (${voxels.length}个体素)`,
        voxels: voxels,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, [updateVoxelsWithHistory]);

  const handleEditApply = useCallback((newVoxels: Voxel[]) => {
    console.log('Applying edited voxels:', newVoxels.length);
    updateVoxelsWithHistory(newVoxels);
  }, [updateVoxelsWithHistory]);

  return (
    <div className="relative w-full h-screen">
      {/* 3D 场景 */}
      <Scene
        voxels={voxels}
        autoRotate={autoRotate}
        onEngineReady={handleEngineReady}
        onCameraReady={handleCameraReady}
      />

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
        {/* Logic Hub 按钮 */}
        <button
          onClick={() => setIsLogicHubOpen(true)}
          className="p-3 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full shadow-lg hover:from-emerald-500 hover:to-cyan-600 transition-all text-white relative group"
          title="Logic Hub - 查看AI思考过程"
        >
          <Brain size={24} />
          {generationLogs.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {generationLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-3 rounded-full shadow-lg transition-colors ${
            autoRotate
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600'
              : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          title={t('tooltip.autoRotate')}
        >
          <RotateCw size={24} />
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
                title={`Load ${t(preset.translationKey)}`}
              >
                {t(preset.translationKey)}
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
        generationHistory={generationHistory}
        onLoadHistory={(voxels) => {
          updateVoxelsWithHistory(voxels);
          setIsModalOpen(false);
        }}
      />

      {/* Logic Hub */}
      <LogicHub
        isOpen={isLogicHubOpen}
        onClose={() => setIsLogicHubOpen(false)}
        logs={generationLogs}
      />

      {/* 全屏加载遮罩 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-3xl p-12 shadow-2xl flex flex-col items-center gap-6 max-w-md">
            {/* 旋转的加载图标 */}
            <div className="relative">
              <Loader2
                size={80}
                className="text-sky-500 animate-spin"
                strokeWidth={2.5}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>

            {/* 加载文字 */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {language === 'en' ? 'AI is Creating...' : 'AI正在创作中...'}
              </h3>
              <p className="text-gray-600">
                {language === 'en'
                  ? 'Please wait while we generate your voxel model'
                  : '请稍候，正在生成您的体素模型'}
              </p>
            </div>

            {/* 动画点点点 */}
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
