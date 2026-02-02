import { Voxel } from '../types';

// 理想L9 - 银灰色大型SUV（超详细版 ~600体素）
function createLiL9(): Voxel[] {
  const voxels: Voxel[] = [];

  // 精细色彩层次
  const bodyBase = '#9A9A9A';          // 车身基础灰
  const bodyColor = '#B8B8B8';         // 银灰色主体
  const bodyLight = '#D0D0D0';         // 高光
  const bodyDark = '#7A7A7A';          // 阴影
  const bodyShadow = '#5A5A5A';        // 深阴影
  const windowColor = '#1A1A1A';       // 深色玻璃
  const windowLight = '#2A2A2A';       // 浅色玻璃
  const wheelColor = '#0A0A0A';        // 黑色轮胎
  const wheelRim = '#B0B0B0';          // 亮银轮毂
  const lightColor = '#FFFFFF';        // 白色灯
  const lightGlow = '#E0E0E0';         // 灯光晕
  const grillColor = '#2A2A2A';        // 格栅
  const chromeColor = '#E8E8E8';       // 镀铬饰条

  // === 底盘和基础结构 ===
  // 底盘 (y=-1 到 y=0)
  for (let x = -7; x <= 7; x++) {
    for (let z = -3; z <= 3; z++) {
      for (let y = -1; y <= 0; y++) {
        if (Math.abs(z) <= 2) {
          voxels.push({ x, y, z, color: bodyShadow });
        }
      }
    }
  }

  // === 车身下部 (y=1-2) ===
  for (let y = 1; y <= 2; y++) {
    for (let x = -7; x <= 7; x++) {
      for (let z = -3; z <= 3; z++) {
        if (Math.abs(z) === 3) {
          // 外侧裙边
          voxels.push({ x, y, z, color: bodyDark });
        } else if (Math.abs(z) === 2) {
          // 车门下部
          voxels.push({ x, y, z, color: bodyBase });
        } else {
          // 内侧
          voxels.push({ x, y, z, color: bodyColor });
        }
      }
    }
  }

  // === 车身主体 (y=3-4) ===
  for (let y = 3; y <= 4; y++) {
    for (let x = -7; x <= 7; x++) {
      for (let z = -3; z <= 3; z++) {
        if (Math.abs(z) === 3) {
          // 侧面板金
          if ((x + y) % 3 === 0) {
            voxels.push({ x, y, z, color: bodyLight }); // 高光
          } else if ((x + y) % 3 === 1) {
            voxels.push({ x, y, z, color: bodyColor });
          } else {
            voxels.push({ x, y, z, color: bodyBase });
          }
        } else if (Math.abs(z) === 2) {
          // 车门主体
          voxels.push({ x, y, z, color: bodyColor });
        } else {
          voxels.push({ x, y, z, color: bodyColor });
        }
      }
    }
  }

  // === 车窗层 (y=5-6) ===
  for (let y = 5; y <= 6; y++) {
    for (let x = -7; x <= 7; x++) {
      for (let z = -3; z <= 3; z++) {
        // 侧窗
        if (Math.abs(z) === 2 && x >= -6 && x <= 5) {
          if (x === -3 || x === 0 || x === 2) {
            // 窗框分隔
            voxels.push({ x, y, z, color: bodyColor });
          } else {
            voxels.push({ x, y, z, color: y === 5 ? windowColor : windowLight });
          }
        }
        // 外侧腰线
        else if (Math.abs(z) === 3 && x >= -6 && x <= 6) {
          voxels.push({ x, y, z, color: chromeColor });
        }
        // 中央结构
        else if (Math.abs(z) <= 1) {
          if (x >= -5 && x <= 4 && Math.abs(z) === 1) {
            voxels.push({ x, y, z, color: windowColor });
          } else if (z === 0) {
            if (x === -2 || x === 1) {
              voxels.push({ x, y, z, color: bodyBase }); // A/B柱
            } else {
              voxels.push({ x, y, z, color: windowColor });
            }
          } else {
            voxels.push({ x, y, z, color: bodyColor });
          }
        }
        // 车顶过渡
        else {
          voxels.push({ x, y, z, color: bodyColor });
        }
      }
    }
  }

  // === 车顶 (y=7-8) ===
  for (let y = 7; y <= 8; y++) {
    for (let x = -6; x <= 5; x++) {
      for (let z = -2; z <= 2; z++) {
        if (y === 7) {
          voxels.push({ x, y, z, color: bodyDark });
        } else if (y === 8 && Math.abs(z) <= 1 && x >= -5 && x <= 4) {
          voxels.push({ x, y, z, color: bodyShadow });
        }
      }
    }
  }

  // 车顶行李架
  for (let x = -5; x <= 4; x += 2) {
    voxels.push({ x, y: 9, z: -2, color: chromeColor });
    voxels.push({ x, y: 9, z: 2, color: chromeColor });
  }

  // === 前脸设计 (z=4 到 z=6) ===
  // 前保险杠 (z=4)
  for (let x = -6; x <= 6; x++) {
    for (let y = 1; y <= 2; y++) {
      voxels.push({ x, y, z: 4, color: bodyDark });
    }
  }

  // 前格栅和大灯 (z=5)
  for (let y = 2; y <= 4; y++) {
    for (let x = -6; x <= 6; x++) {
      if (y === 2 || y === 3) {
        // 灯组层
        if (x >= -6 && x <= -3) {
          voxels.push({ x, y, z: 5, color: y === 2 ? lightColor : lightGlow });
        } else if (x >= 3 && x <= 6) {
          voxels.push({ x, y, z: 5, color: y === 2 ? lightColor : lightGlow });
        } else if (x >= -2 && x <= 2) {
          voxels.push({ x, y, z: 5, color: grillColor });
        } else {
          voxels.push({ x, y, z: 5, color: bodyBase });
        }
      } else {
        // 引擎盖
        if (x >= -5 && x <= 5) {
          voxels.push({ x, y, z: 5, color: (x + y) % 2 === 0 ? bodyLight : bodyColor });
        }
      }
    }
  }

  // 前挡风玻璃 (z=4)
  for (let x = -4; x <= 4; x++) {
    for (let y = 5; y <= 6; y++) {
      voxels.push({ x, y, z: 4, color: windowLight });
    }
  }

  // === 后部设计 (z=-4 到 z=-6) ===
  // 后保险杠
  for (let x = -6; x <= 6; x++) {
    for (let y = 1; y <= 2; y++) {
      voxels.push({ x, y, z: -4, color: bodyDark });
    }
  }

  // 后尾灯和后备箱 (z=-5)
  for (let y = 2; y <= 4; y++) {
    for (let x = -6; x <= 6; x++) {
      if (y === 2 || y === 3) {
        if (x >= -6 && x <= -3) {
          voxels.push({ x, y, z: -5, color: '#FF3333' }); // 左尾灯
        } else if (x >= 3 && x <= 6) {
          voxels.push({ x, y, z: -5, color: '#FF3333' }); // 右尾灯
        } else {
          voxels.push({ x, y, z: -5, color: bodyBase });
        }
      } else {
        voxels.push({ x, y, z: -5, color: bodyColor });
      }
    }
  }

  // 后窗
  for (let x = -4; x <= 4; x++) {
    for (let y = 5; y <= 6; y++) {
      voxels.push({ x, y, z: -4, color: windowColor });
    }
  }

  // === 轮胎和轮毂 ===
  // 前左轮
  for (let x = -8; x <= -7; x++) {
    for (let z = -3; z <= -2; z++) {
      for (let y = 0; y <= 2; y++) {
        if (x === -8) {
          voxels.push({ x, y, z, color: wheelColor });
        } else {
          voxels.push({ x, y, z, color: y === 1 ? wheelRim : wheelColor });
        }
      }
    }
  }
  // 前右轮
  for (let x = -8; x <= -7; x++) {
    for (let z = 2; z <= 3; z++) {
      for (let y = 0; y <= 2; y++) {
        if (x === -8) {
          voxels.push({ x, y, z, color: wheelColor });
        } else {
          voxels.push({ x, y, z, color: y === 1 ? wheelRim : wheelColor });
        }
      }
    }
  }

  // 后左轮
  for (let x = 7; x <= 8; x++) {
    for (let z = -3; z <= -2; z++) {
      for (let y = 0; y <= 2; y++) {
        if (x === 8) {
          voxels.push({ x, y, z, color: wheelColor });
        } else {
          voxels.push({ x, y, z, color: y === 1 ? wheelRim : wheelColor });
        }
      }
    }
  }
  // 后右轮
  for (let x = 7; x <= 8; x++) {
    for (let z = 2; z <= 3; z++) {
      for (let y = 0; y <= 2; y++) {
        if (x === 8) {
          voxels.push({ x, y, z, color: wheelColor });
        } else {
          voxels.push({ x, y, z, color: y === 1 ? wheelRim : wheelColor });
        }
      }
    }
  }

  // === 后视镜 ===
  // 左侧
  voxels.push({ x: -7, y: 6, z: -4, color: bodyColor });
  voxels.push({ x: -8, y: 6, z: -4, color: windowColor });
  // 右侧
  voxels.push({ x: -7, y: 6, z: 4, color: bodyColor });
  voxels.push({ x: -8, y: 6, z: 4, color: windowColor });

  // === 细节装饰 ===
  // 门把手
  for (let x = -4; x <= 3; x += 3) {
    voxels.push({ x, y: 3, z: 4, color: chromeColor });
    voxels.push({ x, y: 3, z: -4, color: chromeColor });
  }

  return voxels;
}

