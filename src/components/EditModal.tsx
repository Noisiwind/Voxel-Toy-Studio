import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import TactileButton from './TactileButton';
import { Voxel } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoxels: Voxel[];
  onApply: (voxels: Voxel[]) => void;
}

export default function EditModal({
  isOpen,
  onClose,
  currentVoxels,
  onApply,
}: EditModalProps) {
  const [previewVoxels, setPreviewVoxels] = useState<Voxel[]>(currentVoxels);
  const [initialVoxels, setInitialVoxels] = useState<Voxel[]>(currentVoxels);
  const [selectedColor, setSelectedColor] = useState('#3b82f6'); // 默认蓝色

  // 当模态框打开时，保存初始状态
  useEffect(() => {
    if (isOpen) {
      setInitialVoxels(currentVoxels);
      setPreviewVoxels(currentVoxels);
    }
  }, [isOpen, currentVoxels]);

  if (!isOpen) return null;

  // 获取模型中使用的所有颜色及其数量
  const getColorStats = () => {
    const colorMap = new Map<string, number>();
    for (const voxel of previewVoxels) {
      const count = colorMap.get(voxel.color) || 0;
      colorMap.set(voxel.color, count + 1);
    }
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1]) // 按数量降序排列
      .slice(0, 10); // 只显示前10种颜色
  };

  // 等比例缩放（放大）- 将每个体素变成scale³个体素
  const handleScale = (scale: number) => {
    const scaledMap = new Map<string, Voxel>();

    for (const voxel of previewVoxels) {
      // 将每个体素扩展成 scale x scale x scale 个体素
      for (let dx = 0; dx < scale; dx++) {
        for (let dy = 0; dy < scale; dy++) {
          for (let dz = 0; dz < scale; dz++) {
            const newX = voxel.x * scale + dx;
            const newY = voxel.y * scale + dy;
            const newZ = voxel.z * scale + dz;
            const key = `${newX},${newY},${newZ}`;

            if (!scaledMap.has(key)) {
              scaledMap.set(key, { x: newX, y: newY, z: newZ, color: voxel.color });
            }
          }
        }
      }
    }

    const result = Array.from(scaledMap.values());
    setPreviewVoxels(result);
  };

  // 缩小（下采样）
  const handleDownsample = (factor: number) => {
    const scaledMap = new Map<string, Voxel>();
    for (const voxel of previewVoxels) {
      const newX = Math.round(voxel.x / factor);
      const newY = Math.round(voxel.y / factor);
      const newZ = Math.round(voxel.z / factor);
      const key = `${newX},${newY},${newZ}`;

      if (!scaledMap.has(key)) {
        scaledMap.set(key, { x: newX, y: newY, z: newZ, color: voxel.color });
      }
    }

    const result = Array.from(scaledMap.values());
    setPreviewVoxels(result);
  };

  // 掏空内部
  const handleHollowOut = () => {
    const voxelSet = new Set<string>();
    for (const voxel of previewVoxels) {
      voxelSet.add(`${voxel.x},${voxel.y},${voxel.z}`);
    }

    const hasNeighbor = (x: number, y: number, z: number, dx: number, dy: number, dz: number) => {
      return voxelSet.has(`${x + dx},${y + dy},${z + dz}`);
    };

    const shell: Voxel[] = [];
    for (const voxel of previewVoxels) {
      const { x, y, z } = voxel;
      const isInterior =
        hasNeighbor(x, y, z, 1, 0, 0) &&
        hasNeighbor(x, y, z, -1, 0, 0) &&
        hasNeighbor(x, y, z, 0, 1, 0) &&
        hasNeighbor(x, y, z, 0, -1, 0) &&
        hasNeighbor(x, y, z, 0, 0, 1) &&
        hasNeighbor(x, y, z, 0, 0, -1);

      if (!isInterior) {
        shell.push(voxel);
      }
    }

    setPreviewVoxels(shell);
  };

  // 应用更改
  const handleApply = () => {
    onApply(previewVoxels);
    onClose();
  };

  // 重置到初始状态
  const handleReset = () => {
    setPreviewVoxels(initialVoxels);
  };

  // 全局换色 - 将所有体素改成选定的颜色
  const handleGlobalRecolor = () => {
    const recolored = previewVoxels.map(voxel => ({
      ...voxel,
      color: selectedColor
    }));
    setPreviewVoxels(recolored);
  };

  // 颜色替换 - 将指定颜色的体素替换成新颜色
  const handleColorReplace = (oldColor: string) => {
    const replaced = previewVoxels.map(voxel =>
      voxel.color === oldColor ? { ...voxel, color: selectedColor } : voxel
    );
    setPreviewVoxels(replaced);
  };

  // 随机着色 - 给每个体素随机颜色
  const handleRandomColors = () => {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
    const randomized = previewVoxels.map(voxel => ({
      ...voxel,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setPreviewVoxels(randomized);
  };

  // Y轴渐变着色
  const handleGradientColor = (color1: string, color2: string) => {
    // 找到Y轴的最小和最大值
    const yValues = previewVoxels.map(v => v.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const range = maxY - minY;

    // 解析颜色
    const parseColor = (hex: string) => ({
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    });

    const c1 = parseColor(color1);
    const c2 = parseColor(color2);

    const gradientVoxels = previewVoxels.map(voxel => {
      const t = range > 0 ? (voxel.y - minY) / range : 0;
      const r = Math.round(c1.r + (c2.r - c1.r) * t);
      const g = Math.round(c1.g + (c2.g - c1.g) * t);
      const b = Math.round(c1.b + (c2.b - c1.b) * t);
      const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      return { ...voxel, color };
    });

    setPreviewVoxels(gradientVoxels);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">自定义模型</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">当前体素数</p>
              <p className="text-3xl font-bold text-purple-600">{previewVoxels.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">初始体素数</p>
              <p className="text-2xl font-semibold text-gray-700">{initialVoxels.length}</p>
            </div>
          </div>
          {previewVoxels.length !== initialVoxels.length && (
            <p className="text-sm text-purple-600 mt-2">
              {previewVoxels.length < initialVoxels.length ? '减少' : '增加'} {Math.abs(previewVoxels.length - initialVoxels.length)} 个体素
              （{((Math.abs(previewVoxels.length - initialVoxels.length) / initialVoxels.length) * 100).toFixed(1)}%）
            </p>
          )}
        </div>

        {/* 重置按钮 */}
        <div className="mb-6">
          <button
            onClick={handleReset}
            disabled={previewVoxels.length === initialVoxels.length}
            className="w-full py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🔄 重置到初始状态
          </button>
        </div>

        <div className="space-y-6">
          {/* 缩小操作 */}
          <div className="bg-orange-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 mb-3">下采样（降低分辨率）</h3>
            <p className="text-sm text-gray-600 mb-3">
              降低模型分辨率，大幅减少体素数量。注意：坐标除以N会让体积变为原来的1/(N³)
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleDownsample(2)}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
              >
                下采样 ÷2 (约减少87%)
              </button>
              <button
                onClick={() => handleDownsample(3)}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
              >
                下采样 ÷3 (约减少96%)
              </button>
              <button
                onClick={() => handleDownsample(4)}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
              >
                下采样 ÷4 (约减少98%)
              </button>
            </div>
          </div>

          {/* 放大操作 */}
          <div className="bg-green-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 mb-3">放大模型</h3>
            <p className="text-sm text-gray-600 mb-3">
              整体放大模型，填充体素保持密实。放大N倍会增加N³倍体素
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleScale(2)}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600"
              >
                放大 2倍 (×8体素)
              </button>
              <button
                onClick={() => handleScale(3)}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600"
              >
                放大 3倍 (×27体素)
              </button>
            </div>
          </div>

          {/* 掏空操作 */}
          <div className="bg-pink-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 mb-3">掏空内部</h3>
            <p className="text-sm text-gray-600 mb-3">
              只保留外壳，删除被完全包围的内部体素
            </p>
            <button
              onClick={handleHollowOut}
              className="w-full py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600"
            >
              掏空内部体素
            </button>
          </div>

          {/* 涂色工具 */}
          <div className="bg-blue-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 mb-3">🎨 涂色工具</h3>

            {/* 颜色选择器 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                选择颜色
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-20 h-12 rounded-xl cursor-pointer border-2 border-gray-300"
                />
                <span className="text-sm font-mono text-gray-600">{selectedColor}</span>
              </div>
            </div>

            {/* 基础涂色操作 */}
            <div className="space-y-2 mb-4">
              <button
                onClick={handleGlobalRecolor}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
              >
                🎨 全局换色
              </button>
              <button
                onClick={handleRandomColors}
                className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600"
              >
                🌈 随机着色
              </button>
              <button
                onClick={() => handleGradientColor('#3b82f6', '#ec4899')}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-pink-600"
              >
                📊 渐变着色 (蓝→粉)
              </button>
            </div>

            {/* 颜色统计和替换 */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                当前模型颜色 (点击替换)
              </p>
              <div className="grid grid-cols-5 gap-2">
                {getColorStats().map(([color, count]) => (
                  <button
                    key={color}
                    onClick={() => handleColorReplace(color)}
                    className="relative group"
                    title={`${color} (${count}个体素)\n点击替换成选定颜色`}
                  >
                    <div
                      className="w-full h-12 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                    <span className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-black/70 text-white rounded-b-lg py-0.5">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 mt-6 pt-6 border-t-2">
          <TactileButton
            variant="sky"
            onClick={handleApply}
            className="flex-1"
          >
            应用更改
          </TactileButton>
          <TactileButton
            variant="rose"
            onClick={onClose}
          >
            取消
          </TactileButton>
        </div>
      </div>
    </div>
  );
}
