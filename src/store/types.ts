// Agent Tipleri
export type AgentType = 
  | 'webScraper' 
  | 'webSearcher' 
  | 'codeInterpreter' 
  | 'dataAnalyst' 
  | 'imageGenerator'
  | 'textGenerator'
  | 'translator'
  | 'youtubeSummarizer'
  | 'result';

// LLM Model Tipleri
export type LLMType = 'openai' | 'gemini' | 'anthropic' | 'llama2';

// Temel Model Konfigürasyonları
interface BaseModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
}

export interface OpenAIConfig extends BaseModelConfig {
  type: 'openai';
  apiKey: string;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface GeminiConfig extends BaseModelConfig {
  type: 'gemini';
  apiKey?: string;
  maxOutputTokens?: number;
}

export interface AnthropicConfig extends BaseModelConfig {
  type: 'anthropic';
  apiKey: string;
}

export interface LlamaConfig extends BaseModelConfig {
  type: 'llama2';
  repetitionPenalty: number;
}

export type ModelConfig = OpenAIConfig | GeminiConfig | AnthropicConfig | LlamaConfig;

// Agent Konfigürasyonları
interface BaseAgentConfig {
  name: string;
  description: string;
  modelConfig: ModelConfig;
}

export interface WebScraperConfig extends BaseAgentConfig {
  capabilities: {
    javascript: boolean;
    cookies: boolean;
    headers: Record<string, string>;
    proxy?: string;
  };
  rules: {
    allowedDomains?: string[];
    blockedDomains?: string[];
    maxDepth: number;
    maxPages: number;
  };
}

export interface WebSearcherConfig extends BaseAgentConfig {
  searchEngines: ('google' | 'bing' | 'duckduckgo')[];
  apiKeys: {
    google?: string;
    bing?: string;
  };
  filters: {
    region?: string;
    language?: string;
    timeRange?: 'day' | 'week' | 'month' | 'year';
    safeSearch: boolean;
  };
}

export interface CodeInterpreterConfig extends BaseAgentConfig {
  runtime: {
    python: boolean;
    javascript: boolean;
    r: boolean;
  };
  permissions: {
    fileSystem: boolean;
    network: boolean;
    subprocess: boolean;
  };
  libraries: string[];
  memoryLimit: number;
  timeoutSeconds: number;
}

export interface DataAnalystConfig extends BaseAgentConfig {
  supportedFormats: ('csv' | 'json' | 'excel' | 'sql')[];
  visualization: {
    enabled: boolean;
    libraries: ('matplotlib' | 'plotly' | 'seaborn')[];
  };
  database: {
    type?: 'mysql' | 'postgresql' | 'sqlite';
    connection?: string;
  };
  caching: boolean;
}

export interface ImageGeneratorConfig extends BaseAgentConfig {
  provider: 'dalle' | 'stable-diffusion' | 'midjourney';
  resolution: string;
  style: string;
  negativePrompt?: string;
  samplingSteps: number;
  seed?: number;
}

export interface TextGeneratorConfig extends BaseAgentConfig {
  maxLength: number;
  stopSequences?: string[];
  format: 'markdown' | 'html' | 'plain';
  style?: {
    tone: 'formal' | 'casual' | 'professional';
    audience: 'general' | 'technical' | 'academic';
  };
}

export interface TranslatorConfig extends BaseAgentConfig {
  sourceLang: string;
  targetLang: string;
  preserveFormatting: boolean;
  glossary?: Record<string, string>;
  specialization?: 'general' | 'technical' | 'legal' | 'medical';
}

export interface YoutubeSummarizerConfig extends BaseAgentConfig {
  youtubeUrl: string;
  customPrompt: string;
  outputFormat: 'text' | 'bullet' | 'chapters';
  language: string;
  maxLength?: number;
  includeThumbnail: boolean;
  includeTimestamps: boolean;
}

export interface ResultConfig extends BaseAgentConfig {
  displayFormat: 'text' | 'json' | 'markdown' | 'html';
  autoRefresh: boolean;
  refreshInterval?: number;
  maxHistoryLength?: number;
}

export type AgentConfig =
  | WebScraperConfig
  | WebSearcherConfig
  | CodeInterpreterConfig
  | DataAnalystConfig
  | ImageGeneratorConfig
  | TextGeneratorConfig
  | TranslatorConfig
  | YoutubeSummarizerConfig
  | ResultConfig;

// Node Types
export type NodeType = 'aiAgent' | 'resultNode';

// Agent Node
export interface AgentNode {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: {
    type: AgentType;
    config: AgentConfig;
  };
}

// Bağlantı
export interface FlowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: {
    transformations?: string[];
  };
}

// Akış Durumu
export interface FlowState {
  nodes: AgentNode[];
  edges: FlowConnection[];
  selectedNodeId: string | null;
  isRunning: boolean;
  executionResults: {
    [nodeId: string]: {
      status: 'idle' | 'running' | 'completed' | 'error';
      output?: any;
      error?: string;
      executionTime?: number;
      resourceUsage?: {
        memory: number;
        cpu: number;
        network: {
          sent: number;
          received: number;
        };
      };
    };
  };
}

// Geçmiş
export interface HistoryEntry {
  id: string;
  timestamp: number;
  flowState: FlowState;
  name: string;
  description?: string;
}

// Ayarlar
export interface Settings {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  autoSave: boolean;
  saveInterval: number;
  defaultModels: {
    [key in LLMType]: string;
  };
  maxTokenLimits: {
    [key in LLMType]: number;
  };
  agentDefaults: {
    [key in AgentType]: Partial<AgentConfig>;
  };
  security: {
    encryptApiKeys: boolean;
    allowExternalRequests: boolean;
    allowFileSystem: boolean;
  };
}

// Ana State
export interface RootState {
  flow: FlowState;
  history: HistoryEntry[];
  settings: Settings;
} 