export const presetLiL9 = createLiL9();

// 预设模型：可爱的猫
export const presetCat: Voxel[] = [
  // 身体
  {"x": -1, "y": 1, "z": 0, "color": "#ff9933"},
  {"x": 0, "y": 1, "z": 0, "color": "#ff9933"},
  {"x": 1, "y": 1, "z": 0, "color": "#ff9933"},
  {"x": -1, "y": 2, "z": 0, "color": "#ff9933"},
  {"x": 0, "y": 2, "z": 0, "color": "#ff9933"},
  {"x": 1, "y": 2, "z": 0, "color": "#ff9933"},

  // 头部
  {"x": -1, "y": 3, "z": 0, "color": "#ffaa55"},
  {"x": 0, "y": 3, "z": 0, "color": "#ffaa55"},
  {"x": 1, "y": 3, "z": 0, "color": "#ffaa55"},
  {"x": 0, "y": 4, "z": 0, "color": "#ffaa55"},

  // 耳朵
  {"x": -1, "y": 4, "z": 0, "color": "#ff9933"},
  {"x": 1, "y": 4, "z": 0, "color": "#ff9933"},
  {"x": -1, "y": 5, "z": 0, "color": "#ff8822"},
  {"x": 1, "y": 5, "z": 0, "color": "#ff8822"},

  // 眼睛
  {"x": -1, "y": 3, "z": 1, "color": "#222222"},
  {"x": 1, "y": 3, "z": 1, "color": "#222222"},

  // 鼻子
  {"x": 0, "y": 3, "z": 1, "color": "#ff6699"},

  // 腿
  {"x": -1, "y": 0, "z": 0, "color": "#ff9933"},
  {"x": 1, "y": 0, "z": 0, "color": "#ff9933"},

  // 尾巴
  {"x": 2, "y": 1, "z": 0, "color": "#ff9933"},
  {"x": 2, "y": 2, "z": 0, "color": "#ff9933"},
  {"x": 2, "y": 3, "z": 0, "color": "#ff9933"},
];

