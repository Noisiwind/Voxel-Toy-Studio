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
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Scene from './components/Scene';
import TactileButton from './components/TactileButton';
import PromptModal, { GenerationSettings } from './components/PromptModal';
import HandGestureControl from './components/HandGestureControl';
import { VoxelEngine } from './engine/VoxelEngine';
import { Voxel } from './types';
import { generateVoxelModel } from './utils/gemini';
import { presets } from './utils/presets';
import { useLanguage } from './contexts/LanguageContext';

function App() {
  const { t, language, setLanguage } = useLanguage();
  const [voxels, setVoxels] = useState<Voxel[]>([]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const engineRef = useRef<VoxelEngine | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 从 localStorage 加载 API key，并加载默认预设模型
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowApiInput(true);
    }

    // 加载默认的理想L9模型作为欢迎展示
    setVoxels(presets[0].data); // Li L9
  }, []);

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
    if (!apiKey) {
      alert(t('msg.enterApiKey'));
      setShowApiInput(true);
      return;
    }

    setIsLoading(true);
    try {
      const newVoxels = await generateVoxelModel(apiKey, prompt, settings, image);
      setVoxels(newVoxels);
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

  const handleLoadPreset = (presetData: Voxel[]) => {
    setVoxels(presetData);
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey);
      setShowApiInput(false);
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

  return (
    <div className="relative w-full h-screen">
      {/* 3D 场景 */}
      <Scene
        voxels={voxels}
        autoRotate={autoRotate}
        onEngineReady={handleEngineReady}
        onCameraReady={handleCameraReady}
      />

      {/* 顶部体素计数 - 突出显示 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-2xl border-4 border-white">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-black">{voxels.length}</span>
            <span className="text-xl font-bold">{t('voxels.count')}</span>
          </div>
        </div>
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
        />
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

      {/* Logo/Title */}
      <div className="absolute bottom-8 left-8">
        <div className="flex items-center gap-4">
          {/* 理想汽车 Logo */}
          <img
            src="/li-auto-logo.png"
            alt="Li Auto Logo"
            className="w-20 h-20 object-contain"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-800 drop-shadow-lg">
              {t('app.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {voxels.length > 0 ? `${voxels.length} ${t('voxels.count')}` : t('voxels.empty')}
            </p>
          </div>
        </div>
      </div>

      {/* 预设模型选择 */}
      <div className="absolute bottom-8 right-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-2xl">
          <p className="text-sm font-semibold text-gray-700 mb-3">{t('preset.quickStart')}</p>
          <div className="flex gap-3 flex-wrap max-w-md">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handleLoadPreset(preset.data)}
                className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg whitespace-nowrap"
                title={`Load ${preset.name}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 提示模态框 */}
      <PromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewModel}
        isLoading={isLoading}
      />

      {/* API Key 输入框 */}
      {showApiInput && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Gemini API Key
            </h2>
            <p className="text-gray-600 mb-4">
              Enter your Google Gemini API key to generate voxel models.
              Get your key at{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-500 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-sky-500 focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <TactileButton
                variant="sky"
                onClick={saveApiKey}
                disabled={!apiKey.trim()}
                className="flex-1"
              >
                Save
              </TactileButton>
              {apiKey && (
                <TactileButton
                  variant="rose"
                  onClick={() => setShowApiInput(false)}
                >
                  Cancel
                </TactileButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
