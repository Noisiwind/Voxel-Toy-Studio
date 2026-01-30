import { GoogleGenerativeAI } from '@google/generative-ai';
import { Voxel } from '../types';
import { GenerationSettings } from '../components/PromptModal';

function buildSystemPrompt(settings: GenerationSettings): string {
  const { style, colorStyle } = settings;

  // 固定体素数量为最佳范围
  const voxelCount = 350;

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
    {"type": "box", "from": [x1,y1,z1], "to": [x2,y2,z2], "color": "#hex"},
    {"type": "sphere", "center": [x,y,z], "radius": r, "color": "#hex"},
    {"type": "cylinder", "from": [x1,y1,z1], "to": [x2,y2,z2], "radius": r, "color": "#hex"},
    {"type": "voxels", "positions": [[x,y,z], ...], "color": "#hex"}
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
    {"type": "cylinder", "from": [-2,0,2], "to": [-2,2,2], "radius": 1, "color": "#000000"},
    {"type": "cylinder", "from": [2,0,2], "to": [2,2,2], "radius": 1, "color": "#000000"},
    {"type": "cylinder", "from": [-2,0,-2], "to": [-2,2,-2], "radius": 1, "color": "#000000"},
    {"type": "cylinder", "from": [2,0,-2], "to": [2,2,-2], "radius": 1, "color": "#000000"},

    // STEP 2: Body (box, Y=2-6, white)
    {"type": "box", "from": [-3,2,-2], "to": [3,6,2], "color": "#FFFFFF"},

    // STEP 3: Head (sphere, Y=7-9, white)
    {"type": "sphere", "center": [0,7,0], "radius": 3, "color": "#FFFFFF"},

    // STEP 4: Arms (cylinders extending from body)
    {"type": "cylinder", "from": [-4,3,0], "to": [-3,5,0], "radius": 1, "color": "#000000"},
    {"type": "cylinder", "from": [3,3,0], "to": [4,5,0], "radius": 1, "color": "#000000"},

    // STEP 5: Ears (small boxes on head top)
    {"type": "box", "from": [-2,9,-1], "to": [-1,10,0], "color": "#000000"},
    {"type": "box", "from": [1,9,-1], "to": [2,10,0], "color": "#000000"},

    // STEP 6: Facial features (voxels for precision)
    {"type": "voxels", "positions": [[-2,8,3],[-2,7,3],[-1,7,3]], "color": "#000000"},  // Left eye patch
    {"type": "voxels", "positions": [[2,8,3],[2,7,3],[1,7,3]], "color": "#000000"},     // Right eye patch
    {"type": "voxels", "positions": [[-2,7,3]], "color": "#1A1A1A"},  // Left eye
    {"type": "voxels", "positions": [[2,7,3]], "color": "#1A1A1A"},   // Right eye
    {"type": "voxels", "positions": [[0,6,3],[0,5,3]], "color": "#000000"}  // Nose
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
- **密度控制**：方块总数保持在 300-400 个之间（性能与美感平衡）

# CONSTRUCTION METHOD (构建方法)
使用"块状化"思维，从底部到顶部分层构建：

Step 1: FOUNDATION (Y=0-2) - 地基
- 使用 2x2 或 3x3 的块状脚部/底座
- 避免细棍状的腿，要有厚度感

Step 2: MAIN BODY (Y=3-6) - 身体主体
- 用多个体素组成厚实的身体块
- 不要空心，要有体积感
- 身体应该比头部更大更宽

Step 3: HEAD (Y=7-10) - 头部
- 头部占总高度的 1/4 到 1/3
- 用 2x2 或 3x3 的块构建，不要单薄

Step 4: FEATURES - 特征细节
- 眼睛：可以用 1x1 的单体素（这是例外）
- 鼻子、嘴巴：用 2-3 个体素组成小块
- 耳朵、角：用 2x2 小块

Step 5: APPENDAGES - 附属物
- 手臂、尾巴：用成组的体素，不要单线条
- 装饰物：也要成块出现

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
返回纯JSON数组：
[{"x": number, "y": number, "z": number, "color": "#hex"}, ...]

Target: ~${voxelCount} voxels (300-400 range)
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
    const color = shape.color;

    switch (shape.type) {
      case 'box':
        // 生成立方体内所有体素
        const [x1, y1, z1] = shape.from;
        const [x2, y2, z2] = shape.to;
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) {
              voxels.push({ x, y, z, color });
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
                voxels.push({ x, y, z, color });
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
                voxels.push({ x: Math.round(x), y, z: Math.round(z), color });
              }
            }
          }
        }
        break;

      case 'voxels':
        // 直接添加体素列表
        if (shape.positions && Array.isArray(shape.positions)) {
          for (const [x, y, z] of shape.positions) {
            voxels.push({ x, y, z, color });
          }
        }
        break;

      default:
        console.warn(`Unknown shape type: ${shape.type}`);
    }
  }

  return voxels;
}