// 预设模型：详细的飞鹰（增强版）
function createDetailedEagle(): Voxel[] {
  const voxels: Voxel[] = [];

  // 身体核心 - 深棕色
  const bodyColor = '#5D4E37';
  for (let y = 4; y <= 8; y++) {
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        voxels.push({ x, y, z, color: bodyColor });
      }
    }
  }

  // 胸部细节 - 浅棕色
  for (let y = 5; y <= 7; y++) {
    voxels.push({ x: 0, y, z: 1, color: '#8B7355' });
  }

  // 头部 - 白色
  const headColor = '#F5F5F5';
  for (let y = 9; y <= 11; y++) {
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        voxels.push({ x, y, z, color: headColor });
      }
    }
  }

  // 喙 - 金黄色，三角形
  const beakColor = '#FFC700';
  voxels.push({ x: 0, y: 10, z: 2, color: beakColor });
  voxels.push({ x: 0, y: 11, z: 2, color: beakColor });
  voxels.push({ x: 0, y: 10, z: 3, color: '#FFD700' });

  // 眼睛 - 黑色有神
  voxels.push({ x: -1, y: 11, z: 1, color: '#000000' });
  voxels.push({ x: 1, y: 11, z: 1, color: '#000000' });

  // 左翅膀主体
  const wingDark = '#3D2817';
  const wingMid = '#4A3728';
  const wingLight = '#6F5D47';

  for (let x = -2; x >= -8; x--) {
    for (let y = 5; y <= 7; y++) {
      for (let z = -2; z <= 1; z++) {
        const depth = Math.abs(x + 2);
        let color = depth > 4 ? wingDark : depth > 2 ? wingMid : wingLight;
        voxels.push({ x, y, z, color });
      }
    }
  }

  // 左翅膀细节羽毛
  for (let x = -5; x >= -9; x--) {
    for (let z = -3; z <= 2; z++) {
      voxels.push({ x, y: 6, z, color: wingDark });
      if ((x + z) % 2 === 0) {
        voxels.push({ x, y: 7, z, color: '#2A1810' });
      }
    }
  }

  // 右翅膀主体（对称）
  for (let x = 2; x <= 8; x++) {
    for (let y = 5; y <= 7; y++) {
      for (let z = -2; z <= 1; z++) {
        const depth = Math.abs(x - 2);
        let color = depth > 4 ? wingDark : depth > 2 ? wingMid : wingLight;
        voxels.push({ x, y, z, color });
      }
    }
  }

  // 右翅膀细节羽毛
  for (let x = 5; x <= 9; x++) {
    for (let z = -3; z <= 2; z++) {
      voxels.push({ x, y: 6, z, color: wingDark });
      if ((x + z) % 2 === 0) {
        voxels.push({ x, y: 7, z, color: '#2A1810' });
      }
    }
  }

  // 尾巴 - 扇形展开
  for (let y = 3; y <= 5; y++) {
    for (let z = -2; z >= -5; z--) {
      for (let x = -2; x <= 2; x++) {
        const spread = Math.abs(z + 3);
        if (Math.abs(x) <= spread) {
          voxels.push({ x, y, z, color: spread > 1 ? wingMid : wingLight });
        }
      }
    }
  }

  // 尾羽末端细节
  for (let x = -3; x <= 3; x++) {
    if (Math.abs(x) % 2 === 1) {
      voxels.push({ x, y: 4, z: -6, color: wingDark });
    }
  }

  // 腿和爪子 - 金黄色
  const clawColor = '#FFB700';
  // 左腿
  voxels.push({ x: -1, y: 3, z: 0, color: '#C4A000' });
  voxels.push({ x: -1, y: 2, z: 0, color: clawColor });
  voxels.push({ x: -1, y: 1, z: 1, color: clawColor });
  voxels.push({ x: -2, y: 1, z: 1, color: clawColor });
  voxels.push({ x: 0, y: 1, z: 1, color: clawColor });

  // 右腿
  voxels.push({ x: 1, y: 3, z: 0, color: '#C4A000' });
  voxels.push({ x: 1, y: 2, z: 0, color: clawColor });
  voxels.push({ x: 1, y: 1, z: 1, color: clawColor });
  voxels.push({ x: 2, y: 1, z: 1, color: clawColor });
  voxels.push({ x: 0, y: 1, z: 1, color: clawColor });

  // 颈部过渡
  voxels.push({ x: 0, y: 8, z: 0, color: '#E5E5E5' });
  voxels.push({ x: 0, y: 9, z: 0, color: headColor });

  return voxels;
}

