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

// 理想MEGA - 银灰色方正MPV（超详细版，根据参考图重制 ~900体素）
function createLiMega(): Voxel[] {
  const voxels: Voxel[] = [];

  // 精细色彩 - 根据参考图调整
  const bodyBase = '#787878';          // 银灰基础色
  const bodyColor = '#888888';         // 主体银灰
  const bodyLight = '#9A9A9A';         // 亮银灰
  const bodyDark = '#606060';          // 深银灰
  const bodyShadow = '#484848';        // 阴影
  const roofBlack = '#1A1A1A';         // 超大黑色车顶（全景天窗）
  const roofDark = '#0A0A0A';          // 车顶最暗部分
  const windowColor = '#252525';       // 深色车窗
  const windowDark = '#151515';        // 车窗最暗部分
  const wheelColor = '#0A0A0A';        // 黑色轮胎
  const wheelRim = '#404040';          // 深灰轮毂
  const lightColor = '#FFFFFF';        // 白色灯
  const grillColor = '#101010';        // 黑色格栅
  const megaText = '#E0E0E0';          // MEGA字样（浅色）

  // === 底盘和轮胎基础 (y=-1 到 y=0) ===
  for (let x = -9; x <= 9; x++) {
    for (let z = -4; z <= 4; z++) {
      if (Math.abs(z) <= 3) {
        voxels.push({ x, y: -1, z, color: bodyShadow });
        voxels.push({ x, y: 0, z, color: bodyDark });
      }
    }
  }

  // === 车轮 - 4个大轮子 ===
  // 前左轮 (x=-7附近, z=-4)
  for (let x = -8; x <= -6; x++) {
    for (let z = -5; z <= -4; z++) {
      for (let y = 0; y <= 2; y++) {
        if (z === -5 || y === 0) {
          voxels.push({ x, y, z, color: wheelColor });
        } else {
          voxels.push({ x, y, z, color: wheelRim });
        }
      }
    }
  }
  // 前右轮 (x=-7附近, z=4)
  for (let x = -8; x <= -6; x++) {
    for (let z = 4; z <= 5; z++) {
      for (let y = 0; y <= 2; y++) {
        if (z === 5 || y === 0) {
          voxels.push({ x, y, z, color: wheelColor });
        } else {
          voxels.push({ x, y, z, color: wheelRim });
        }
      }
    }
  }
  // 后左轮 (x=7附近, z=-4)
  for (let x = 6; x <= 8; x++) {
    for (let z = -5; z <= -4; z++) {
      for (let y = 0; y <= 2; y++) {
        if (z === -5 || y === 0) {
          voxels.push({ x, y, z, color: wheelColor });
        } else {
          voxels.push({ x, y, z, color: wheelRim });
        }
      }
    }
  }
  // 后右轮 (x=7附近, z=4)
  for (let x = 6; x <= 8; x++) {
    for (let z = 4; z <= 5; z++) {
      for (let y = 0; y <= 2; y++) {
        if (z === 5 || y === 0) {
          voxels.push({ x, y, z, color: wheelColor });
        } else {
          voxels.push({ x, y, z, color: wheelRim });
        }
      }
    }
  }

  // === 车身下部 (y=1-2) - 银灰色车体 ===
  for (let y = 1; y <= 2; y++) {
    for (let x = -9; x <= 9; x++) {
      for (let z = -3; z <= 3; z++) {
        if (Math.abs(z) === 3) {
          voxels.push({ x, y, z, color: bodyBase });
        } else {
          voxels.push({ x, y, z, color: y === 1 ? bodyDark : bodyColor });
        }
      }
    }
  }

  // === 车身中部 (y=3-5) - 主车体+侧窗 ===
  for (let y = 3; y <= 5; y++) {
    for (let x = -9; x <= 9; x++) {
      for (let z = -3; z <= 3; z++) {
        // 侧窗区域 (左右两侧，中段)
        if (Math.abs(z) === 3 && x >= -5 && x <= 7) {
          // 窗户玻璃
          if (y >= 4) {
            voxels.push({ x, y, z, color: windowColor });
          } else {
            voxels.push({ x, y, z, color: bodyColor });
          }
        }
        // A柱、B柱、C柱区域（深色）
        else if (Math.abs(z) === 3 && (x === -6 || x === -3 || x === 2 || x === 8)) {
          voxels.push({ x, y, z, color: roofBlack });
        }
        // 车门区域
        else if (Math.abs(z) === 3) {
          voxels.push({ x, y, z, color: bodyColor });
        }
        // 内部填充
        else {
          voxels.push({ x, y, z, color: bodyLight });
        }
      }
    }
  }

  // === 车顶 (y=6-8) - 标志性超大黑色车顶！===
  for (let y = 6; y <= 8; y++) {
    for (let x = -8; x <= 8; x++) {
      for (let z = -3; z <= 3; z++) {
        if (y === 6) {
          // 车顶边缘还是车身色
          if (Math.abs(z) === 3 || x === -8 || x === 8) {
            voxels.push({ x, y, z, color: bodyDark });
          } else {
            // 开始黑色车顶
            voxels.push({ x, y, z, color: roofBlack });
          }
        } else if (y === 7) {
          // 大面积黑色全景天窗
          if (x >= -7 && x <= 7 && Math.abs(z) <= 2) {
            voxels.push({ x, y, z, color: roofBlack });
          }
        } else if (y === 8) {
          // 车顶最高点，更暗
          if (x >= -6 && x <= 6 && Math.abs(z) <= 2) {
            voxels.push({ x, y, z, color: roofDark });
          }
        }
      }
    }
  }

  // === 前脸 (x=-10到-11) - MEGA特征前脸 ===
  // 前保险杠
  for (let z = -3; z <= 3; z++) {
    for (let y = 1; y <= 2; y++) {
      voxels.push({ x: -10, y, z, color: bodyShadow });
    }
  }

  // 前格栅区域 - 黑色格栅
  for (let z = -2; z <= 2; z++) {
    for (let y = 2; y <= 3; y++) {
      voxels.push({ x: -10, y, z, color: grillColor });
    }
  }

  // "MEGA"标识区域 - 在前格栅上
  for (let z = -1; z <= 1; z++) {
    voxels.push({ x: -10, y: 3, z, color: megaText });
  }

  // 前大灯（左右两侧）
  voxels.push({ x: -10, y: 3, z: -3, color: lightColor });
  voxels.push({ x: -10, y: 3, z: 3, color: lightColor });
  voxels.push({ x: -10, y: 2, z: -3, color: lightColor });
  voxels.push({ x: -10, y: 2, z: 3, color: lightColor });

  // 引擎盖
  for (let z = -2; z <= 2; z++) {
    for (let y = 4; y <= 5; y++) {
      voxels.push({ x: -10, y, z, color: bodyLight });
      voxels.push({ x: -9, y, z, color: bodyColor });
    }
  }

  // 前挡风玻璃
  for (let z = -2; z <= 2; z++) {
    for (let y = 6; y <= 7; y++) {
      voxels.push({ x: -9, y, z, color: windowColor });
      if (y === 7) {
        voxels.push({ x: -8, y, z, color: windowDark });
      }
    }
  }

  // === 后部 (x=10到11) ===
  // 后保险杠
  for (let z = -3; z <= 3; z++) {
    for (let y = 1; y <= 2; y++) {
      voxels.push({ x: 10, y, z, color: bodyShadow });
    }
  }

  // 后尾灯（贯穿式）
  for (let z = -3; z <= 3; z++) {
    for (let y = 3; y <= 4; y++) {
      if (Math.abs(z) >= 2) {
        voxels.push({ x: 10, y, z, color: '#CC2222' }); // 红色尾灯
      } else {
        voxels.push({ x: 10, y, z, color: '#882222' });
      }
    }
  }

  // 后车窗
  for (let z = -2; z <= 2; z++) {
    for (let y = 5; y <= 6; y++) {
      voxels.push({ x: 10, y, z, color: windowColor });
      voxels.push({ x: 9, y, z, color: windowDark });
    }
  }

  // === 车门把手 ===
  for (let x = -4; x <= 6; x += 5) {
    voxels.push({ x, y: 4, z: 4, color: bodyShadow });
    voxels.push({ x, y: 4, z: -4, color: bodyShadow });
  }

  // === 侧面腰线 ===
  for (let x = -8; x <= 8; x++) {
    voxels.push({ x, y: 3, z: 4, color: bodyDark });
    voxels.push({ x, y: 3, z: -4, color: bodyDark });
  }

  return voxels;
}

export const presetLiL9 = createLiL9();
export const presetLiMega = createLiMega();

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

export const presets = [
  { name: '理想 L9', data: presetLiL9 },
  { name: '理想 MEGA', data: presetLiMega },
  { name: '🐱 Cat', data: presetCat },
  { name: '🦅 Eagle', data: presetEagle },
  { name: '🏠 House', data: presetHouse },
];
