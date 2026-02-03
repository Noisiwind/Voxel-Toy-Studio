import { GoogleGenerativeAI } from '@google/generative-ai';
import { Voxel } from '../types';
import { GenerationSettings } from '../components/PromptModal';

function buildSystemPrompt(settings: GenerationSettings): string {
  const { style, colorStyle } = settings;

  // 固定体素数量 - 降低到200避免JSON被截断
  const voxelCount = 200;

  const styleGuides = {
    simple: 'Keep shapes basic but clearly recognizable with proper proportions',
    standard: 'Create balanced details with clear, recognizable features and good proportions',
    detailed: 'Add rich details, textures, fine features, and realistic proportions',
  };

  const colorGuides = {
    vibrant: 'Use bright, saturated, vivid colors like #ff5733, #33ff57, #3357ff',
    pastel: 'Use soft, muted pastel colors like #ffb3ba, #bae1ff, #ffffba',
    monochrome: 'Use grayscale or single-hue colors like #333333, #666666, #999999',
  };

  // 对于大体素数量，使用压缩格式
  if (voxelCount > 500) {
    return `You are a 3D Voxel Artist with excellent spatial awareness. Use COMPRESSED FORMAT to create RECOGNIZABLE models efficiently using a LAYERED CONSTRUCTION approach.

COMPRESSED FORMAT - Use geometric shapes:
{
  "shapes": [
    {"type": "box", "from": [x1,y1,z1], "to": [x2,y2,z2], "c": "#hex"},
    {"type": "sphere", "center": [x,y,z], "radius": r, "c": "#hex"},
    {"type": "cylinder", "from": [x1,y1,z1], "to": [x2,y2,z2], "radius": r, "c": "#hex"},
    {"type": "voxels", "positions": [[x,y,z], ...], "c": "#hex"}
  ]
}

🎯 CONSTRUCTION METHOD (THINK LIKE A SCULPTOR):
Build layer by layer, using appropriate shapes for each part:

Step 1: FOUNDATION (Y=0-2)
- Use cylinders for legs/feet
- Use boxes for stable bases
- Position symmetrically (mirror left/right)

Step 2: MAIN BODY (Y=3-6)
- Use box or sphere for torso
- Choose shape based on the object (sphere = round animals, box = buildings)
- Make it wider/larger than the head

Step 3: HEAD (Y=7-10)
- Use sphere for round heads (animals)
- Use box for blocky heads (robots, buildings)
- Size: 1/4 to 1/3 of total height for animals

Step 4: FEATURES (use "voxels" type)
- Eyes: 2-4 individual voxels per eye
- Nose: 1-3 voxels
- Ears: small boxes or voxel clusters
- Mouth: line of voxels

Step 5: APPENDAGES
- Arms/wings: cylinders extending from body
- Tail: cylinder or series of boxes
- Decorations: small boxes or voxel arrays

🔢 VOXEL COUNT CALCULATIONS (CRITICAL):
- box from [0,0,0] to [9,9,9] = 10×10×10 = 1000 voxels
- sphere with radius 3 = ~113 voxels
- sphere with radius 4 = ~268 voxels
- sphere with radius 5 = ~523 voxels
- cylinder from [0,0,0] to [0,10,0] radius 2 = ~126 voxels
- cylinder from [0,0,0] to [0,10,0] radius 3 = ~283 voxels

TARGET: ${voxelCount} voxels (±10%)
⚠️ CALCULATE CAREFULLY - Add up all shape volumes before finalizing!

🎨 DESIGN PRINCIPLES:
1. USE RIGHT SHAPES - sphere for heads, cylinder for limbs, box for bodies
2. HOLLOW vs SOLID - Large parts can be hollow (saves voxels), small parts should be solid
3. PROPORTIONS MATTER - Head:Body ratio should be realistic
4. SYMMETRY - Left/right features should mirror (use same coordinates with opposite X)
5. LAYER DETAILS - Use voxels array ONLY for fine details (eyes, nose)
6. COLOR ZONES - Different body parts can have different colors

💡 HOLLOW vs SOLID STRATEGY:
- Box/Cylinder shapes in compressed format are ALWAYS SOLID (filled completely)
- To create hollow effect: use SMALLER shapes or use voxels array for surfaces only
- For large buildings/structures: use multiple thin boxes for walls instead of one large solid box
- For animals: solid shapes work well since body parts are relatively small

📐 DETAILED EXAMPLE: Panda (~${voxelCount} voxels)

{
  "shapes": [
    // STEP 1: Legs (4 cylinders, Y=0-2)
    {"type": "cylinder", "from": [-2,0,2], "to": [-2,2,2], "radius": 1, "c": "#000000"},
    {"type": "cylinder", "from": [2,0,2], "to": [2,2,2], "radius": 1, "c": "#000000"},
    {"type": "cylinder", "from": [-2,0,-2], "to": [-2,2,-2], "radius": 1, "c": "#000000"},
    {"type": "cylinder", "from": [2,0,-2], "to": [2,2,-2], "radius": 1, "c": "#000000"},

    // STEP 2: Body (box, Y=2-6, white)
    {"type": "box", "from": [-3,2,-2], "to": [3,6,2], "c": "#FFFFFF"},

    // STEP 3: Head (sphere, Y=7-9, white)
    {"type": "sphere", "center": [0,7,0], "radius": 3, "c": "#FFFFFF"},

    // STEP 4: Arms (cylinders extending from body)
    {"type": "cylinder", "from": [-4,3,0], "to": [-3,5,0], "radius": 1, "c": "#000000"},
    {"type": "cylinder", "from": [3,3,0], "to": [4,5,0], "radius": 1, "c": "#000000"},

    // STEP 5: Ears (small boxes on head top)
    {"type": "box", "from": [-2,9,-1], "to": [-1,10,0], "c": "#000000"},
    {"type": "box", "from": [1,9,-1], "to": [2,10,0], "c": "#000000"},

    // STEP 6: Facial features (voxels for precision)
    {"type": "voxels", "positions": [[-2,8,3],[-2,7,3],[-1,7,3]], "c": "#000000"},  // Left eye patch
    {"type": "voxels", "positions": [[2,8,3],[2,7,3],[1,7,3]], "c": "#000000"},     // Right eye patch
    {"type": "voxels", "positions": [[-2,7,3]], "c": "#1A1A1A"},  // Left eye
    {"type": "voxels", "positions": [[2,7,3]], "c": "#1A1A1A"},   // Right eye
    {"type": "voxels", "positions": [[0,6,3],[0,5,3]], "c": "#000000"}  // Nose
  ]
}

Rules:
1. Style: ${styleGuides[style]}
2. Colors: ${colorGuides[colorStyle]}
3. Y-axis points up
4. Center at origin (0,0,0)
5. Calculate total voxels = sum of all shapes
6. Use shapes for main volumes, voxels for details

CRITICAL: Think geometrically! Use spheres for round parts, cylinders for limbs, boxes for bodies!`;
  }

  // 小体素数量，使用原始格式
  return `# ROLE (角色)
你是一位世界级的体素艺术家（Voxel Master），风格融合了《乐高》(LEGO)、《天天过马路》(Crossy Road) 和《我的世界》(Minecraft)。你不仅在做 3D 建模，更是在进行"空间艺术创作"。

# ART STYLE (艺术风格)
1. **玩具化审美 (Toy-like Aesthetic)**：模型必须看起来像真实的塑料积木或收藏级潮流玩具
2. **块状化处理 (Chunky Heuristic)** ⭐ 核心秘诀！
   - 避免使用 1x1 的单体素结构（除了眼睛、胡须等极小细节）
   - 主要身体部分、结构支撑应使用 2x2 或 3x3 的组合
   - 增加"厚重感"和"体量感"，让模型更有存在感
3. **色彩方案 (Vibrant Palette)**：使用饱和度高、对比鲜明的色彩
   - ${colorGuides[colorStyle]}
   - 颜色要具有标志性，能让人一眼识别各个部位

# SPATIAL LOGIC (空间逻辑)
- **坐标对齐**：所有坐标 (x, y, z) 必须是整数
- **中心定位**：物体中心（脚下或底座）必须位于 (x=0, z=0)
- **地面锚定**：最底部坐标必须恰好在 y=0 处
- **密度控制**：方块总数约 ${voxelCount} 个（必须完整，不能缺失部分）

# CONSTRUCTION METHOD (构建方法)
⚠️ 重要：必须构建完整模型！按优先级从高到低：
1. 腿/底座 → 2. 身体 → 3. 头部 → 4. 五官 → 5. 耳朵/尾巴

使用"块状化"思维，从底部到顶部分层构建：

Step 1: FOUNDATION (Y=0-2) - 地基 【必须】
- 4条腿，每条腿用 2x2 的块（4个体素×2层）
- 避免细棍状的腿，要有厚度感

Step 2: MAIN BODY (Y=2-5) - 身体主体 【必须】
- 用 4×3×3 的块状身体（约36个体素）
- 不要空心，要有体积感
- 身体应该比头部更大更宽

Step 3: HEAD (Y=6-8) - 头部 【必须】
- 头部用 3×3×3 的块（约27个体素）
- 头部占总高度的 1/4 到 1/3

Step 4: FACIAL FEATURES - 五官 【必须】
- 眼睛：2个体素（左右各1个）
- 鼻子：1-2个体素
- 嘴巴：可选

Step 5: EARS/TAIL - 耳朵和尾巴 【可选，如果体素够用】
- 耳朵：左右各2-4个体素
- 尾巴：5-8个体素

# VOXEL BUDGET (体素预算)
Target: ~${voxelCount} voxels
- Legs: 30-40 voxels (4 legs × 8 voxels each)
- Body: 40-50 voxels
- Head: 25-30 voxels
- Face: 5-10 voxels
- Ears/Tail: 30-40 voxels
= Total: ~${voxelCount} voxels

⚠️ 必须生成完整模型！如果接近字符限制，优先保证腿、身体、头部完整。

# DESIGN PRINCIPLES (设计原则)
1. **块状优先 (Chunky First)**：时刻记住用 2x2/3x3，不要用 1x1
2. **对称美感 (Symmetry)**：左右对称让模型更平衡
3. **比例协调 (Proportions)**：头、身体、四肢比例要合理
4. **识别度高 (Recognizable)**：必须让人一眼看出是什么
5. **玩具感 (Toy-like)**：像真实的塑料玩具，有质感

# MULTIMODAL STRATEGY (图像分析策略)
如果用户提供图片：
1. **语义拆解**：识别最核心的特征（长耳朵、大眼睛等）
2. **几何简化**：想象只有 300 块积木如何构建
3. **深度映射**：2D轮廓延展到3D，确保侧面和背面也合理

# OUTPUT FORMAT (输出格式)
⚠️ CRITICAL - 只返回JSON，不要有任何解释文字！
⚠️ CRITICAL - 必须生成完整模型（腿+身体+头部+五官），不能只生成一部分！

返回纯JSON数组（直接返回，不要用代码块包装）：
[{"x": number, "y": number, "z": number, "c": "#hex"}, ...]

Target: ~${voxelCount} voxels (控制在200以内避免截断)
Style: ${styleGuides[style]}

# EXAMPLE: Chunky Panda (块状熊猫)
错误❌：用单体素画腿 → 看起来像火柴棍
正确✅：
- 每条腿用 2x2 的圆柱（4个体素×3层 = 12个体素/腿）
- 身体用 5x4x4 的块（80个体素）
- 头部用 4x4x4 的块（64个体素）
- 眼圈用 2x2 的黑色块（不是单线条）
- 耳朵用 2x2 的块

记住：CHUNKY IS BETTER! 成块的体素比散点更好看！`;
}

