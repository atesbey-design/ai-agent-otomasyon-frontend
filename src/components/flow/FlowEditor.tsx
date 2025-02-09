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
import { AgentType, AgentNode, NodeType, FlowConnection } from '@/store/types';
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

// Edge stil fonksiyonu
const getEdgeStyle = (edge: Edge, executionResults: any) => {
  const sourceResult = executionResults[edge.source];
  
  if (!sourceResult) {
    return {
      stroke: '#64748b', // Gri (default)
      strokeWidth: 2,
      transition: 'stroke 0.3s ease',
    };
  }

  switch (sourceResult.status) {
    case 'running':
      return {
        stroke: '#f97316', // Turuncu
        strokeWidth: 2,
        animation: 'flowEdgePulse 1.5s infinite',
        transition: 'stroke 0.3s ease',
      };
    case 'completed':
      return {
        stroke: '#22c55e', // Yeşil
        strokeWidth: 2,
        transition: 'stroke 0.3s ease',
      };
    case 'error':
      return {
        stroke: '#ef4444', // Kırmızı
        strokeWidth: 2,
        transition: 'stroke 0.3s ease',
      };
    default:
      return {
        stroke: '#64748b', // Gri
        strokeWidth: 2,
        transition: 'stroke 0.3s ease',
      };
  }
};

function Flow() {
  const dispatch = useDispatch();
  const { nodes, edges, executionResults } = useSelector((state: RootState) => state.flow);
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
      // Tüm agent node'ları bul (result node'lar hariç)
      const agentNodes = nodes.filter(node => node.type !== 'resultNode');
      
      // Node'ları sıralı çalıştırmak için bağlantıları takip et
      const executionOrder = getExecutionOrder(agentNodes, edges);
      
      for (const node of executionOrder) {
        // Node'un durumunu 'running' olarak güncelle
        dispatch(updateExecutionResult({
          nodeId: node.id,
          status: 'running',
        }));

        try {
          // Önceki node'ların çıktılarını al
          const inputs = getPreviousNodeOutputs(node.id, edges, executionResults);
          
          // Node'u çalıştır
          const result = await executeAgent(node.data.type, {
            ...node.data.config,
            previousOutputs: inputs, // Önceki çıktıları config'e ekle
          });

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
          break; // Hata durumunda sıralı çalıştırmayı durdur
        }
      }

      toast.success('İşlem tamamlandı');
    } catch (error) {
      toast.error('Akış çalıştırılırken bir hata oluştu');
    }
  };

  // Node'ları sıralı çalıştırmak için sıralama fonksiyonu
  const getExecutionOrder = (nodes: AgentNode[], edges: FlowConnection[]) => {
    const visited = new Set<string>();
    const order: AgentNode[] = [];

    const visit = (node: AgentNode) => {
      if (visited.has(node.id)) return;
      
      // Önce bu node'a gelen bağlantıları bul
      const incomingEdges = edges.filter(edge => edge.target === node.id);
      
      // Gelen bağlantıların kaynak node'larını ziyaret et
      for (const edge of incomingEdges) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode && !visited.has(sourceNode.id)) {
          visit(sourceNode);
        }
      }

      visited.add(node.id);
      order.push(node);
    };

    // Tüm node'ları ziyaret et
    nodes.forEach(node => visit(node));
    return order;
  };

  // Önceki node'ların çıktılarını alma fonksiyonu
  const getPreviousNodeOutputs = (nodeId: string, edges: FlowConnection[], results: any) => {
    const inputs: any[] = [];
    
    // Bu node'a gelen bağlantıları bul
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    
    // Her bağlantının kaynağındaki sonucu al
    incomingEdges.forEach(edge => {
      const sourceResult = results[edge.source];
      if (sourceResult?.status === 'completed' && sourceResult.output) {
        inputs.push(sourceResult.output);
      }
    });

    return inputs;
  };

  // Edge'leri duruma göre güncelle
  const styledEdges = edges.map(edge => ({
    ...edge,
    style: getEdgeStyle(edge, executionResults),
    animated: executionResults[edge.source]?.status === 'running',
    type: 'smoothstep',
  }));

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
        </div>
        <div className="text-sm font-medium">AI Agent Akışı</div>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => {
              const selectedNodes = nodes.filter(node => node.selected);
              if (selectedNodes.length > 0) {
                selectedNodes.forEach(node => dispatch(removeNode(node.id)));
                toast.success('Seçili node\'lar silindi');
              }
            }}
            disabled={!nodes.some(node => node.selected)}
          >
            Seçili Node'ları Sil
          </Button>
        </div>
      </div>

      {/* Flow Alanı */}
      <div style={{ height: 'calc(100vh - 48px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodeDelete}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="dark:bg-background"
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Control', 'Meta']}
          selectionKeyCode={['Shift']}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 2 },
          }}
        >
          <Controls className="dark:bg-background dark:text-foreground dark:border-border" />
          <MiniMap className="dark:bg-background" />
          <Background gap={12} size={1} className="dark:bg-muted" />
        </ReactFlow>
      </div>

      <style jsx global>{`
        @keyframes flowEdgePulse {
          0% {
            stroke-opacity: 1;
          }
          50% {
            stroke-opacity: 0.5;
          }
          100% {
            stroke-opacity: 1;
          }
        }

        .react-flow__edge-path {
          transition: stroke 0.3s ease, stroke-opacity 0.3s ease;
        }
      `}</style>
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