export const presetEagle = createDetailedEagle();

// 预设模型：小房子
export const presetHouse: Voxel[] = [
  // 地基
  {"x": -2, "y": 0, "z": -2, "color": "#8B7355"},
  {"x": -1, "y": 0, "z": -2, "color": "#8B7355"},
  {"x": 0, "y": 0, "z": -2, "color": "#8B7355"},
  {"x": 1, "y": 0, "z": -2, "color": "#8B7355"},
  {"x": 2, "y": 0, "z": -2, "color": "#8B7355"},
  {"x": -2, "y": 0, "z": -1, "color": "#8B7355"},
  {"x": 2, "y": 0, "z": -1, "color": "#8B7355"},
  {"x": -2, "y": 0, "z": 0, "color": "#8B7355"},
  {"x": 2, "y": 0, "z": 0, "color": "#8B7355"},
  {"x": -2, "y": 0, "z": 1, "color": "#8B7355"},
  {"x": 2, "y": 0, "z": 1, "color": "#8B7355"},
  {"x": -2, "y": 0, "z": 2, "color": "#8B7355"},
  {"x": -1, "y": 0, "z": 2, "color": "#8B7355"},
  {"x": 0, "y": 0, "z": 2, "color": "#8B7355"},
  {"x": 1, "y": 0, "z": 2, "color": "#8B7355"},
  {"x": 2, "y": 0, "z": 2, "color": "#8B7355"},

  // 墙壁 - 层1
  {"x": -2, "y": 1, "z": -2, "color": "#FFE4B5"},
  {"x": -1, "y": 1, "z": -2, "color": "#FFE4B5"},
  {"x": 0, "y": 1, "z": -2, "color": "#6495ED"},
  {"x": 1, "y": 1, "z": -2, "color": "#FFE4B5"},
  {"x": 2, "y": 1, "z": -2, "color": "#FFE4B5"},
  {"x": -2, "y": 1, "z": -1, "color": "#FFE4B5"},
  {"x": 2, "y": 1, "z": -1, "color": "#FFE4B5"},
  {"x": -2, "y": 1, "z": 0, "color": "#FFE4B5"},
  {"x": 2, "y": 1, "z": 0, "color": "#FFE4B5"},
  {"x": -2, "y": 1, "z": 1, "color": "#FFE4B5"},
  {"x": 2, "y": 1, "z": 1, "color": "#FFE4B5"},
  {"x": -2, "y": 1, "z": 2, "color": "#FFE4B5"},
  {"x": -1, "y": 1, "z": 2, "color": "#FFE4B5"},
  {"x": 0, "y": 1, "z": 2, "color": "#FFE4B5"},
  {"x": 1, "y": 1, "z": 2, "color": "#FFE4B5"},
  {"x": 2, "y": 1, "z": 2, "color": "#FFE4B5"},

  // 墙壁 - 层2
  {"x": -2, "y": 2, "z": -2, "color": "#FFE4B5"},
  {"x": -1, "y": 2, "z": -2, "color": "#FFE4B5"},
  {"x": 0, "y": 2, "z": -2, "color": "#6495ED"},
  {"x": 1, "y": 2, "z": -2, "color": "#FFE4B5"},
  {"x": 2, "y": 2, "z": -2, "color": "#FFE4B5"},
  {"x": -2, "y": 2, "z": -1, "color": "#FFE4B5"},
  {"x": 2, "y": 2, "z": -1, "color": "#FFE4B5"},
  {"x": -2, "y": 2, "z": 0, "color": "#FFE4B5"},
  {"x": 2, "y": 2, "z": 0, "color": "#FFE4B5"},
  {"x": -2, "y": 2, "z": 1, "color": "#FFE4B5"},
  {"x": 2, "y": 2, "z": 1, "color": "#FFE4B5"},
  {"x": -2, "y": 2, "z": 2, "color": "#FFE4B5"},
  {"x": -1, "y": 2, "z": 2, "color": "#FFE4B5"},
  {"x": 0, "y": 2, "z": 2, "color": "#FFE4B5"},
  {"x": 1, "y": 2, "z": 2, "color": "#FFE4B5"},
  {"x": 2, "y": 2, "z": 2, "color": "#FFE4B5"},

  // 屋顶
  {"x": -2, "y": 3, "z": -2, "color": "#DC143C"},
  {"x": -1, "y": 3, "z": -2, "color": "#DC143C"},
  {"x": 0, "y": 3, "z": -2, "color": "#DC143C"},
  {"x": 1, "y": 3, "z": -2, "color": "#DC143C"},
  {"x": 2, "y": 3, "z": -2, "color": "#DC143C"},
  {"x": -2, "y": 3, "z": -1, "color": "#DC143C"},
  {"x": 2, "y": 3, "z": -1, "color": "#DC143C"},
  {"x": -2, "y": 3, "z": 0, "color": "#DC143C"},
  {"x": 2, "y": 3, "z": 0, "color": "#DC143C"},
  {"x": -2, "y": 3, "z": 1, "color": "#DC143C"},
  {"x": 2, "y": 3, "z": 1, "color": "#DC143C"},
  {"x": -2, "y": 3, "z": 2, "color": "#DC143C"},
  {"x": -1, "y": 3, "z": 2, "color": "#DC143C"},
  {"x": 0, "y": 3, "z": 2, "color": "#DC143C"},
  {"x": 1, "y": 3, "z": 2, "color": "#DC143C"},
  {"x": 2, "y": 3, "z": 2, "color": "#DC143C"},

  {"x": -1, "y": 4, "z": -1, "color": "#B22222"},
  {"x": 0, "y": 4, "z": -1, "color": "#B22222"},
  {"x": 1, "y": 4, "z": -1, "color": "#B22222"},
  {"x": -1, "y": 4, "z": 0, "color": "#B22222"},
  {"x": 0, "y": 4, "z": 0, "color": "#B22222"},
  {"x": 1, "y": 4, "z": 0, "color": "#B22222"},
  {"x": -1, "y": 4, "z": 1, "color": "#B22222"},
  {"x": 0, "y": 4, "z": 1, "color": "#B22222"},
  {"x": 1, "y": 4, "z": 1, "color": "#B22222"},

  {"x": 0, "y": 5, "z": 0, "color": "#8B0000"},
];

