import { FamilyTreeNode } from '@/types/genetics'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface FamilyTreeProps {
  tree: FamilyTreeNode
  maxDepth?: number
}

export function FamilyTree({ tree, maxDepth = 3 }: FamilyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderNode = (node: FamilyTreeNode, depth: number) => {
    const isExpanded = expandedNodes.has(node.pet.id)
    const hasChildren = node.children && node.children.length > 0
    const hasParents = node.parents && node.parents.length > 0
    const canExpand = (hasChildren || hasParents) && depth < maxDepth

    return (
      <div key={node.pet.id} className="flex flex-col items-center">
        {/* Pet Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-3 rounded-xl space-y-2 cursor-pointer hover:bg-white/10 transition"
          onClick={() => canExpand && toggleNode(node.pet.id)}
        >
          {/* Color Preview */}
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg shadow"
              style={{ background: node.pet.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {node.pet.name}
              </p>
              <p className="text-white/40 text-xs capitalize">{node.pet.stage}</p>
            </div>
          </div>

          {/* Generation Badge */}
          {node.pet.generation !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">Gen</span>
              <span className="text-white text-xs font-medium">{node.pet.generation}</span>
            </div>
          )}

          {/* Expand Indicator */}
          {canExpand && (
            <div className="flex justify-center">
              <span className="text-white/40 text-xs">
                {isExpanded ? '▼' : '▶'} {hasChildren ? 'Children' : 'Parents'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Children/Parents */}
        {isExpanded && canExpand && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="flex gap-2 justify-center">
              {(hasChildren ? node.children : node.parents)?.map((child) => (
                <div key={child.pet.id} className="flex-1">
                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white font-bold">Family Tree</h3>
      <div className="flex justify-center">
        {renderNode(tree, 0)}
      </div>
    </div>
  )
}

interface FamilyTreeListProps {
  trees: FamilyTreeNode[]
  maxDepth?: number
}

export function FamilyTreeList({ trees, maxDepth = 3 }: FamilyTreeListProps) {
  return (
    <div className="space-y-6">
      {trees.map((tree) => (
        <FamilyTree key={tree.pet.id} tree={tree} maxDepth={maxDepth} />
      ))}
    </div>
  )
}