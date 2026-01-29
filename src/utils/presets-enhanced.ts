import { Voxel } from '../types';

// 生成详细老鹰的辅助函数
function createDetailedEagle(): Voxel[] {
  const voxels: Voxel[] = [];

  // 身体 - 棕色
  const bodyColor = '#5D4E37';
  for (let y = 4; y <= 8; y++) {
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        voxels.push({ x, y, z, color: bodyColor });
      }
    }
  }

  // 头部 - 白色
  const headColor = '#FFFFFF';
  for (let y = 9; y <= 11; y++) {
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        voxels.push({ x, y, z, color: headColor });
      }
    }
  }

  // 喙 - 金黄色
  const beakColor = '#FFD700';
  for (let y = 10; y <= 11; y++) {
    voxels.push({ x: 0, y, z: 2, color: beakColor });
    voxels.push({ x: 0, y, z: 3, color: beakColor });
  }

  // 眼睛 - 黑色
  voxels.push({ x: -1, y: 11, z: 1, color: '#000000' });
  voxels.push({ x: 1, y: 11, z: 1, color: '#000000' });

  // 左翅膀 - 深棕到浅棕渐变
  const wingColors = ['#3D2817', '#4A3728', '#5D4E37', '#6F5D47'];
  for (let x = -8; x <= -2; x++) {
    for (let y = 5; y <= 7; y++) {
      for (let z = -2; z <= 1; z++) {
        const colorIndex = Math.min(Math.abs(x + 2), wingColors.length - 1);
        voxels.push({ x, y, z, color: wingColors[colorIndex] });
      }
    }
  }

  // 添加左翅膀细节羽毛
  for (let x = -9; x <= -5; x++) {
    for (let z = -3; z <= 2; z++) {
      if (Math.random() > 0.3) {
        voxels.push({ x, y: 6, z, color: '#3D2817' });
      }
    }
  }

  // 右翅膀 - 对称
  for (let x = 2; x <= 8; x++) {
    for (let y = 5; y <= 7; y++) {
      for (let z = -2; z <= 1; z++) {
        const colorIndex = Math.min(Math.abs(x - 2), wingColors.length - 1);
        voxels.push({ x, y, z, color: wingColors[colorIndex] });
      }
    }
  }

  // 添加右翅膀细节羽毛
  for (let x = 5; x <= 9; x++) {
    for (let z = -3; z <= 2; z++) {
      if (Math.random() > 0.3) {
        voxels.push({ x, y: 6, z, color: '#3D2817' });
      }
    }
  }

  // 尾巴 - 扇形
  const tailColors = ['#5D4E37', '#4A3728', '#3D2817'];
  for (let y = 3; y <= 5; y++) {
    for (let z = -5; z <= -2; z++) {
      for (let x = -2; x <= 2; x++) {
        const colorIndex = Math.min(Math.abs(z + 2), tailColors.length - 1);
        voxels.push({ x, y, z, color: tailColors[colorIndex] });
      }
    }
  }

  // 尾羽细节
  for (let x = -3; x <= 3; x++) {
    for (let z = -6; z <= -4; z++) {
      if (Math.abs(x) + Math.abs(z + 5) < 4) {
        voxels.push({ x, y: 4, z, color: '#3D2817' });
      }
    }
  }

  // 爪子 - 黄色
  const clawColor = '#FFD700';
  // 左爪
  voxels.push({ x: -1, y: 3, z: 0, color: clawColor });
  voxels.push({ x: -1, y: 2, z: 0, color: clawColor });
  voxels.push({ x: -1, y: 2, z: 1, color: clawColor });
  voxels.push({ x: -2, y: 2, z: 1, color: clawColor });

  // 右爪
  voxels.push({ x: 1, y: 3, z: 0, color: clawColor });
  voxels.push({ x: 1, y: 2, z: 0, color: clawColor });
  voxels.push({ x: 1, y: 2, z: 1, color: clawColor });
  voxels.push({ x: 2, y: 2, z: 1, color: clawColor });

  // 添加更多身体细节
  const detailColor = '#6F5D47';
  for (let y = 5; y <= 7; y++) {
    voxels.push({ x: -2, y, z: 0, color: detailColor });
    voxels.push({ x: 2, y, z: 0, color: detailColor });
  }

  return voxels;
}

export const presetDetailedEagle = createDetailedEagle();

// 简单预设保持不变
export const presetCar: Voxel[] = [
  // ... 保持原样
];

// 其他预设...
