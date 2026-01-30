import { ButtonHTMLAttributes } from 'react';

interface TactileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'rose' | 'emerald' | 'sky' | 'amber' | 'li-primary' | 'purple' | 'indigo';
  children: React.ReactNode;
}

const variantStyles = {
  rose: 'bg-rose-500 hover:bg-rose-600',
  emerald: 'bg-emerald-500 hover:bg-emerald-600',
  sky: 'bg-sky-500 hover:bg-sky-600',
  amber: 'bg-amber-500 hover:bg-amber-600',
  purple: 'bg-purple-600 hover:bg-purple-700',
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  'li-primary': 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700', // 理想品牌主色
};

export default function TactileButton({
  variant = 'sky',
  children,
  className = '',
  disabled,
  ...props
}: TactileButtonProps) {
  return (
    <button
      className={`
        relative px-6 py-3 rounded-2xl
        font-bold text-white text-lg
        border-b-[6px] border-[#002D28] transition-all duration-75
        shadow-lg
        active:translate-y-[6px] active:border-b-0
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:active:translate-y-0 disabled:active:border-b-[6px]
        ${variantStyles[variant]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
