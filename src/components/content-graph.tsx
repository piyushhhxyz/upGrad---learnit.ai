"use client";

import React, { useCallback, useMemo, useState } from 'react';
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    Background,
    ReactFlowProvider,
    useStoreApi,
    useReactFlow,
    Node,
    Edge,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import contentData from '../../demo-data/content.json';

const MIN_DISTANCE = 150;

// Custom node component
const CustomNode = ({ data }: { data: any }) => {
    const [showTooltip, setShowTooltip] = React.useState(false);

    return (
        <div
            className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 min-w-[200px] max-w-[300px] relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Source handle (for outgoing edges) */}
            <Handle
                type="source"
                position={Position.Right}
                id="source"
                style={{ background: '#6366f1', width: 8, height: 8 }}
            />

            {/* Target handle (for incoming edges) */}
            <Handle
                type="target"
                position={Position.Left}
                id="target"
                style={{ background: '#10b981', width: 8, height: 8 }}
            />

            <div className="flex">
                <div className={`rounded-full w-3 h-3 mr-3 mt-1 ${data.type === 'root' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                <div>
                    <div className="text-lg font-bold text-gray-700">{data.title}</div>
                </div>
            </div>

            {/* Tooltip for summary */}
            {showTooltip && (
                <div className="absolute z-10 w-80 p-4 mt-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg shadow-xl left-0 top-full">
                    <div className="font-semibold mb-2 text-gray-900 text-base">{data.title}</div>
                    <div className="text-gray-600 leading-relaxed">{data.summary}</div>
                </div>
            )}
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};


const Flow = () => {
    const store = useStoreApi();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { getInternalNode } = useReactFlow();

    // Initialize nodes and edges from content data
    const initialNodes: Node[] = useMemo(() => {
        return contentData.map((item) => ({
            id: item.id.toString(),
            type: 'custom',
            position: item.position,
            data: {
                title: item.title,
                summary: item.summary,
                objectives: item.objectives,
                type: item.type,
            },
        }));
    }, []);

    const initialEdges: Edge[] = useMemo(() => {
        const edges: Edge[] = [];

        // 0 -> 1 (root to top-right node)
        edges.push({
            id: 'edge-0-1',
            source: '0',
            sourceHandle: 'source',
            target: '1',
            targetHandle: 'target',
            type: 'default',
            animated: true,
            style: {
                stroke: '#6366f1',
                strokeWidth: 3,
            },
        });

        // 0 -> 2 (root to bottom-right node)
        edges.push({
            id: 'edge-0-2',
            source: '0',
            sourceHandle: 'source',
            target: '2',
            targetHandle: 'target',
            type: 'default',
            animated: true,
            style: {
                stroke: '#6366f1',
                strokeWidth: 3,
            },
        });

        // 1 -> 3 (top-right node to far-right top node)
        edges.push({
            id: 'edge-1-3',
            source: '1',
            sourceHandle: 'source',
            target: '3',
            targetHandle: 'target',
            type: 'default',
            animated: true,
            style: {
                stroke: '#10b981',
                strokeWidth: 3,
            },
        });

        // 2 -> 4 (bottom-right node to far-right bottom node)
        edges.push({
            id: 'edge-2-4',
            source: '2',
            sourceHandle: 'source',
            target: '4',
            targetHandle: 'target',
            type: 'default',
            animated: true,
            style: {
                stroke: '#f59e0b',
                strokeWidth: 3,
            },
        });

        return edges;
    }, []);

    // Set initial nodes and edges
    React.useEffect(() => {
        console.log('Setting initial nodes:', initialNodes);
        console.log('Setting initial edges:', initialEdges);
        console.log('Content data length:', contentData.length);
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const getClosestEdge = useCallback((node: any) => {
        const { nodeLookup } = store.getState();
        const internalNode = getInternalNode(node.id);

        const closestNode = Array.from(nodeLookup.values()).reduce(
            (res, n) => {
                if (n.id !== internalNode.id) {
                    const dx =
                        n.internals.positionAbsolute.x -
                        internalNode.internals.positionAbsolute.x;
                    const dy =
                        n.internals.positionAbsolute.y -
                        internalNode.internals.positionAbsolute.y;
                    const d = Math.sqrt(dx * dx + dy * dy);

                    if (d < res.distance && d < MIN_DISTANCE) {
                        res.distance = d;
                        res.node = n;
                    }
                }

                return res;
            },
            {
                distance: Number.MAX_VALUE,
                node: null,
            },
        );

        if (!closestNode.node) {
            return null;
        }

        const closeNodeIsSource =
            closestNode.node.internals.positionAbsolute.x <
            internalNode.internals.positionAbsolute.x;

        return {
            id: closeNodeIsSource
                ? `${closestNode.node.id}-${node.id}`
                : `${node.id}-${closestNode.node.id}`,
            source: closeNodeIsSource ? closestNode.node.id : node.id,
            target: closeNodeIsSource ? node.id : closestNode.node.id,
        };
    }, [store, getInternalNode]);

    const onNodeDrag = useCallback(
        (_, node: any) => {
            const closeEdge = getClosestEdge(node);

            setEdges((es) => {
                const nextEdges = es.filter((e) => e.className !== 'temp');

                if (
                    closeEdge &&
                    !nextEdges.find(
                        (ne) =>
                            ne.source === closeEdge.source && ne.target === closeEdge.target,
                    )
                ) {
                    closeEdge.className = 'temp';
                    nextEdges.push(closeEdge);
                }

                return nextEdges;
            });
        },
        [getClosestEdge, setEdges],
    );

    const onNodeDragStop = useCallback(
        (_, node: any) => {
            const closeEdge = getClosestEdge(node);

            setEdges((es) => {
                const nextEdges = es.filter((e) => e.className !== 'temp');

                if (
                    closeEdge &&
                    !nextEdges.find(
                        (ne) =>
                            ne.source === closeEdge.source && ne.target === closeEdge.target,
                    )
                ) {
                    nextEdges.push(closeEdge);
                }

                return nextEdges;
            });
        },
        [getClosestEdge],
    );

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-50"
                defaultEdgeOptions={{
                    type: 'default',
                    animated: true,
                    style: { stroke: '#6366f1', strokeWidth: 3 },
                }}
            >
                <Background color="#aaa" gap={16} />
            </ReactFlow>
        </div>
    );
};

const ContentGraph = () => (
    <ReactFlowProvider>
        <Flow />
    </ReactFlowProvider>
);

export default ContentGraph;
