import { WebSearcherConfig, YoutubeSummarizerConfig } from '@/store/types';

const API_URL = 'http://localhost:8000';

export async function executeYoutubeSummarizer(config: YoutubeSummarizerConfig) {
  try {
    const response = await fetch(`${API_URL}/youtube/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: config.youtubeUrl,
        question: config.customPrompt,
       
      }),
    });

    if (!response.ok) {
      throw new Error('YouTube özeti alınamadı');
    }

    const data = await response.json();
    console.log(data);
    return data.response;
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
}

export async function executeWebSearcher(config: WebSearcherConfig) {
  try {
    const response = await fetch(`${API_URL}/websearch/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: config.searchQuery,
        num_results: config.maxResults,
        languages: [config.filters.language || 'en'],
      }),
    });

    if (!response.ok) {
      throw new Error('Web arama sonuçları alınamadı');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Web Search API Error:', error);
    throw error;
  }
}

export async function executeAgent(type: string, config: any) {
  switch (type) {
    case 'youtubeSummarizer':
      return executeYoutubeSummarizer(config);
    case 'webSearcher':
      return executeWebSearcher(config);
    default:
      throw new Error('Desteklenmeyen agent tipi');
  }
} 