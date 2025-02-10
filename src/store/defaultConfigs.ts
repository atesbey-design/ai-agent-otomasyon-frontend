import { AgentType, AgentConfig, LLMType, ModelConfig } from './types';

const defaultModelConfig: Record<LLMType, Partial<ModelConfig>> = {
  openai: {
    type: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
  },
  gemini: {
    type: 'gemini',
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 32768,
    topP: 0.95,
    maxOutputTokens: 2048,
    systemPrompt: '',
  },
  anthropic: {
    type: 'anthropic',
    model: 'claude-3-opus',
    temperature: 0.7,
    maxTokens: 100000,
    topP: 1,
    systemPrompt: '',
  },
  llama2: {
    type: 'llama2',
    model: 'llama-2-70b-chat',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    repetitionPenalty: 1.1,
    systemPrompt: '',
  },
};

export const defaultAgentConfigs: Record<AgentType, Partial<AgentConfig>> = {
  webScraper: {
    name: 'Web Scraper',
    description: 'Web sayfalarından veri çıkarma ve analiz etme',
    capabilities: {
      javascript: true,
      cookies: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIAgent/1.0)',
      },
    },
    rules: {
      maxDepth: 2,
      maxPages: 10,
    },
  },
  webSearcher: {
    name: 'Web Searcher',
    description: 'İnternet üzerinde arama ve bilgi toplama',
    searchEngines: ['google', 'bing'],
    searchQuery: '',
    maxResults: 4,
    filters: {
      safeSearch: true,
      timeRange: 'month',
      language: 'tr',
    },
  },
  codeInterpreter: {
    name: 'Code Interpreter',
    description: 'Kod çalıştırma ve programlama asistanı',
    runtime: {
      python: true,
      javascript: true,
      r: false,
    },
    permissions: {
      fileSystem: true,
      network: false,
      subprocess: false,
    },
    libraries: ['numpy', 'pandas', 'matplotlib'],
    memoryLimit: 1024,
    timeoutSeconds: 30,
  },
  dataAnalyst: {
    name: 'Data Analyst',
    description: 'Veri analizi ve görselleştirme',
    supportedFormats: ['csv', 'json', 'excel'],
    visualization: {
      enabled: true,
      libraries: ['matplotlib', 'plotly'],
    },
    caching: true,
  },
  imageGenerator: {
    name: 'Image Generator',
    description: 'AI destekli görsel içerik oluşturma',
    provider: 'dalle',
    resolution: '1024x1024',
    style: 'natural',
    samplingSteps: 20,
  },
  textGenerator: {
    name: 'Text Generator',
    description: 'İçerik ve metin üretimi',
    maxLength: 2000,
    format: 'markdown',
    style: {
      tone: 'professional',
      audience: 'general',
    },
  },
  translator: {
    name: 'Translator',
    description: 'Çoklu dil çeviri asistanı',
    sourceLang: 'auto',
    targetLang: 'tr',
    preserveFormatting: true,
    specialization: 'general',
  },
  youtubeSummarizer: {
    name: 'YouTube Summarizer',
    description: 'YouTube video içeriklerini özetleme ve analiz',
    youtubeUrl: '',
    customPrompt: 'Bu YouTube videosunun ana noktalarını özetle ve önemli detayları vurgula.',
    outputFormat: 'text',
    language: 'tr',
    maxLength: 1000,
    includeThumbnail: true,
    includeTimestamps: true,
  },
  result: {
    name: 'Sonuç Görüntüleyici',
    description: 'Agent çıktılarını görüntüleme ve analiz',
    displayFormat: 'text',
    autoRefresh: true,
    refreshInterval: 5000,
    maxHistoryLength: 10,
  },
  researchAgent: {
    name: 'Research Agent',
    description: 'Kapsamlı araştırma ve analiz yapma',
    topic: '',
    numLinks: 5,
    depth: 'detailed',
    language: 'tr',
    includeSourceLinks: true,
    format: 'markdown',
  },
};

export function createDefaultAgentConfig(type: AgentType, llmType: LLMType = 'openai'): AgentConfig {
  const baseConfig = defaultAgentConfigs[type];
  const modelConfig = defaultModelConfig[llmType];

  return {
    ...baseConfig,
    modelConfig: modelConfig as ModelConfig,
  } as AgentConfig;
} 