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
import { addNode, updateNodePosition, addEdge, removeNode, removeEdge } from '@/store/slices/flowSlice';
import { AgentType, AgentNode, NodeType } from '@/store/types';
import { createDefaultAgentConfig } from '@/store/defaultConfigs';
import AIAgentNode from './AIAgentNode';
import 'reactflow/dist/style.css';

const nodeTypes = {
  aiAgent: AIAgentNode,
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
      
      dispatch(addEdge({
        id: `e${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
      }));
    },
    [dispatch],
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
        type: 'aiAgent' as NodeType,
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

  return (
    <div className="w-full h-full">
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
  );
}

export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
} 