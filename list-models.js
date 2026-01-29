import { GoogleGenerativeAI } from '@google/generative-ai';

// 从命令行获取 API Key
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Usage: node list-models.js YOUR_API_KEY');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('Fetching available models...\n');

    const models = await genAI.listModels();

    console.log('Available models:');
    console.log('='.repeat(60));

    for (const model of models) {
      console.log(`\nModel: ${model.name}`);
      console.log(`Display Name: ${model.displayName}`);
      console.log(`Description: ${model.description}`);
      console.log(`Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('-'.repeat(60));
    }
  } catch (error) {
    console.error('Error fetching models:', error.message);
    console.error('\nPlease check:');
    console.error('1. Your API key is valid');
    console.error('2. You have enabled the Gemini API in Google Cloud Console');
    console.error('3. Your API key has the correct permissions');
  }
}

listModels();
