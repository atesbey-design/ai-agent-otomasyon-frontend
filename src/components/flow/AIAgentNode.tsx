"use client";

import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDispatch } from 'react-redux';
import { updateNode } from '@/store/slices/flowSlice';
import { AgentType, AgentConfig, YoutubeSummarizerConfig, WebSearcherConfig } from '@/store/types';
import { toast } from 'sonner';
import { defaultAgentConfigs } from '@/store/defaultConfigs';

type AIAgentNodeProps = {
  id: string;
  data: {
    type: AgentType;
    config: AgentConfig;
  };
};

export default function AIAgentNode({ id, data }: AIAgentNodeProps) {
  const dispatch = useDispatch();
  const [config, setConfig] = useState<AgentConfig>(data.config);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (data.config) {
      setConfig(data.config);
    }
  }, [data.config]);

  const getNodeColor = () => {
    switch (data.type) {
      case 'webScraper':
        return 'bg-purple-100 dark:bg-purple-900';
      case 'webSearcher':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'codeInterpreter':
        return 'bg-green-100 dark:bg-green-900';
      case 'dataAnalyst':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'imageGenerator':
        return 'bg-pink-100 dark:bg-pink-900';
      case 'textGenerator':
        return 'bg-orange-100 dark:bg-orange-900';
      case 'translator':
        return 'bg-cyan-100 dark:bg-cyan-900';
      case 'youtubeSummarizer':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getNodeIcon = () => {
    switch (data.type) {
      case 'webScraper':
        return '🕷️';
      case 'webSearcher':
        return '🔍';
      case 'codeInterpreter':
        return '💻';
      case 'dataAnalyst':
        return '📊';
      case 'imageGenerator':
        return '🎨';
      case 'textGenerator':
        return '📝';
      case 'translator':
        return '🌐';
      case 'youtubeSummarizer':
        return '📺';
      default:
        return '?';
    }
  };

  const handleSave = () => {
    dispatch(updateNode({
      id,
      updates: {
        data: {
          ...data,
          config,
        },
      },
    }));
    setIsOpen(false);
    toast.success('Yapılandırma kaydedildi');
  };

  const renderAgentSpecificConfig = () => {
    if (data.type === 'youtubeSummarizer') {
      return (
        <>
          <div className="space-y-2">
            <Label>YouTube URL</Label>
            <Input
              value={(config as YoutubeSummarizerConfig).youtubeUrl}
              onChange={(e) => setConfig({
                ...config,
                youtubeUrl: e.target.value,
              })}
              placeholder="YouTube video URL'sini girin"
            />
          </div>

          <div className="space-y-2">
            <Label>Özelleştirilmiş Prompt</Label>
            <Textarea
              value={(config as YoutubeSummarizerConfig).customPrompt}
              onChange={(e) => setConfig({
                ...config,
                customPrompt: e.target.value,
              })}
              placeholder="Özel prompt girin"
            />
          </div>

          <div className="space-y-2">
            <Label>Çıktı Formatı</Label>
            <select
              className="w-full p-2 rounded-md border border-input bg-background"
              value={(config as YoutubeSummarizerConfig).outputFormat}
              onChange={(e) => setConfig({
                ...config,
                outputFormat: e.target.value as 'text' | 'bullet' | 'chapters',
              })}
            >
              <option value="text">Düz Metin</option>
              <option value="bullet">Madde İşaretleri</option>
              <option value="chapters">Bölümler</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeThumbnail"
              checked={(config as YoutubeSummarizerConfig).includeThumbnail}
              onChange={(e) => setConfig({
                ...config,
                includeThumbnail: e.target.checked,
              })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="includeThumbnail">Küçük Resim Ekle</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeTimestamps"
              checked={(config as YoutubeSummarizerConfig).includeTimestamps}
              onChange={(e) => setConfig({
                ...config,
                includeTimestamps: e.target.checked,
              })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="includeTimestamps">Zaman Damgalarını Ekle</Label>
          </div>
        </>
      );
    }
    
    if (data.type === 'webSearcher') {
      return (
        <>
          <div className="space-y-2">
            <Label>Arama Sorgusu</Label>
            <Input
              value={(config as WebSearcherConfig).searchQuery}
              onChange={(e) => setConfig({
                ...config,
                searchQuery: e.target.value,
              })}
              placeholder="Aramak istediğiniz sorguyu girin"
            />
          </div>

          <div className="space-y-2">
            <Label>Sonuç Sayısı</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={(config as WebSearcherConfig).maxResults}
              onChange={(e) => setConfig({
                ...config,
                maxResults: parseInt(e.target.value) || 4,
              })}
              placeholder="Kaç sonuç gösterilsin?"
            />
          </div>

          <div className="space-y-2">
            <Label>Dil</Label>
            <select
              className="w-full p-2 rounded-md border border-input bg-background"
              value={(config as WebSearcherConfig).filters.language}
              onChange={(e) => setConfig({
                ...config,
                filters: {
                  ...(config as WebSearcherConfig).filters,
                  language: e.target.value,
                },
              })}
            >
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="safeSearch"
              checked={(config as WebSearcherConfig).filters.safeSearch}
              onChange={(e) => setConfig({
                ...config,
                filters: {
                  ...(config as WebSearcherConfig).filters,
                  safeSearch: e.target.checked,
                },
              })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="safeSearch">Güvenli Arama</Label>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-muted-foreground dark:!bg-muted-foreground group-hover:!bg-primary"
        id="target"
      />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card className="w-48 cursor-pointer hover:ring-2 hover:ring-primary">
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <div className={`w-8 h-8 ${getNodeColor()} rounded flex items-center justify-center`}>
                  <span className="text-base">{getNodeIcon()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{defaultAgentConfigs[data.type].name}</span>
                  <span className="text-xs text-muted-foreground">{defaultAgentConfigs[data.type].description}</span>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{defaultAgentConfigs[data.type].name} Yapılandırması</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {data.type !== 'youtubeSummarizer' && (
              <>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={config.modelConfig.model}
                    onChange={(e) => setConfig({
                      ...config,
                      modelConfig: {
                        ...config.modelConfig,
                        model: e.target.value
                      }
                    })}
                    placeholder="Kullanılacak model"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Sistem Prompt</Label>
                  <Textarea
                    value={config.modelConfig.systemPrompt}
                    onChange={(e) => setConfig({
                      ...config,
                      modelConfig: {
                        ...config.modelConfig,
                        systemPrompt: e.target.value
                      }
                    })}
                    placeholder="Sistem promptunu girin"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Sıcaklık (Temperature)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.modelConfig.temperature}
                    onChange={(e) => setConfig({
                      ...config,
                      modelConfig: {
                        ...config.modelConfig,
                        temperature: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
              </>
            )}

            {renderAgentSpecificConfig()}

            <Button className="w-full" onClick={handleSave}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-muted-foreground dark:!bg-muted-foreground group-hover:!bg-primary"
        id="source"
      />
    </div>
  );
} 