// 解压缩格式：将shape描述转换为实际体素
function expandCompressedFormat(compressedData: any): Voxel[] {
  const voxels: Voxel[] = [];

  if (!compressedData.shapes || !Array.isArray(compressedData.shapes)) {
    throw new Error('Invalid compressed format: missing shapes array');
  }

  for (const shape of compressedData.shapes) {
    const color = shape.c;

    switch (shape.type) {
      case 'box':
        // 生成立方体内所有体素
        const [x1, y1, z1] = shape.from;
        const [x2, y2, z2] = shape.to;
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) {
              voxels.push({ x, y, z, c: color });
            }
          }
        }
        break;

      case 'sphere':
        // 生成球体内所有体素
        const [cx, cy, cz] = shape.center;
        const radius = shape.radius;
        for (let x = cx - radius; x <= cx + radius; x++) {
          for (let y = cy - radius; y <= cy + radius; y++) {
            for (let z = cz - radius; z <= cz + radius; z++) {
              const dist = Math.sqrt((x-cx)**2 + (y-cy)**2 + (z-cz)**2);
              if (dist <= radius) {
                voxels.push({ x, y, z, c: color });
              }
            }
          }
        }
        break;

      case 'cylinder':
        // 生成圆柱体内所有体素
        const [fx, fy, fz] = shape.from;
        const [tx, ty, tz] = shape.to;
        const cylRadius = shape.radius;

        // 简化：假设圆柱沿Y轴
        const minY = Math.min(fy, ty);
        const maxY = Math.max(fy, ty);
        const centerX = (fx + tx) / 2;
        const centerZ = (fz + tz) / 2;

        for (let y = minY; y <= maxY; y++) {
          for (let x = centerX - cylRadius; x <= centerX + cylRadius; x++) {
            for (let z = centerZ - cylRadius; z <= centerZ + cylRadius; z++) {
              const dist = Math.sqrt((x-centerX)**2 + (z-centerZ)**2);
              if (dist <= cylRadius) {
                voxels.push({ x: Math.round(x), y, z: Math.round(z), c: color });
              }
            }
          }
        }
        break;

      case 'voxels':
        // 直接添加体素列表
        if (shape.positions && Array.isArray(shape.positions)) {
          for (const [x, y, z] of shape.positions) {
            voxels.push({ x, y, z, c: color });
          }
        }
        break;

      default:
        console.warn(`Unknown shape type: ${shape.type}`);
    }
  }

  return voxels;
}

