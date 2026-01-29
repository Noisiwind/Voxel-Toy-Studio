import { GoogleGenerativeAI } from '@google/generative-ai';
import { Voxel } from '../types';
import { GenerationSettings } from '../components/PromptModal';

function buildSystemPrompt(settings: GenerationSettings): string {
  const { voxelCount, style, colorStyle } = settings;

  const styleGuides = {
    simple: 'Keep shapes basic and geometric',
    standard: 'Create balanced details with recognizable features',
    detailed: 'Add rich details, textures, and fine features',
  };

  const colorGuides = {
    vibrant: 'Use bright, saturated, vivid colors like #ff5733, #33ff57, #3357ff',
    pastel: 'Use soft, muted pastel colors like #ffb3ba, #bae1ff, #ffffba',
    monochrome: 'Use grayscale or single-hue colors like #333333, #666666, #999999',
  };

  return `You are a 3D Voxel Artist with spatial awareness. Your task is to create voxel models based on user descriptions or images.

Rules:
1. Return ONLY valid JSON in this format: [{"x": number, "y": number, "z": number, "color": "hex"}]
2. Coordinates must be integers
3. Center the model around origin (0, 0, 0)
4. Create approximately ${voxelCount} voxels (±20%)
5. Style: ${styleGuides[style]}
6. Colors: ${colorGuides[colorStyle]}
7. Y-axis points up (positive Y = higher)
8. Create interesting 3D shapes with depth
9. Colors should be in hex format like "#ff5733"

Example output:
[
  {"x": 0, "y": 0, "z": 0, "color": "#ff5733"},
  {"x": 1, "y": 0, "z": 0, "color": "#33ff57"},
  {"x": 0, "y": 1, "z": 0, "color": "#3357ff"}
]`;
}

export async function generateVoxelModel(
  apiKey: string,
  prompt: string,
  settings: GenerationSettings,
  imageBase64?: string
): Promise<Voxel[]> {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
  });

  const systemPrompt = buildSystemPrompt(settings);
  let parts: any[];

  if (imageBase64) {
    // 移除 data:image/xxx;base64, 前缀
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];

    parts = [
      { text: systemPrompt },
      { text: `User request: ${prompt || 'Create a voxel model based on this image'}` },
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ];
  } else {
    parts = [{ text: systemPrompt }, { text: `User request: ${prompt}` }];
  }

  const result = await model.generateContent(parts);
  const response = await result.response;
  const text = response.text();

  // 提取 JSON
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse voxel data from AI response');
  }

  const voxels = JSON.parse(jsonMatch[0]) as Voxel[];

  // 验证数据
  if (!Array.isArray(voxels) || voxels.length === 0) {
    throw new Error('Invalid voxel data received');
  }

  // 验证每个 voxel 的格式
  for (const voxel of voxels) {
    if (
      typeof voxel.x !== 'number' ||
      typeof voxel.y !== 'number' ||
      typeof voxel.z !== 'number' ||
      typeof voxel.color !== 'string'
    ) {
      throw new Error('Invalid voxel format');
    }
  }

  return voxels;
}
