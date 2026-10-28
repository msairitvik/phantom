import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';
import { DirectoryNode, Severity } from '../../types';

interface ProjectTreeProps {
  node: DirectoryNode;
  onSelectFile?: (filePath: string) => void;
  selectedFile?: string | null;
}

const TreeNode: React.FC<{
  node: DirectoryNode;
  onSelectFile?: (filePath: string) => void;
  selectedFile?: string | null;
  depth?: number;
}> = ({ node, onSelectFile, selectedFile, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isDir = node.type === 'directory';
  const isSelected = selectedFile === node.path;

  const severityDot = (sev?: Severity | null) => {
    if (!sev) return null;
    const colors: Record<Severity, string> = {
      Critical: 'bg-phantom-crimson shadow-[0_0_6px_#FF365E]',
      High: 'bg-phantom-pink shadow-[0_0_6px_#FF3CAC]',
      Medium: 'bg-phantom-amber',
      Low: 'bg-phantom-purple',
      Informational: 'bg-phantom-cyan'
    };
    return <span className={`w-2 h-2 rounded-full shrink-0 ${colors[sev]}`} title={`${sev} Finding`} />;
  };

  return (
    <div className="select-none font-mono text-xs">
      <div
        onClick={() => {
          if (isDir) {
            setIsOpen(!isOpen);
          } else if (onSelectFile) {
            onSelectFile(node.path);
          }
        }}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-phantom-purple/30 text-white font-semibold'
            : 'hover:bg-phantom-purple/10 text-phantom-lavender/80 hover:text-white'
        }`}
      >
        {isDir ? (
          <>
            <span className="text-phantom-muted">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
            <span className="text-phantom-amber">
              {isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            </span>
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <FileCode className="w-4 h-4 text-phantom-cyan" />
          </>
        )}

        <span className="truncate flex-1">{node.name}</span>

        {/* File finding alert dot */}
        {severityDot(node.finding_severity)}

        {!isDir && node.size !== undefined && (
          <span className="text-[10px] text-phantom-muted shrink-0">
            {node.size > 1024 ? `${Math.round(node.size / 1024)}KB` : `${node.size}B`}
          </span>
        )}
      </div>

      {isDir && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <TreeNode
              key={`${child.path}-${idx}`}
              node={child}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProjectTree: React.FC<ProjectTreeProps> = ({
  node,
  onSelectFile,
  selectedFile
}) => {
  return (
    <div className="p-3 bg-black/40 rounded-2xl border border-phantom-purple/20 max-h-96 overflow-y-auto">
      <TreeNode node={node} onSelectFile={onSelectFile} selectedFile={selectedFile} />
    </div>
  );
};