// 预设模型：熊猫 (~600体素)
function createPanda(): Voxel[] {
  const voxels: Voxel[] = [];

  const white = '#FFFFFF';
  const black = '#000000';
  const darkGray = '#1A1A1A';
  const pink = '#FFB6C1';

  // === 身体 (y=0-4) - 白色，圆润 ===
  for (let y = 0; y <= 4; y++) {
    for (let x = -3; x <= 3; x++) {
      for (let z = -2; z <= 2; z++) {
        const dist = Math.sqrt(x*x/1.5 + z*z);
        if (dist <= 3.5) {
          voxels.push({ x, y, z, color: white });
        }
      }
    }
  }

  // === 头部 (y=5-8) - 白色圆形 ===
  for (let y = 5; y <= 8; y++) {
    for (let x = -3; x <= 3; x++) {
      for (let z = -2; z <= 2; z++) {
        const dist = Math.sqrt(x*x + z*z);
        const radius = y === 5 ? 3.2 : y === 6 ? 3.5 : y === 7 ? 3.2 : 2.5;
        if (dist <= radius) {
          voxels.push({ x, y, z, color: white });
        }
      }
    }
  }

  // === 黑色耳朵 (y=8-10) ===
  // 左耳
  for (let y = 8; y <= 10; y++) {
    for (let x = -3; x <= -2; x++) {
      for (let z = -2; z <= -1; z++) {
        voxels.push({ x, y, z, color: black });
      }
    }
  }
  // 右耳
  for (let y = 8; y <= 10; y++) {
    for (let x = 2; x <= 3; x++) {
      for (let z = -2; z <= -1; z++) {
        voxels.push({ x, y, z, color: black });
      }
    }
  }

  // === 黑色眼圈 (y=6-7) ===
  // 左眼圈
  for (let x = -3; x <= -1; x++) {
    for (let y = 6; y <= 7; y++) {
      voxels.push({ x, y, z: 2, color: black });
      voxels.push({ x, y, z: 3, color: black });
    }
  }
  // 右眼圈
  for (let x = 1; x <= 3; x++) {
    for (let y = 6; y <= 7; y++) {
      voxels.push({ x, y, z: 2, color: black });
      voxels.push({ x, y, z: 3, color: black });
    }
  }

  // === 黑色眼睛 ===
  voxels.push({ x: -2, y: 7, z: 3, color: darkGray });
  voxels.push({ x: 2, y: 7, z: 3, color: darkGray });

  // === 鼻子和嘴巴 ===
  voxels.push({ x: 0, y: 6, z: 3, color: black });
  voxels.push({ x: -1, y: 5, z: 3, color: black });
  voxels.push({ x: 0, y: 5, z: 3, color: black });
  voxels.push({ x: 1, y: 5, z: 3, color: black });

  // === 黑色前臂 (y=2-4) ===
  // 左臂
  for (let y = 2; y <= 4; y++) {
    for (let x = -4; x <= -3; x++) {
      for (let z = -1; z <= 1; z++) {
        voxels.push({ x, y, z, color: black });
      }
    }
  }
  // 右臂
  for (let y = 2; y <= 4; y++) {
    for (let x = 3; x <= 4; x++) {
      for (let z = -1; z <= 1; z++) {
        voxels.push({ x, y, z, color: black });
      }
    }
  }

  // === 黑色腿 (y=0-2) ===
  // 左腿
  for (let y = 0; y <= 2; y++) {
    for (let x = -3; x <= -2; x++) {
      for (let z = 2; z <= 3; z++) {
        voxels.push({ x, y, z, color: black });
      }
    }
  }
  // 右腿
  for (let y = 0; y <= 2; y++) {
    for (let x = 2; x <= 3; x++) {
      for (let z = 2; z <= 3; z++) {
        voxels.push({ x, y, z, color: black });
      }
    }
  }

  return voxels;
}

