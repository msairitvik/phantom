import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { NeonButton } from './NeonButton';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            className="relative w-full max-w-md glass-panel p-6 rounded-2xl border border-phantom-purple/40 bg-[#120B24] shadow-2xl z-10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-4">
              <div className="flex items-center gap-2 text-phantom-amber">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">{title}</h3>
              </div>
              <button
                onClick={onCancel}
                className="text-phantom-muted hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-phantom-muted mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <NeonButton variant="ghost" size="sm" onClick={onCancel}>
                {cancelLabel}
              </NeonButton>
              <NeonButton
                variant={danger ? 'danger' : 'primary'}
                size="sm"
                onClick={onConfirm}
              >
                {confirmLabel}
              </NeonButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
