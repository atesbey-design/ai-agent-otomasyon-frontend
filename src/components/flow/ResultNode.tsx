"use client";

import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDispatch, useSelector } from 'react-redux';
import { updateNode } from '@/store/slices/flowSlice';
import { AgentType, ResultConfig } from '@/store/types';
import { toast } from 'sonner';
import { defaultAgentConfigs } from '@/store/defaultConfigs';
import { RootState } from '@/store';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

type ResultNodeProps = {
  id: string;
  data: {
    type: AgentType;
    config: ResultConfig;
  };
};

export default function ResultNode({ id, data }: ResultNodeProps) {
  const dispatch = useDispatch();
  const [config, setConfig] = useState<ResultConfig>(data.config);
  const [isOpen, setIsOpen] = useState(false);
  const [output, setOutput] = useState<string>('Henüz çıktı yok...');

  const executionResults = useSelector((state: RootState) => state.flow.executionResults);
  const edges = useSelector((state: RootState) => state.flow.edges);

  useEffect(() => {
    if (data.config) {
      setConfig(data.config);
    }
  }, [data.config]);

  useEffect(() => {
    // Bağlı olan önceki node'u bul
    const sourceEdge = edges.find(edge => edge.target === id);
    if (sourceEdge) {
      const sourceResult = executionResults[sourceEdge.source];
      if (sourceResult?.output) {
        setOutput(JSON.stringify(sourceResult.output, null, 2));
      }
    }
  }, [edges, executionResults, id]);

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
        isConnectable={true}
      />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card className="w-[300px] cursor-pointer hover:ring-2 hover:ring-primary">
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  <span className="text-base">📊</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{defaultAgentConfigs.result.name}</span>
                  <span className="text-xs text-muted-foreground">{defaultAgentConfigs.result.description}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-[100px] w-full rounded-md border p-2">
                <pre className="text-xs">{output}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sonuç Görüntüleyici Yapılandırması</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Görüntüleme Formatı</Label>
              <select
                className="w-full p-2 rounded-md border border-input bg-background"
                value={config.displayFormat}
                onChange={(e) => setConfig({
                  ...config,
                  displayFormat: e.target.value as 'text' | 'json' | 'markdown' | 'html',
                })}
              >
                <option value="text">Düz Metin</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoRefresh">Otomatik Yenileme</Label>
              <Switch
                id="autoRefresh"
                checked={config.autoRefresh}
                onCheckedChange={(checked: boolean) => setConfig({
                  ...config,
                  autoRefresh: checked,
                })}
              />
            </div>

            {config.autoRefresh && (
              <div className="space-y-2">
                <Label>Yenileme Aralığı (ms)</Label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={config.refreshInterval}
                  onChange={(e) => setConfig({
                    ...config,
                    refreshInterval: parseInt(e.target.value),
                  })}
                  className="w-full p-2 rounded-md border border-input bg-background"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Maksimum Geçmiş Uzunluğu</Label>
              <input
                type="number"
                min="1"
                value={config.maxHistoryLength}
                onChange={(e) => setConfig({
                  ...config,
                  maxHistoryLength: parseInt(e.target.value),
                })}
                className="w-full p-2 rounded-md border border-input bg-background"
              />
            </div>

            <Button className="w-full" onClick={handleSave}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 