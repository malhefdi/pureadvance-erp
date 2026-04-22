'use client';

import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  Handle,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { processStages, equipment, batches } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Clock, Cog, FlaskConical } from 'lucide-react';

// Custom node component
function ProcessNode({ data }: NodeProps) {
  const stage = data as {
    name: string;
    description: string;
    zone: string;
    duration?: string;
    qcRequired?: boolean;
    equipmentCount: number;
    activeBatches: number;
  };

  const zoneColors: Record<string, { bg: string; border: string; text: string }> = {
    upstream: { bg: 'bg-emerald-950/50', border: 'border-emerald-500/40', text: 'text-emerald-400' },
    downstream: { bg: 'bg-blue-950/50', border: 'border-blue-500/40', text: 'text-blue-400' },
    formulation: { bg: 'bg-amber-950/50', border: 'border-amber-500/40', text: 'text-amber-400' },
    packaging: { bg: 'bg-purple-950/50', border: 'border-purple-500/40', text: 'text-purple-400' },
    qc: { bg: 'bg-red-950/50', border: 'border-red-500/40', text: 'text-red-400' },
    warehouse: { bg: 'bg-cyan-950/50', border: 'border-cyan-500/40', text: 'text-cyan-400' },
  };

  const colors = zoneColors[stage.zone] || zoneColors.upstream;

  return (
    <div className={cn(
      'px-4 py-3 rounded-xl border-2 min-w-[180px] max-w-[220px]',
      colors.bg,
      colors.border,
    )}>
      <Handle type="target" position={Position.Left} className="!bg-violet-500 !w-3 !h-3 !border-2 !border-zinc-900" />
      <Handle type="source" position={Position.Right} className="!bg-violet-500 !w-3 !h-3 !border-2 !border-zinc-900" />

      <div className="flex items-center gap-2 mb-1">
        <div className={cn('text-xs font-bold uppercase tracking-wider', colors.text)}>
          {stage.zone}
        </div>
        {stage.qcRequired && (
          <FlaskConical className="w-3 h-3 text-red-400" />
        )}
      </div>
      <div className="text-sm font-semibold text-white mb-1">{stage.name}</div>
      <div className="text-[10px] text-zinc-400 leading-relaxed">{stage.description}</div>

      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-700/50">
        {stage.duration && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            <Clock className="w-3 h-3" />
            {stage.duration}
          </div>
        )}
        {stage.equipmentCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            <Cog className="w-3 h-3" />
            {stage.equipmentCount} eq.
          </div>
        )}
        {stage.activeBatches > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-violet-400">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            {stage.activeBatches} active
          </div>
        )}
      </div>
    </div>
  );
}

const nodeTypes = { process: ProcessNode };

export function ProcessFlow() {
  const { initialNodes, initialEdges } = useMemo(() => {
    const activeBatches = batches.filter(b => ['in_progress', 'qc_pending'].includes(b.status));

    const nodes: Node[] = processStages.map((stage, i) => {
      const stageEquipment = stage.equipment ? stage.equipment.map(id => equipment.find(e => e.id === id)).filter(Boolean) : [];
      const batchCount = activeBatches.filter(b => {
        const s = b.currentStage.toLowerCase();
        return stage.name.toLowerCase().split(' ').some(word => s.includes(word));
      }).length;

      const col = i < 4 ? 0 : i < 6 ? 1 : i < 9 ? 2 : i < 12 ? 3 : 4;
      const row = i < 4 ? i : i < 6 ? i - 4 : i < 9 ? i - 6 : i < 12 ? i - 9 : i - 12;

      return {
        id: stage.id,
        type: 'process',
        position: { x: col * 260 + 40, y: row * 120 + 40 },
        data: {
          name: stage.name,
          description: stage.description,
          zone: stage.zone,
          duration: stage.duration,
          qcRequired: stage.qcRequired,
          equipmentCount: stageEquipment.length,
          activeBatches: batchCount,
        },
      };
    });

    const edges: Edge[] = [];
    for (let i = 0; i < processStages.length - 1; i++) {
      // Skip edges that cross between different columns in the same row
      const _currentCol = i < 4 ? 0 : i < 6 ? 1 : i < 9 ? 2 : i < 12 ? 3 : 4;
      const _nextCol = (i + 1) < 4 ? 0 : (i + 1) < 6 ? 1 : (i + 1) < 9 ? 2 : (i + 1) < 12 ? 3 : 4;

      edges.push({
        id: `e-${processStages[i].id}-${processStages[i + 1].id}`,
        source: processStages[i].id,
        target: processStages[i + 1].id,
        animated: activeBatches.some(b => b.currentStage.toLowerCase().includes(processStages[i].name.toLowerCase().split(' ')[0])),
        style: { stroke: '#6d28d9', strokeWidth: 2 },
      });
    }

    // Also connect QC nodes to their preceding stages
    const qc1 = processStages.find(s => s.id === 'ps-qc1');
    const homo = processStages.find(s => s.id === 'ps-homo');
    if (qc1 && homo) {
      // Edge already exists via sequential, but let's add QC2
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, []);

  const [_nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [_edges, _setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[600px] bg-zinc-900/50 rounded-2xl border border-zinc-800">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-zinc-900/50"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={20} />
        <Controls className="!bg-zinc-800 !border-zinc-700 !rounded-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-700" />
        <MiniMap
          nodeColor="#6d28d9"
          maskColor="rgba(0,0,0,0.7)"
          className="!bg-zinc-900 !border-zinc-700 !rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}