// 预设模型：兔子 (~550体素)
function createRabbit(): Voxel[] {
  const voxels: Voxel[] = [];

  const white = '#FAFAFA';
  const lightGray = '#E5E5E5';
  const pink = '#FFB6C1';
  const darkPink = '#FF69B4';
  const black = '#000000';

  // === 身体 (y=0-3) ===
  for (let y = 0; y <= 3; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const dist = Math.sqrt(x*x + z*z);
        if (dist <= 2.5) {
          voxels.push({ x, y, z, color: white });
        }
      }
    }
  }

  // === 头部 (y=4-7) ===
  for (let y = 4; y <= 7; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const dist = Math.sqrt(x*x + z*z);
        const radius = y === 4 ? 2.8 : y === 5 ? 3.0 : y === 6 ? 2.8 : 2.2;
        if (dist <= radius) {
          voxels.push({ x, y, z, color: white });
        }
      }
    }
  }

  // === 长耳朵 (y=7-13) ===
  // 左耳
  for (let y = 7; y <= 13; y++) {
    for (let x = -2; x <= -1; x++) {
      for (let z = -2; z <= -1; z++) {
        voxels.push({ x, y, z, color: white });
        // 耳朵内部粉色
        if (z === -1 && x === -1 && y >= 8 && y <= 12) {
          voxels.push({ x, y, z, color: pink });
        }
      }
    }
  }
  // 右耳
  for (let y = 7; y <= 13; y++) {
    for (let x = 1; x <= 2; x++) {
      for (let z = -2; z <= -1; z++) {
        voxels.push({ x, y, z, color: white });
        // 耳朵内部粉色
        if (z === -1 && x === 1 && y >= 8 && y <= 12) {
          voxels.push({ x, y, z, color: pink });
        }
      }
    }
  }

  // === 眼睛 (y=6) ===
  voxels.push({ x: -2, y: 6, z: 2, color: black });
  voxels.push({ x: -2, y: 7, z: 2, color: black });
  voxels.push({ x: 2, y: 6, z: 2, color: black });
  voxels.push({ x: 2, y: 7, z: 2, color: black });

  // === 鼻子 (y=5) ===
  voxels.push({ x: 0, y: 5, z: 3, color: darkPink });
  voxels.push({ x: -1, y: 5, z: 3, color: pink });
  voxels.push({ x: 1, y: 5, z: 3, color: pink });

  // === 嘴巴 (y=4) ===
  voxels.push({ x: 0, y: 4, z: 3, color: black });
  voxels.push({ x: -1, y: 4, z: 2, color: black });
  voxels.push({ x: 1, y: 4, z: 2, color: black });

  // === 前腿 (y=0-2) ===
  // 左前腿
  for (let y = 0; y <= 2; y++) {
    for (let x = -2; x <= -1; x++) {
      voxels.push({ x, y, z: 2, color: white });
    }
  }
  // 右前腿
  for (let y = 0; y <= 2; y++) {
    for (let x = 1; x <= 2; x++) {
      voxels.push({ x, y, z: 2, color: white });
    }
  }

  // === 后腿（大） (y=0-2) ===
  // 左后腿
  for (let y = 0; y <= 2; y++) {
    for (let x = -3; x <= -2; x++) {
      for (let z = -2; z <= -1; z++) {
        voxels.push({ x, y, z, color: lightGray });
      }
    }
  }
  // 右后腿
  for (let y = 0; y <= 2; y++) {
    for (let x = 2; x <= 3; x++) {
      for (let z = -2; z <= -1; z++) {
        voxels.push({ x, y, z, color: lightGray });
      }
    }
  }

  // === 尾巴（小圆球） (y=1-2) ===
  for (let x = -1; x <= 1; x++) {
    for (let z = -3; z <= -2; z++) {
      voxels.push({ x, y: 1, z, color: white });
      voxels.push({ x, y: 2, z, color: white });
    }
  }

  return voxels;
}