// DeepSeek调用 - 优化提示词
async function callDeepSeekAPI(apiKey: string, prompt: string, systemPrompt: string, settings: GenerationSettings): Promise<string> {
  console.log('[DeepSeek] Starting request...');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60秒超时

  // 为DeepSeek添加特殊指令，确保只返回JSON
  const enhancedSystemPrompt = `${systemPrompt}

⚠️ CRITICAL FOR DEEPSEEK:
- 直接返回JSON数组，不要有任何解释文字
- 不要说"好的"、"我来生成"等开场白
- 不要在JSON后面添加任何说明
- 只返回纯JSON，格式：[{"x":0,"y":0,"z":0,"color":"#fff"}]
- 如果想用压缩格式，返回：{"shapes":[...]}`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 8192,
        temperature: 0.7, // 降低温度，减少随意性
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      console.error('[DeepSeek] API error:', error);
      throw new Error(`DeepSeek API error: ${error}`);
    }

    const data = await response.json();
    console.log('[DeepSeek] Response received, length:', data.choices[0].message.content.length);
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[DeepSeek] Request timeout after 60 seconds');
      throw new Error('DeepSeek请求超时，请减少体素数量或稍后重试');
    }
    throw error;
  }
}

// OpenAI API调用
async function callOpenAIAPI(apiKey: string, prompt: string, systemPrompt: string, settings: GenerationSettings): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8192,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Claude API调用
async function callClaudeAPI(apiKey: string, prompt: string, systemPrompt: string, settings: GenerationSettings): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Gemini API调用
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

// 主生成函数 - 支持多个AI服务商
export async function generateVoxelModel(
  apiKey: string,
  prompt: string,
  settings: GenerationSettings,
  imageBase64?: string,
  provider: string = 'deepseek'
): Promise<Voxel[]> {
  if (!apiKey) {
    throw new Error(`${provider} API key is required`);
  }

  const systemPrompt = buildSystemPrompt(settings);
  const userPrompt = prompt || 'Create a voxel model';

  console.log(`Calling ${provider} API...`);

  let aiResponse: string;

  switch (provider) {
    case 'deepseek':
      // DeepSeek也支持图片，但暂时只用文本
      aiResponse = await callDeepSeekAPI(apiKey, userPrompt, systemPrompt, settings);
      break;
    case 'openai':
      aiResponse = await callOpenAIAPI(apiKey, userPrompt, systemPrompt, settings);
      break;
    case 'claude':
      aiResponse = await callClaudeAPI(apiKey, userPrompt, systemPrompt, settings);
      break;
    case 'gemini':
      aiResponse = await callGeminiAPI(apiKey, userPrompt, systemPrompt, settings, imageBase64);
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  console.log('AI Response length:', aiResponse.length);
  console.log('AI Response preview (first 500 chars):', aiResponse.substring(0, 500));
  console.log('AI Response end (last 500 chars):', aiResponse.substring(Math.max(0, aiResponse.length - 500)));

  // 尝试提取 JSON - 更智能的匹配
  // 移除markdown代码块标记
  let cleanedResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');

  // 尝试多种方式匹配JSON
  let jsonMatch = null;

  // 方法1: 匹配最长的JSON数组（从第一个[到最后一个]）
  jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);

  // 方法2: 如果没找到数组，尝试匹配对象（压缩格式）
  if (!jsonMatch) {
    jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
  }

  // 方法3: 如果还是没有，尝试找第一个[或{开始的内容
  if (!jsonMatch) {
    const startIndex = Math.max(
      cleanedResponse.indexOf('['),
      cleanedResponse.indexOf('{')
    );
    if (startIndex >= 0) {
      const possibleJson = cleanedResponse.substring(startIndex);
      // 尝试找到匹配的结束符
      let bracketCount = 0;
      let endIndex = -1;
      const startChar = possibleJson[0];
      const endChar = startChar === '[' ? ']' : '}';

      for (let i = 0; i < possibleJson.length; i++) {
        if (possibleJson[i] === startChar) bracketCount++;
        if (possibleJson[i] === endChar) bracketCount--;
        if (bracketCount === 0) {
          endIndex = i;
          break;
        }
      }

      if (endIndex > 0) {
        jsonMatch = [possibleJson.substring(0, endIndex + 1)];
      }
    }
  }

  if (!jsonMatch) {
    console.error('Failed to find JSON in response. Full response:', aiResponse);
    console.error('Cleaned response:', cleanedResponse);
    throw new Error('AI没有返回有效的JSON格式。DeepSeek可能返回了解释文字，请尝试使用其他AI服务（Claude、OpenAI或Gemini）。');
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

  // 检测格式
  if (parsedData.shapes && Array.isArray(parsedData.shapes)) {
    console.log('Detected COMPRESSED format (with shapes), expanding...');
    voxels = expandCompressedFormat(parsedData);
    console.log(`Expanded from ${parsedData.shapes.length} shapes to ${voxels.length} voxels`);
  } else if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].type) {
    console.log('Detected COMPRESSED format (direct shapes), expanding...');
    voxels = expandCompressedFormat({ shapes: parsedData });
    console.log(`Expanded from ${parsedData.length} shapes to ${voxels.length} voxels`);
  } else if (Array.isArray(parsedData) && parsedData.length > 0 && typeof parsedData[0].x === 'number') {
    console.log('Detected DIRECT voxel array format');
    voxels = parsedData as Voxel[];
  } else {
    console.error('Unknown data format:', parsedData);
    throw new Error('Unknown data format received');
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
