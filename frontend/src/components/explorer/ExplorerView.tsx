import React, { useState } from 'react';
import { FolderTree, Folder, FileCode, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { Investigation, Finding } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { ProjectTree } from '../scanner/ProjectTree';
import { EmptyState } from '../ui/EmptyState';
import { NeonButton } from '../ui/NeonButton';

interface ExplorerViewProps {
  currentInvestigation: Investigation | null;
  onNavigateToScan: () => void;
  onSelectFinding?: (f: Finding) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  currentInvestigation,
  onNavigateToScan,
  onSelectFinding
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (!currentInvestigation) {
    return (
      <EmptyState
        title="No Project Loaded"
        description="Launch an investigation scan on any workspace to inspect its full recursive directory tree, file extensions, and security hazard markers."
        action={
          <NeonButton variant="primary" size="md" onClick={onNavigateToScan}>
            Launch Investigation
          </NeonButton>
        }
      />
    );
  }

  // Find findings associated with the selected file
  const fileFindings = (currentInvestigation.findings || []).filter(
    (f) => selectedFile && f.file_path.toLowerCase() === selectedFile.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tree */}
        <div className="lg:col-span-5">
          <GlassCard>
            <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-phantom-cyan" />
                <h3 className="font-bold text-white text-base">Project Filesystem</h3>
              </div>
              <span className="text-xs font-mono text-phantom-muted">
                {currentInvestigation.total_files} files
              </span>
            </div>

            <ProjectTree
              node={{
                name: currentInvestigation.project_name,
                path: '',
                type: 'directory',
                children: (currentInvestigation as any).directory_tree?.children || []
              }}
              selectedFile={selectedFile}
              onSelectFile={(f) => setSelectedFile(f)}
            />
          </GlassCard>
        </div>

        {/* Right Column: Selected File Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard>
            <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-phantom-green" />
                <h3 className="font-bold text-white text-base">File Inspector</h3>
              </div>
              {selectedFile && (
                <span className="text-xs font-mono text-phantom-cyan truncate max-w-xs">
                  {selectedFile}
                </span>
              )}
            </div>

            {selectedFile ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-black/40 border border-phantom-purple/20 text-xs font-mono text-phantom-lavender">
                  <p className="text-phantom-muted mb-1">Path: <span className="text-white">{selectedFile}</span></p>
                  <p className="text-phantom-muted">Anomalies Detected: <span className={fileFindings.length > 0 ? 'text-phantom-crimson font-bold' : 'text-phantom-green'}>{fileFindings.length}</span></p>
                </div>

                {fileFindings.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase text-phantom-pink font-bold">
                      Flagged Security Issues:
                    </h4>
                    {fileFindings.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => onSelectFinding && onSelectFinding(f)}
                        className="p-4 rounded-xl bg-phantom-violet/40 border border-phantom-purple/30 hover:border-phantom-cyan cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{f.title}</span>
                          <span className="text-xs font-mono text-phantom-crimson font-semibold">{f.severity}</span>
                        </div>
                        <p className="text-xs text-phantom-muted">{f.explanation}</p>
                        <pre className="mt-2 p-2 rounded bg-black/60 font-mono text-[11px] text-phantom-green overflow-x-auto">
                          <code>{f.evidence}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs font-mono text-phantom-muted">
                    No security anomalies were flagged in this file.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-mono text-phantom-muted">
                Select a file from the tree to inspect findings.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