// 预设模型：狐狸 (~600体素)
function createFox(): Voxel[] {
  const voxels: Voxel[] = [];

  const orange = '#FF8C42';
  const darkOrange = '#E67E22';
  const white = '#FFFFFF';
  const black = '#000000';
  const darkBrown = '#654321';

  // === 身体 (y=0-4) - 橙色 ===
  for (let y = 0; y <= 4; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -3; z <= 1; z++) {
        const dist = Math.sqrt(x*x/1.2 + z*z);
        if (dist <= 3.0) {
          voxels.push({ x, y, z, color: orange });
        }
      }
    }
  }

  // 身体腹部白色
  for (let y = 1; y <= 3; y++) {
    for (let x = -1; x <= 1; x++) {
      voxels.push({ x, y, z: 0, color: white });
      voxels.push({ x, y, z: 1, color: white });
    }
  }

  // === 头部 (y=5-8) - 橙色尖头 ===
  for (let y = 5; y <= 8; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -1; z <= 2; z++) {
        const dist = Math.sqrt(x*x + (z-0.5)*(z-0.5));
        const radius = y === 5 ? 2.8 : y === 6 ? 3.0 : y === 7 ? 2.5 : 2.0;
        if (dist <= radius) {
          voxels.push({ x, y, z, color: orange });
        }
      }
    }
  }

  // 脸部白色区域
  for (let y = 5; y <= 7; y++) {
    for (let x = -1; x <= 1; x++) {
      voxels.push({ x, y, z: 2, color: white });
    }
  }

  // === 尖耳朵 (y=8-11) ===
  // 左耳
  for (let y = 8; y <= 11; y++) {
    const size = 12 - y;
    for (let x = -3; x <= -2; x++) {
      for (let z = -1; z <= -1 + size; z++) {
        voxels.push({ x, y, z, color: orange });
        // 耳朵内部白色
        if (x === -2 && z === 0 && y <= 10) {
          voxels.push({ x, y, z, color: white });
        }
      }
    }
  }
  // 右耳
  for (let y = 8; y <= 11; y++) {
    const size = 12 - y;
    for (let x = 2; x <= 3; x++) {
      for (let z = -1; z <= -1 + size; z++) {
        voxels.push({ x, y, z, color: orange });
        // 耳朵内部白色
        if (x === 2 && z === 0 && y <= 10) {
          voxels.push({ x, y, z, color: white });
        }
      }
    }
  }
  // 耳尖黑色
  voxels.push({ x: -3, y: 11, z: -1, color: black });
  voxels.push({ x: 3, y: 11, z: -1, color: black });

  // === 眼睛 (y=7) ===
  voxels.push({ x: -2, y: 7, z: 2, color: black });
  voxels.push({ x: 2, y: 7, z: 2, color: black });
  voxels.push({ x: -2, y: 7, z: 3, color: black });
  voxels.push({ x: 2, y: 7, z: 3, color: black });

  // === 鼻子和嘴巴 ===
  voxels.push({ x: 0, y: 6, z: 3, color: black });
  voxels.push({ x: 0, y: 5, z: 3, color: black });

  // === 前腿 (y=0-3) ===
  // 左前腿
  for (let y = 0; y <= 3; y++) {
    for (let x = -2; x <= -1; x++) {
      voxels.push({ x, y, z: 1, color: darkOrange });
      // 脚掌黑色
      if (y === 0) {
        voxels.push({ x, y, z: 1, color: black });
      }
    }
  }
  // 右前腿
  for (let y = 0; y <= 3; y++) {
    for (let x = 1; x <= 2; x++) {
      voxels.push({ x, y, z: 1, color: darkOrange });
      // 脚掌黑色
      if (y === 0) {
        voxels.push({ x, y, z: 1, color: black });
      }
    }
  }

  // === 后腿 (y=0-2) ===
  // 左后腿
  for (let y = 0; y <= 2; y++) {
    for (let x = -2; x <= -1; x++) {
      for (let z = -2; z <= -1; z++) {
        voxels.push({ x, y, z, color: darkOrange });
        if (y === 0) {
          voxels.push({ x, y, z, color: black });
        }
      }
    }
  }
  // 右后腿
  for (let y = 0; y <= 2; y++) {
    for (let x = 1; x <= 2; x++) {
      for (let z = -2; z <= -1; z++) {
        voxels.push({ x, y, z, color: darkOrange });
        if (y === 0) {
          voxels.push({ x, y, z, color: black });
        }
      }
    }
  }

  // === 蓬松尾巴 (y=1-5) ===
  for (let y = 1; y <= 5; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -4; z <= -3; z++) {
        const dist = Math.sqrt(x*x + (z+3.5)*(z+3.5));
        if (dist <= 2.5 + (5-y)*0.3) {
          voxels.push({ x, y, z, color: orange });
        }
      }
    }
  }
  // 尾巴尖端白色
  for (let y = 4; y <= 5; y++) {
    for (let x = -1; x <= 1; x++) {
      voxels.push({ x, y, z: -4, color: white });
    }
  }

  return voxels;
}

