"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, PlayIcon, GearIcon } from "@radix-ui/react-icons";
import FlowEditor from "@/components/flow/FlowEditor";
import { defaultAgentConfigs } from "@/store/defaultConfigs";
import { AgentType } from "@/store/types";
import { useState, useMemo } from 'react';

const agentIcons: Record<AgentType, string> = {
  webScraper: '🕷️',
  webSearcher: '🔍',
  codeInterpreter: '💻',
  dataAnalyst: '📊',
  imageGenerator: '🎨',
  textGenerator: '📝',
  translator: '🌐',
  youtubeSummarizer: '📺',
  researchAgent: '📚',
  result: '📋',
};

const agentColors: Record<AgentType, string> = {
  webScraper: 'bg-purple-100 dark:bg-purple-900',
  webSearcher: 'bg-blue-100 dark:bg-blue-900',
  codeInterpreter: 'bg-green-100 dark:bg-green-900',
  dataAnalyst: 'bg-yellow-100 dark:bg-yellow-900',
  imageGenerator: 'bg-pink-100 dark:bg-pink-900',
  textGenerator: 'bg-orange-100 dark:bg-orange-900',
  translator: 'bg-cyan-100 dark:bg-cyan-900',
  youtubeSummarizer: 'bg-red-100 dark:bg-red-900',
  researchAgent: 'bg-indigo-100 dark:bg-indigo-900',
  result: 'bg-gray-100 dark:bg-gray-900',
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (Object.keys(defaultAgentConfigs) as AgentType[]).filter(agentType => {
      const config = defaultAgentConfigs[agentType];
      return (
        (config?.name || '').toLowerCase().includes(query) ||
        (config?.description || '').toLowerCase().includes(query) ||
        agentType.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const onDragStart = (event: React.DragEvent, agentType: AgentType) => {
    event.dataTransfer.setData('application/reactflow', agentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sol Sidebar - AI Agentler */}
      <div className="w-64 border-r bg-background p-4 overflow-y-auto">
        <div className="mb-4">
          <Input 
            type="search" 
            placeholder="Agent ara..." 
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          <div className="font-semibold text-sm text-muted-foreground">
            AI AGENTLER {filteredAgents.length > 0 && `(${filteredAgents.length})`}
          </div>
          
          {/* Agent Listesi */}
          <div className="space-y-2">
            {filteredAgents.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Sonuç bulunamadı
              </div>
            ) : (
              filteredAgents.map((agentType) => (
                <Card 
                  key={agentType}
                  className="cursor-grab hover:bg-accent" 
                  draggable 
                  onDragStart={(e) => onDragStart(e, agentType)}
                >
                  <CardContent className="p-3 flex items-center space-x-2">
                    <div className={`w-8 h-8 ${agentColors[agentType]} rounded flex items-center justify-center`}>
                      <span className="text-base">{agentIcons[agentType]}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{defaultAgentConfigs[agentType].name}</span>
                      <span className="text-xs text-muted-foreground">{defaultAgentConfigs[agentType].description}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ana Çalışma Alanı */}
      <div className="flex-1 relative">
        <FlowEditor />
      </div>
    </div>
  );
}

