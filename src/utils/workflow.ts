import { Voxel } from '../types';
import { GenerationSettings } from '../components/PromptModal';

export interface WorkflowConfig {
  apiUrl: string;
  apiKey?: string;
}

/**
 * 调用自定义工作流API生成体素模型
 */
export async function generateVoxelModelFromWorkflow(
  config: WorkflowConfig,
  prompt: string,
  settings: GenerationSettings,
  imageBase64?: string,
  onLog?: (systemPrompt: string, aiResponse: string) => void
): Promise<Voxel[]> {
  if (!config.apiUrl) {
    throw new Error('工作流API URL未配置');
  }

  console.log('Calling Workflow API:', config.apiUrl);

  // 增强用户prompt，确保生成密实完整的模型
  const enhancedPrompt = `${prompt}

重要要求：
- 生成完整的、实心的体素模型
- 确保所有身体部位（头部、躯干、四肢等）都用体素填充满
- 不要留空洞或缺失部分
- 模型应该密实、完整`;

  // 构建请求体 - 符合 Dify 对话型应用 API 格式
  const requestBody: any = {
    query: enhancedPrompt, // 使用增强后的prompt
    user: 'voxel-studio-user', // 必需字段：用户标识
    response_mode: 'blocking', // 阻塞模式，等待完整响应
    inputs: {
      // 将设置作为输入变量传递
      voxelCount: settings.voxelCount,
      style: settings.style,
      colorStyle: settings.colorStyle,
    },
  };

  // 如果有图片，添加到 files 数组中
  if (imageBase64) {
    requestBody.files = [
      {
        type: 'image',
        transfer_method: 'local_file',
        upload_file_id: imageBase64, // 或根据实际需要调整
      }
    ];
  }

  // 构建请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 如果有API Key，添加到请求头
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`工作流API调用失败 (${response.status}): ${errorText}`);
    }

    const responseData = await response.json();
    console.log('=== 完整的工作流响应 ===');
    console.log('响应类型:', typeof responseData);
    console.log('响应内容:', responseData);
    console.log('响应JSON:', JSON.stringify(responseData, null, 2));
    console.log('========================');

    // 尝试从响应中提取体素数据
    let voxels: Voxel[] | null = null;
    let aiResponse = '';

    // 强化版JSON提取逻辑（基于Python代码）
    const extractJsonArray = (inputText: string): Voxel[] | null => {
      // 辅助函数：移除JSON注释
      const removeJsonComments = (s: string): string => {
        // 移除多行注释 /* ... */
        s = s.replace(/\/\*[\s\S]*?\*\//g, '');
        // 移除单行注释 // ...
        s = s.replace(/\/\/.*$/gm, '');
        return s;
      };

      // 辅助函数：修复缺少逗号的JSON
      const repairMissingCommas = (s: string): string => {
        s = s.replace(/}\s*{/g, '},{');
        s = s.replace(/}\s*\n\s*{/g, '},\n{');
        return s;
      };

      // 辅助函数：修复单引号键名
      const repairSingleQuotedKeys = (s: string): string => {
        return s.replace(/(?<=\{|,)\s*'([A-Za-z_]\w*)'\s*:/g, '"$1":');
      };

      // 辅助函数：应用修复管道
      const repairVoxelJson = (s: string): string => {
        s = removeJsonComments(s);
        s = repairMissingCommas(s);
        s = repairSingleQuotedKeys(s);
        return s;
      };

      // 辅助函数：尝试JSON.parse，失败后尝试修复再解析
      const loadsWithRepair = (s: string): any | null => {
        try {
          return JSON.parse(s);
        } catch (e) {
          try {
            return JSON.parse(repairVoxelJson(s));
          } catch (err) {
            return null;
          }
        }
      };

      // 辅助函数：扫描第一个有效的JSON对象/数组
      const scanFirstJson = (s: string): any | null => {
        const n = s.length;
        for (let i = 0; i < n; i++) {
          const ch = s[i];
          if (ch !== '{' && ch !== '[') continue;

          const stack: string[] = [];
          let inStr = false;
          let esc = false;

          for (let j = i; j < n; j++) {
            const c = s[j];

            if (inStr) {
              if (esc) {
                esc = false;
              } else if (c === '\\') {
                esc = true;
              } else if (c === '"') {
                inStr = false;
              }
              continue;
            } else {
              if (c === '"') {
                inStr = true;
                continue;
              }
              if (c === '{' || c === '[') {
                stack.push(c);
              } else if (c === '}' || c === ']') {
                if (stack.length === 0) break;
                stack.pop();
                if (stack.length === 0) {
                  const snippet = s.substring(i, j + 1).trim();
                  console.log('找到JSON片段，长度:', snippet.length);
                  const loaded = loadsWithRepair(snippet);
                  if (loaded !== null) {
                    console.log('✅ 成功解析JSON');
                    return loaded;
                  }
                  console.log('该片段无法解析，继续搜索');
                  break;
                }
              }
            }
          }
        }
        return null;
      };

      // 辅助函数：从代码围栏中提取JSON
      const extractJsonFromFence = (text: string): any | null => {
        const fencePattern = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
        const matches = text.matchAll(fencePattern);

        for (const match of matches) {
          const candidate = match[1].trim();
          console.log('找到代码围栏，长度:', candidate.length);
          const loaded = loadsWithRepair(candidate);
          if (loaded !== null) {
            console.log('✅ 从代码围栏成功提取JSON');
            return loaded;
          }
        }
        return null;
      };

      // 标准化体素数据
      const normalizeVoxels = (arr: any[]): Voxel[] => {
        const out: Voxel[] = [];
        for (const it of arr) {
          if (typeof it !== 'object' || it === null) continue;

          // 转换 color -> c
          if (!('c' in it) && 'color' in it) {
            it.c = it.color;
          }

          // 只保留 x, y, z, c
          const cleaned: any = {};
          for (const k of ['x', 'y', 'z', 'c']) {
            if (k in it) {
              cleaned[k] = it[k];
            }
          }

          // 严格检查：必须包含所有4个键
          if ('x' in cleaned && 'y' in cleaned && 'z' in cleaned && 'c' in cleaned) {
            out.push(cleaned as Voxel);
          }
        }
        return out;
      };

      console.log('=== 开始强化版JSON提取 ===');

      // Step 1: 尝试解析外层JSON
      let mainText = inputText;
      try {
        const outer = JSON.parse(inputText);
        if (typeof outer === 'object' && outer !== null && typeof outer.text === 'string') {
          console.log('检测到外层text字段');
          mainText = outer.text;
        } else if (typeof outer === 'object' && outer !== null && typeof outer.answer === 'string') {
          console.log('检测到Dify answer字段');
          mainText = outer.answer;
        }
      } catch (e) {
        // 不是JSON，直接使用原始文本
      }

      // Step 2: 尝试多种提取策略
      let voxelData: any = null;

      // 策略1: 从代码围栏提取
      voxelData = extractJsonFromFence(mainText);
      if (voxelData) {
        console.log('✅ 策略1成功：从代码围栏提取');
      }

      // 策略2: 扫描第一个有效JSON
      if (!voxelData) {
        voxelData = scanFirstJson(mainText);
        if (voxelData) {
          console.log('✅ 策略2成功：扫描到有效JSON');
        }
      }

      // 策略3: 直接尝试解析整个文本
      if (!voxelData) {
        voxelData = loadsWithRepair(mainText);
        if (voxelData) {
          console.log('✅ 策略3成功：直接解析');
        }
      }

      if (!voxelData) {
        console.log('❌ 所有策略都失败了');
        return null;
      }

      // Step 3: 标准化并验证
      if (Array.isArray(voxelData)) {
        const normalized = normalizeVoxels(voxelData);
        console.log('✅ 最终提取:', normalized.length, '个体素');
        return normalized;
      }

      console.log('❌ 提取的数据不是数组');
      return null;
    };

    // 处理不同的响应格式
    if (Array.isArray(responseData)) {
      // 直接是数组格式
      voxels = responseData;
      aiResponse = JSON.stringify(responseData);
    } else if (responseData.answer && typeof responseData.answer === 'string') {
      // Dify 格式：{answer: "混合文本+JSON"}
      console.log('检测到 Dify answer 格式，开始提取JSON...');
      voxels = extractJsonArray(responseData.answer);
      aiResponse = responseData.answer;
      if (!voxels) {
        console.error('无法从 answer 字段提取JSON');
        throw new Error('无法从工作流返回的 answer 字段中提取JSON数组');
      }
    } else if (responseData.voxels && Array.isArray(responseData.voxels)) {
      // {voxels: [...]}格式
      voxels = responseData.voxels;
      aiResponse = JSON.stringify(responseData);
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // {data: [...]}格式
      voxels = responseData.data;
      aiResponse = JSON.stringify(responseData);
    } else if (responseData.result) {
      // {result: ...}格式，result可能是字符串或对象
      if (typeof responseData.result === 'string') {
        voxels = extractJsonArray(responseData.result);
        aiResponse = responseData.result;
        if (!voxels) {
          throw new Error('无法从工作流返回的字符串中提取JSON数组');
        }
      } else if (Array.isArray(responseData.result)) {
        voxels = responseData.result;
        aiResponse = JSON.stringify(responseData.result);
      }
    } else if (responseData.output) {
      // {output: ...}格式
      if (typeof responseData.output === 'string') {
        voxels = extractJsonArray(responseData.output);
        aiResponse = responseData.output;
        if (!voxels) {
          throw new Error('无法从工作流返回的字符串中提取JSON数组');
        }
      } else if (Array.isArray(responseData.output)) {
        voxels = responseData.output;
        aiResponse = JSON.stringify(responseData.output);
      }
    } else if (typeof responseData === 'string') {
      // 直接是字符串格式（混合文本+JSON）
      voxels = extractJsonArray(responseData);
      aiResponse = responseData;
      if (!voxels) {
        throw new Error('无法从工作流返回的字符串中提取JSON数组');
      }
    }

    if (!voxels) {
      console.error('Unknown workflow response format:', responseData);
      throw new Error('工作流返回了不支持的数据格式，请检查API响应');
    }

    // 验证数据
    if (!Array.isArray(voxels) || voxels.length === 0) {
      throw new Error('工作流返回的体素数据为空');
    }

    // 验证第一个体素的格式
    const first = voxels[0];
    if (typeof first.x !== 'number' || typeof first.y !== 'number' ||
        typeof first.z !== 'number' || typeof first.c !== 'string') {
      throw new Error('工作流返回的体素数据格式错误，需要包含 {x, y, z, c} 字段');
    }

    // 调用日志回调
    if (onLog) {
      onLog('使用自定义工作流API', aiResponse);
    }

    console.log('Successfully parsed', voxels.length, 'voxels from workflow');
    return voxels;

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`工作流API调用失败: ${error}`);
  }
}