// Gemini API 调用
async function callGeminiAPI(apiKey: string, prompt: string, systemPrompt: string, settings: GenerationSettings, imageBase64?: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const maxTokens = 8192;

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.9,
    },
  });

  let parts: any[];

  if (imageBase64) {
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    parts = [
      { text: systemPrompt },
      { text: `User request: ${prompt || 'Create a voxel model based on this image'}` },
      { inlineData: { mimeType, data: base64Data } },
    ];
  } else {
    parts = [{ text: systemPrompt }, { text: `User request: ${prompt}` }];
  }

  const result = await model.generateContent(parts);
  const response = await result.response;
  return response.text();
}

// 主生成函数 - 只使用 Gemini
export async function generateVoxelModel(
  apiKey: string,
  prompt: string,
  settings: GenerationSettings,
  imageBase64?: string
): Promise<Voxel[]> {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const systemPrompt = buildSystemPrompt(settings);
  const userPrompt = prompt || 'Create a voxel model';

  console.log('Calling Gemini API...');

  const aiResponse = await callGeminiAPI(apiKey, userPrompt, systemPrompt, settings, imageBase64);

  console.log('AI Response length:', aiResponse.length);
  console.log('AI Response preview (first 500 chars):', aiResponse.substring(0, 500));
  console.log('AI Response end (last 500 chars):', aiResponse.substring(Math.max(0, aiResponse.length - 500)));

  // 尝试提取 JSON - 更智能的匹配
  // 移除markdown代码块标记
  let cleanedResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');

  // 检查响应是否被截断（没有结束的]或}）
  const trimmedResponse = cleanedResponse.trim();
  const startsWithBracket = trimmedResponse.startsWith('[');
  const startsWithBrace = trimmedResponse.startsWith('{');
  const endsWithBracket = trimmedResponse.endsWith(']');
  const endsWithBrace = trimmedResponse.endsWith('}');

  // 如果响应被截断，尝试修复
  if (startsWithBracket && !endsWithBracket) {
    console.warn('Response appears truncated (missing closing ]). Attempting to fix...');
    // 移除最后一个不完整的对象
    const lastCompleteObject = cleanedResponse.lastIndexOf('}');
    if (lastCompleteObject > 0) {
      cleanedResponse = cleanedResponse.substring(0, lastCompleteObject + 1) + ']';
      console.log('Fixed response by adding closing bracket');
    }
  } else if (startsWithBrace && !endsWithBrace) {
    console.warn('Response appears truncated (missing closing }). Cannot reliably fix.');
  }

  // 尝试多种方式匹配JSON
  let jsonMatch = null;

  // 方法1: 使用贪婪匹配提取完整的JSON数组
  if (startsWithBracket) {
    jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
  }

  // 方法2: 如果没找到数组，尝试匹配对象
  if (!jsonMatch && startsWithBrace) {
    jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
  }

  // 方法3: 使用括号计数精确提取（备用）
  if (!jsonMatch) {
    const startBracketIndex = cleanedResponse.indexOf('[');
    const startBraceIndex = cleanedResponse.indexOf('{');

    let startIndex = -1;
    let startChar = '';
    let endChar = '';

    if (startBracketIndex >= 0 && (startBraceIndex < 0 || startBracketIndex < startBraceIndex)) {
      startIndex = startBracketIndex;
      startChar = '[';
      endChar = ']';
    } else if (startBraceIndex >= 0) {
      startIndex = startBraceIndex;
      startChar = '{';
      endChar = '}';
    }

    if (startIndex >= 0) {
      let bracketCount = 0;
      let endIndex = -1;
      let inString = false;
      let escapeNext = false;

      for (let i = startIndex; i < cleanedResponse.length; i++) {
        const char = cleanedResponse[i];

        // 处理转义字符
        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        // 处理字符串
        if (char === '"') {
          inString = !inString;
          continue;
        }

        // 只在字符串外计数括号
        if (!inString) {
          if (char === startChar) bracketCount++;
          if (char === endChar) {
            bracketCount--;
            if (bracketCount === 0) {
              endIndex = i;
              break;
            }
          }
        }
      }

      if (endIndex > startIndex) {
        jsonMatch = [cleanedResponse.substring(startIndex, endIndex + 1)];
      }
    }
  }

  if (!jsonMatch) {
    console.error('Failed to find JSON in response. Full response:', aiResponse);
    console.error('Cleaned response:', cleanedResponse);
    throw new Error('AI没有返回有效的JSON格式。请检查API响应或稍后重试。');
  }

  let jsonString = jsonMatch[0];

  // 清理JSON字符串 - 移除末尾可能的注释或多余内容
  jsonString = jsonString.trim();

  console.log('Extracted JSON length:', jsonString.length);
  console.log('JSON first 200 chars:', jsonString.substring(0, 200));
  console.log('JSON last 200 chars:', jsonString.substring(Math.max(0, jsonString.length - 200)));

  // 检查JSON是否被截断
  const expectedEnd = jsonString.trim().startsWith('[') ? ']' : '}';
  if (!jsonString.trim().endsWith(expectedEnd)) {
    console.error('JSON appears to be truncated. Last 200 chars:', jsonString.substring(jsonString.length - 200));
    throw new Error('AI返回的数据不完整，请减少体素数量重试（建议500以下）');
  }

  let parsedData: any;
  try {
    parsedData = JSON.parse(jsonString);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Invalid JSON preview:', jsonString.substring(0, 1000));
    throw new Error(`JSON格式错误: ${parseError instanceof Error ? parseError.message : '未知错误'}`);
  }

  let voxels: Voxel[];

  // 详细日志：查看数据结构
  console.log('Parsed data type:', typeof parsedData);
  console.log('Is array:', Array.isArray(parsedData));
  if (Array.isArray(parsedData)) {
    console.log('Array length:', parsedData.length);
    if (parsedData.length > 0) {
      console.log('First element:', JSON.stringify(parsedData[0]));
      console.log('First element keys:', Object.keys(parsedData[0] || {}));
    }
  } else if (typeof parsedData === 'object') {
    console.log('Object keys:', Object.keys(parsedData));
    if (parsedData.shapes) {
      console.log('Has shapes, length:', parsedData.shapes.length);
    }
  }

  // 检测格式（更宽松的判断）
  if (parsedData.shapes && Array.isArray(parsedData.shapes)) {
    console.log('Detected COMPRESSED format (with shapes), expanding...');
    voxels = expandCompressedFormat(parsedData);
    console.log(`Expanded from ${parsedData.shapes.length} shapes to ${voxels.length} voxels`);
  } else if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0]?.type) {
    console.log('Detected COMPRESSED format (direct shapes), expanding...');
    voxels = expandCompressedFormat({ shapes: parsedData });
    console.log(`Expanded from ${parsedData.length} shapes to ${voxels.length} voxels`);
  } else if (Array.isArray(parsedData) && parsedData.length > 0) {
    // 检查第一个元素是否有x,y,z坐标
    const firstItem = parsedData[0];
    if (firstItem &&
        (typeof firstItem.x === 'number' || firstItem.x === 0) &&
        (typeof firstItem.y === 'number' || firstItem.y === 0) &&
        (typeof firstItem.z === 'number' || firstItem.z === 0)) {
      console.log('Detected DIRECT voxel array format');
      voxels = parsedData.map(v => ({
        x: v.x,
        y: v.y,
        z: v.z,
        c: v.c || '#ffffff'
      })) as Voxel[];
    } else {
      console.error('Unknown array format. First item:', firstItem);
      console.error('Full data sample (first 3 items):', JSON.stringify(parsedData.slice(0, 3)));
      throw new Error(`AI返回的数据格式错误。第一个元素应该包含x,y,z坐标，但实际收到: ${JSON.stringify(firstItem)}`);
    }
  } else if (parsedData.voxels && Array.isArray(parsedData.voxels)) {
    // 有些AI可能返回 {voxels: [...]} 格式
    console.log('Detected wrapped voxel format');
    voxels = parsedData.voxels.map((v: any) => ({
      x: v.x,
      y: v.y,
      z: v.z,
      c: v.c || '#ffffff'
    })) as Voxel[];
  } else {
    console.error('Unknown data format:', parsedData);
    console.error('Data type:', typeof parsedData);
    console.error('Data preview:', JSON.stringify(parsedData).substring(0, 500));

    // 生成详细的错误信息
    let detailMsg = `数据类型: ${typeof parsedData}`;
    if (Array.isArray(parsedData)) {
      detailMsg += `\n是数组，长度: ${parsedData.length}`;
      if (parsedData.length > 0) {
        detailMsg += `\n第一个元素: ${JSON.stringify(parsedData[0])}`;
      }
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      detailMsg += `\n对象的键: ${Object.keys(parsedData).join(', ')}`;
      detailMsg += `\n数据预览: ${JSON.stringify(parsedData).substring(0, 200)}`;
    }

    throw new Error(`AI返回了不支持的数据格式。\n\n调试信息：\n${detailMsg}\n\n请截图这个错误信息发给开发者。`);
  }

  // 验证数据
  if (!Array.isArray(voxels) || voxels.length === 0) {
    throw new Error('Invalid voxel data - array is empty');
  }

  console.log('Successfully parsed', voxels.length, 'voxels');

  // 检查体素数量
  const targetCount = settings.voxelCount;
  const actualCount = voxels.length;
  const ratio = actualCount / targetCount;

  if (ratio > 2.0) {
    console.warn(`Generated ${actualCount} voxels but target was ${targetCount} (${ratio.toFixed(1)}x over)`);
  }

  return voxels;
}
