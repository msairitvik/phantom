import React from 'react';
import { Loader2 } from 'lucide-react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'terminal' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base font-bold rounded-2xl gap-3'
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-phantom-purple via-purple-600 to-phantom-cyan text-white shadow-glow-purple hover:brightness-110 active:scale-95 border border-purple-400/30',
    secondary:
      'bg-phantom-violet/70 hover:bg-phantom-violet text-phantom-lavender border border-phantom-purple/40 hover:border-phantom-purple shadow-sm active:scale-95',
    ghost:
      'bg-transparent hover:bg-phantom-purple/10 text-phantom-lavender border border-transparent hover:border-phantom-purple/30',
    danger:
      'bg-gradient-to-r from-red-600 to-phantom-crimson text-white shadow-glow-crimson hover:brightness-110 active:scale-95 border border-red-500/40',
    terminal:
      'bg-black/80 hover:bg-black font-mono text-phantom-green border border-phantom-green/60 shadow-glow-green active:scale-95 hover:border-phantom-green',
    cyan:
      'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-glow-cyan hover:brightness-110 active:scale-95'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
