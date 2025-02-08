"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, PlayIcon, GearIcon } from "@radix-ui/react-icons";
import FlowEditor from "@/components/flow/FlowEditor";
import { defaultAgentConfigs } from "@/store/defaultConfigs";
import { AgentType } from "@/store/types";

const agentIcons: Record<AgentType, string> = {
  webScraper: '🕷️',
  webSearcher: '🔍',
  codeInterpreter: '💻',
  dataAnalyst: '📊',
  imageGenerator: '🎨',
  textGenerator: '📝',
  translator: '🌐',
};

const agentColors: Record<AgentType, string> = {
  webScraper: 'bg-purple-100 dark:bg-purple-900',
  webSearcher: 'bg-blue-100 dark:bg-blue-900',
  codeInterpreter: 'bg-green-100 dark:bg-green-900',
  dataAnalyst: 'bg-yellow-100 dark:bg-yellow-900',
  imageGenerator: 'bg-pink-100 dark:bg-pink-900',
  textGenerator: 'bg-orange-100 dark:bg-orange-900',
  translator: 'bg-cyan-100 dark:bg-cyan-900',
};

export default function Home() {
  const onDragStart = (event: React.DragEvent, agentType: AgentType) => {
    event.dataTransfer.setData('application/reactflow', agentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex h-screen">
      {/* Sol Sidebar - AI Agentler */}
      <div className="w-64 border-r bg-background p-4">
        <div className="mb-4">
          <Input type="search" placeholder="Agent ara..." className="w-full" />
        </div>
        
        <div className="space-y-4">
          <div className="font-semibold text-sm text-muted-foreground">AI AGENTLER</div>
          
          {/* Agent Listesi */}
          <div className="space-y-2">
            {(Object.keys(defaultAgentConfigs) as AgentType[]).map((agentType) => (
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
            ))}
          </div>

          <div className="font-semibold text-sm text-muted-foreground mt-6">ARAÇLAR</div>
          
          {/* Araçlar Listesi */}
          <div className="space-y-2">
            <Card 
              className="cursor-grab hover:bg-accent"
              draggable 
              onDragStart={(e) => onDragStart(e, 'IF')}
            >
              <CardContent className="p-3 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-semibold">IF</span>
                </div>
                <span className="text-sm">Koşul Kontrolü</span>
              </CardContent>
            </Card>

            <Card 
              className="cursor-grab hover:bg-accent"
              draggable 
              onDragStart={(e) => onDragStart(e, 'Transform')}
            >
              <CardContent className="p-3 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-semibold">→</span>
                </div>
                <span className="text-sm">Veri Dönüştürme</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Ana Çalışma Alanı */}
      <div className="flex-1 flex flex-col">
        {/* Üst Toolbar */}
        <div className="h-12 border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline">
              <PlayIcon className="mr-2 h-4 w-4" />
              Çalıştır
            </Button>
            <Button size="sm" variant="outline">
              <GearIcon className="mr-2 h-4 w-4" />
              Ayarlar
            </Button>
          </div>
          <div className="text-sm font-medium">AI Agent Akışı</div>
          <Button size="sm" variant="outline">
            <PlusIcon className="mr-2 h-4 w-4" />
            Yeni Agent
          </Button>
        </div>

        {/* Çalışma Alanı */}
        <div className="flex-1">
          <FlowEditor />
        </div>
      </div>
    </div>
  );
}