// 预设模型：迪士尼城堡 (~700体素)
function createDisneyCastle(): Voxel[] {
  const voxels: Voxel[] = [];

  const stoneGray = '#A0A0A0';
  const darkGray = '#707070';
  const blue = '#4169E1';
  const darkBlue = '#2B4C8C';
  const gold = '#FFD700';
  const red = '#DC143C';
  const white = '#F0F0F0';

  // === 主塔基座 (y=0-3) ===
  for (let y = 0; y <= 3; y++) {
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        if (Math.abs(x) === 3 || Math.abs(z) === 3) {
          voxels.push({ x, y, z, color: stoneGray });
        }
      }
    }
  }

  // === 主塔墙体 (y=4-12) ===
  for (let y = 4; y <= 12; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.abs(x) === 2 || Math.abs(z) === 2) {
          voxels.push({ x, y, z, color: y % 2 === 0 ? stoneGray : white });
        }
      }
    }
  }

  // 主塔窗户
  for (let y = 6; y <= 10; y += 2) {
    voxels.push({ x: 0, y, z: 2, color: darkBlue });
    voxels.push({ x: 2, y, z: 0, color: darkBlue });
    voxels.push({ x: -2, y, z: 0, color: darkBlue });
  }

  // === 主塔屋顶 (y=13-16) - 蓝色锥形 ===
  for (let y = 13; y <= 16; y++) {
    const size = 17 - y;
    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        const dist = Math.sqrt(x*x + z*z);
        if (dist <= size) {
          voxels.push({ x, y, z, color: blue });
        }
      }
    }
  }
  // 屋顶尖端金色
  voxels.push({ x: 0, y: 17, z: 0, color: gold });
  voxels.push({ x: 0, y: 18, z: 0, color: gold });

  // === 左侧塔 (y=0-8) ===
  for (let y = 0; y <= 8; y++) {
    for (let x = -6; x <= -4; x++) {
      for (let z = -2; z <= 0; z++) {
        if (x === -6 || x === -4 || z === -2 || z === 0) {
          voxels.push({ x, y, z, color: darkGray });
        }
      }
    }
  }
  // 左塔屋顶
  for (let y = 9; y <= 11; y++) {
    const size = 12 - y;
    for (let x = -5 - size; x <= -5 + size; x++) {
      for (let z = -1 - size; z <= -1 + size; z++) {
        voxels.push({ x, y, z, color: red });
      }
    }
  }
  voxels.push({ x: -5, y: 12, z: -1, color: gold });

  // === 右侧塔 (y=0-8) ===
  for (let y = 0; y <= 8; y++) {
    for (let x = 4; x <= 6; x++) {
      for (let z = -2; z <= 0; z++) {
        if (x === 6 || x === 4 || z === -2 || z === 0) {
          voxels.push({ x, y, z, color: darkGray });
        }
      }
    }
  }
  // 右塔屋顶
  for (let y = 9; y <= 11; y++) {
    const size = 12 - y;
    for (let x = 5 - size; x <= 5 + size; x++) {
      for (let z = -1 - size; z <= -1 + size; z++) {
        voxels.push({ x, y, z, color: red });
      }
    }
  }
  voxels.push({ x: 5, y: 12, z: -1, color: gold });

  // === 前方小塔 (左) (y=0-6) ===
  for (let y = 0; y <= 6; y++) {
    for (let x = -5; x <= -4; x++) {
      for (let z = 2; z <= 3; z++) {
        if (x === -5 || x === -4 || z === 2 || z === 3) {
          voxels.push({ x, y, z, color: white });
        }
      }
    }
  }
  // 前左塔屋顶
  for (let y = 7; y <= 9; y++) {
    const size = 10 - y;
    voxels.push({ x: -4.5, y, z: 2.5, color: blue });
    for (let dx = -size; dx <= size; dx++) {
      for (let dz = -size; dz <= size; dz++) {
        voxels.push({ x: -4 + dx, y, z: 2 + dz, color: blue });
      }
    }
  }

  // === 前方小塔 (右) (y=0-6) ===
  for (let y = 0; y <= 6; y++) {
    for (let x = 4; x <= 5; x++) {
      for (let z = 2; z <= 3; z++) {
        if (x === 5 || x === 4 || z === 2 || z === 3) {
          voxels.push({ x, y, z, color: white });
        }
      }
    }
  }
  // 前右塔屋顶
  for (let y = 7; y <= 9; y++) {
    const size = 10 - y;
    for (let dx = -size; dx <= size; dx++) {
      for (let dz = -size; dz <= size; dz++) {
        voxels.push({ x: 4 + dx, y, z: 2 + dz, color: blue });
      }
    }
  }

  // === 大门 (y=1-3) ===
  for (let y = 1; y <= 3; y++) {
    voxels.push({ x: -1, y, z: 3, color: darkGray });
    voxels.push({ x: 0, y, z: 3, color: '#8B4513' });
    voxels.push({ x: 1, y, z: 3, color: darkGray });
  }
  voxels.push({ x: 0, y: 4, z: 3, color: darkGray });

  // === 连接墙 (y=1-4) ===
  for (let y = 1; y <= 4; y++) {
    for (let x = -4; x <= -3; x++) {
      voxels.push({ x, y, z: 3, color: stoneGray });
    }
    for (let x = 3; x <= 4; x++) {
      voxels.push({ x, y, z: 3, color: stoneGray });
    }
  }

  return voxels;
}

export const presetPanda = createPanda();
export const presetRabbit = createRabbit();
export const presetFox = createFox();
export const presetDisneyCastle = createDisneyCastle();

// 预设模型：理想同学 - 从外部JSON加载（新版本）
export const presetLiTongxue: Voxel[] = [];

// 预设模型：MEGA - 从外部JSON加载
export const presetMega: Voxel[] = [];

export const presets = [
  { name: '理想同学', translationKey: 'preset.liTongxue', data: presetLiTongxue, loadFrom: '/litongxue.json' },
  { name: '理想 L9', translationKey: 'preset.liL9', data: presetLiL9, loadFrom: '/li-l9.json' },
  { name: '🚗 Mega', translationKey: 'preset.mega', data: presetMega, loadFrom: '/mega.json' },
  { name: '🐼 熊猫', translationKey: 'preset.panda', data: presetPanda },
  { name: '🐰 兔子', translationKey: 'preset.rabbit', data: presetRabbit },
  { name: '🦊 狐狸', translationKey: 'preset.fox', data: presetFox },
  { name: '🏰 城堡', translationKey: 'preset.castle', data: presetDisneyCastle },
  { name: '🦅 老鹰', translationKey: 'preset.eagle', data: presetEagle },
];
