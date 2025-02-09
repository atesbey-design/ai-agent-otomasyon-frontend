"use client";

import { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addNode, updateNodePosition, addEdge, removeNode, removeEdge, updateExecutionResult } from '@/store/slices/flowSlice';
import { AgentType, AgentNode, NodeType } from '@/store/types';
import { createDefaultAgentConfig } from '@/store/defaultConfigs';
import { executeAgent } from '@/api/agents';
import AIAgentNode from './AIAgentNode';
import ResultNode from './ResultNode';
import { Button } from "@/components/ui/button";
import { PlayIcon, GearIcon, PlusIcon } from "@radix-ui/react-icons";
import { toast } from 'sonner';
import 'reactflow/dist/style.css';

const nodeTypes = {
  aiAgent: AIAgentNode,
  resultNode: ResultNode,
};

function Flow() {
  const dispatch = useDispatch();
  const { nodes, edges } = useSelector((state: RootState) => state.flow);
  const { project } = useReactFlow();

  const onNodesChange = useCallback((changes: any[]) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        dispatch(updateNodePosition({
          id: change.id,
          position: change.position,
        }));
      }
    });
  }, [dispatch]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      if (!params.source || !params.target) return;
      
      // Result node'a sadece diğer node'lardan bağlantı yapılabilir
      const targetNode = nodes.find(n => n.id === params.target);
      if (targetNode?.type === 'resultNode') {
        const sourceNode = nodes.find(n => n.id === params.source);
        if (sourceNode?.type === 'resultNode') {
          return; // Result node'dan result node'a bağlantı yapılamaz
        }
      }
      
      dispatch(addEdge({
        id: `e${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
      }));
    },
    [dispatch, nodes],
  );

  const onNodeDelete = useCallback((nodes: Node[]) => {
    nodes.forEach((node) => {
      dispatch(removeNode(node.id));
    });
  }, [dispatch]);

  const onEdgesDelete = useCallback((edges: Edge[]) => {
    edges.forEach((edge) => {
      dispatch(removeEdge(edge.id));
    });
  }, [dispatch]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const agentType = event.dataTransfer.getData('application/reactflow') as AgentType;
      if (!agentType) return;

      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: AgentNode = {
        id: `${Date.now()}`,
        type: agentType === 'result' ? 'resultNode' : 'aiAgent',
        position,
        data: {
          type: agentType,
          config: createDefaultAgentConfig(agentType),
        },
      };

      dispatch(addNode(newNode));
    },
    [project, dispatch],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleExecute = async () => {
    try {
      // Tüm agent node'larını bul ve sırala (result node'lar hariç)
      const agentNodes = nodes.filter(node => node.type !== 'resultNode');
      
      for (const node of agentNodes) {
        // Node'un durumunu 'running' olarak güncelle
        dispatch(updateExecutionResult({
          nodeId: node.id,
          status: 'running',
        }));

        try {
          // Node'u çalıştır
          const result = await executeAgent(node.data.type, node.data.config);

          // Başarılı sonucu kaydet
          dispatch(updateExecutionResult({
            nodeId: node.id,
            status: 'completed',
            output: result,
          }));

          // Bu node'a bağlı result node'ları bul ve güncelle
          const connectedResults = edges
            .filter(edge => edge.source === node.id)
            .map(edge => nodes.find(n => n.id === edge.target))
            .filter(n => n?.type === 'resultNode');

          // Her bağlı result node için sonucu güncelle
          connectedResults.forEach(resultNode => {
            if (resultNode) {
              dispatch(updateExecutionResult({
                nodeId: resultNode.id,
                status: 'completed',
                output: result,
              }));
            }
          });
        } catch (error) {
          // Hata durumunu kaydet
          dispatch(updateExecutionResult({
            nodeId: node.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Bilinmeyen hata',
          }));
          
          toast.error(`${node.data.type} çalıştırılırken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
      }

      toast.success('Tüm agent\'lar başarıyla çalıştırıldı');
    } catch (error) {
      toast.error('Akış çalıştırılırken bir hata oluştu');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Üst Toolbar */}
      <div className="h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleExecute}
            disabled={nodes.length === 0}
          >
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

      {/* Flow Alanı */}
      <div style={{ height: 'calc(100vh - 48px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodeDelete}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="dark:bg-background"
        >
          <Controls className="dark:bg-background dark:text-foreground dark:border-border" />
          <MiniMap className="dark:bg-background" />
          <Background gap={12} size={1} className="dark:bg-muted" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
} 