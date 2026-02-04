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

  // 当模态框打开时，保存初始状态
  useEffect(() => {
    if (isOpen) {
      setInitialVoxels(currentVoxels);
      setPreviewVoxels(currentVoxels);
    }
  }, [isOpen, currentVoxels]);

  if (!isOpen) return null;

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
              scaledMap.set(key, { x: newX, y: newY, z: newZ, c: voxel.c });
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
        scaledMap.set(key, { x: newX, y: newY, z: newZ, c: voxel.c });
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

  // 填充内部 - 把空心模型填满
  const handleFillInside = () => {
    if (previewVoxels.length === 0) return;

    // 获取边界框
    const xs = previewVoxels.map(v => v.x);
    const ys = previewVoxels.map(v => v.y);
    const zs = previewVoxels.map(v => v.z);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);

    // 创建现有体素集合
    const voxelSet = new Set<string>();
    const voxelMap = new Map<string, Voxel>();
    for (const voxel of previewVoxels) {
      const key = `${voxel.x},${voxel.y},${voxel.z}`;
      voxelSet.add(key);
      voxelMap.set(key, voxel);
    }

    // 使用泛洪填充算法标记外部空间
    const outside = new Set<string>();
    const queue: [number, number, number][] = [];

    // 从边界外部一圈开始填充
    const padding = 1;
    for (let x = minX - padding; x <= maxX + padding; x++) {
      for (let y = minY - padding; y <= maxY + padding; y++) {
        for (let z = minZ - padding; z <= maxZ + padding; z++) {
          // 只从边界开始
          const isEdge = x === minX - padding || x === maxX + padding ||
                        y === minY - padding || y === maxY + padding ||
                        z === minZ - padding || z === maxZ + padding;

          if (isEdge) {
            const key = `${x},${y},${z}`;
            if (!voxelSet.has(key)) {
              outside.add(key);
              queue.push([x, y, z]);
            }
          }
        }
      }
    }

    // BFS标记所有外部空间
    const directions = [
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1]
    ];

    while (queue.length > 0) {
      const [x, y, z] = queue.shift()!;

      for (const [dx, dy, dz] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;
        const key = `${nx},${ny},${nz}`;

        // 检查是否在边界内
        if (nx < minX - padding || nx > maxX + padding ||
            ny < minY - padding || ny > maxY + padding ||
            nz < minZ - padding || nz > maxZ + padding) {
          continue;
        }

        // 如果这个位置是空的且未标记，加入队列
        if (!voxelSet.has(key) && !outside.has(key)) {
          outside.add(key);
          queue.push([nx, ny, nz]);
        }
      }
    }

    // 找出最常用的颜色作为填充色
    const colorCount = new Map<string, number>();
    for (const voxel of previewVoxels) {
      colorCount.set(voxel.c, (colorCount.get(voxel.c) || 0) + 1);
    }
    const fillColor = Array.from(colorCount.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '#cccccc';

    // 填充所有内部空间
    const filled: Voxel[] = [...previewVoxels];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const key = `${x},${y},${z}`;
          // 如果不在外部且不是已有体素，就填充
          if (!outside.has(key) && !voxelSet.has(key)) {
            filled.push({ x, y, z, c: fillColor });
          }
        }
      }
    }

    setPreviewVoxels(filled);
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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* 固定的头部 */}
        <div className="p-8 pb-0">
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
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-4">
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
          <div className="mb-4">
            <button
              onClick={handleReset}
              disabled={previewVoxels.length === initialVoxels.length}
              className="w-full py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🔄 重置到初始状态
            </button>
          </div>
        </div>

        {/* 可滚动的内容区域 */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
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

          {/* 填充内部 */}
          <div className="bg-emerald-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 mb-3">填充内部</h3>
            <p className="text-sm text-gray-600 mb-3">
              将空心骨架模型填充成实心模型，使用最常见的颜色填充
            </p>
            <button
              onClick={handleFillInside}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600"
            >
              🧱 填充内部空间
            </button>
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
      </div>
    </div>
  );
}
