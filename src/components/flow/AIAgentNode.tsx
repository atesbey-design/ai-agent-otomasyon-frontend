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
import { AgentType, AgentConfig } from '@/store/types';
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