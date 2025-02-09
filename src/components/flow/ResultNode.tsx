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
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

  // Bağlı olan kaynak node'un sonucunu al
  const sourceEdge = edges.find(edge => edge.target === id);
  const result = sourceEdge ? executionResults[sourceEdge.source] : null;

  const getStatusColor = () => {
    if (!result) return 'bg-gray-500';
    
    switch (result.status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'running':
        return 'bg-orange-500 animate-pulse';
      default:
        return 'bg-gray-500';
    }
  };

  const formatOutput = (output: any) => {
    if (typeof output === 'string') {
      return output;
    }
    if (typeof output === 'object') {
      if (output.response) {
        return output.response;
      }
      return JSON.stringify(output, null, 2);
    }
    return '';
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
      
      <Card className="w-[300px] p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <h3 className="font-medium">Sonuç</h3>
            </div>
            {result?.status === 'running' && (
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            )}
          </div>

          {result?.status === 'completed' && result.output && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Sonucu Görüntüle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Analiz Sonucu</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {formatOutput(result.output)}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <div className="max-h-[150px] overflow-hidden rounded-md bg-muted p-3">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {formatOutput(result.output).slice(0, 200) + 
                     (formatOutput(result.output).length > 200 ? '...' : '')}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          )}

          {result?.status === 'error' && (
            <div className="rounded-md bg-red-100 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                {result.error}
              </p>
            </div>
          )}

          {!result && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Henüz sonuç yok...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 