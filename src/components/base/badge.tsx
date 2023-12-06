import { cn } from '@/libs/cn.lib';
import { VariantProps, cva } from 'class-variance-authority';

export type BadgeProps = {
  children: React.ReactNode;
  color: NonNullable<VariantProps<typeof badgeClass>['color']>;
  variant?: VariantProps<typeof badgeClass>['variant'];
  className?: string;
};

export function Badge({ children, color, variant = 'solid', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 h-fit',
        badgeClass({ color, variant }),
        className,
      )}
    >
      {variant === 'outline' && <span className={badgeIndicatorClass({ color })} />}
      {children}
    </span>
  );
}

const badgeClass = cva('rounded-full px-2 py-1 text-xs font-medium inline-flex', {
  variants: {
    variant: {
      solid: '',
      soft: '',
      outline: 'bg-white items-center gap-x-2',
    },
    color: {
      slate: 'text-slate-900',
      gray: 'text-gray-900',
      zinc: 'text-zinc-900',
      neutral: 'text-neutral-900',
      stone: 'text-stone-900',
      red: 'text-red-900',
      orange: 'text-orange-900',
      amber: 'text-amber-900',
      yellow: 'text-yellow-900',
      lime: 'text-lime-900',
      green: 'text-green-900',
      emerald: 'text-emerald-900',
      teal: 'text-teal-900',
      cyan: 'text-cyan-900',
      sky: 'text-sky-900',
      blue: 'text-blue-900',
      indigo: 'text-indigo-900',
      violet: 'text-violet-900',
      purple: 'text-purple-900',
      fuchsia: 'text-fuchsia-900',
      pink: 'text-pink-900',
      rose: 'text-rose-900',
    },
  },
  compoundVariants: [
    {
      variant: ['solid', 'outline'],
      color: 'slate',
      className: 'shadow-haptic-sm-slate-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'gray',
      className: 'shadow-haptic-sm-gray-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'zinc',
      className: 'shadow-haptic-sm-zinc-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'neutral',
      className: 'shadow-haptic-sm-neutral-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'stone',
      className: 'shadow-haptic-sm-stone-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'red',
      className: 'shadow-haptic-sm-red-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'orange',
      className: 'shadow-haptic-sm-orange-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'amber',
      className: 'shadow-haptic-sm-amber-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'yellow',
      className: 'shadow-haptic-sm-yellow-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'lime',
      className: 'shadow-haptic-sm-lime-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'green',
      className: 'shadow-haptic-sm-green-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'emerald',
      className: 'shadow-haptic-sm-emerald-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'teal',
      className: 'shadow-haptic-sm-teal-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'cyan',
      className: 'shadow-haptic-sm-cyan-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'sky',
      className: 'shadow-haptic-sm-sky-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'blue',
      className: 'shadow-haptic-sm-blue-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'indigo',
      className: 'shadow-haptic-sm-indigo-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'violet',
      className: 'shadow-haptic-sm-violet-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'purple',
      className: 'shadow-haptic-sm-purple-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'fuchsia',
      className: 'shadow-haptic-sm-fuchsia-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'pink',
      className: 'shadow-haptic-sm-pink-900',
    },
    {
      variant: ['solid', 'outline'],
      color: 'rose',
      className: 'shadow-haptic-sm-rose-900',
    },
    {
      variant: ['solid', 'soft'],
      color: 'slate',
      className: 'bg-slate-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'gray',
      className: 'bg-gray-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'zinc',
      className: 'bg-zinc-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'neutral',
      className: 'bg-neutral-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'stone',
      className: 'bg-stone-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'red',
      className: 'bg-red-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'orange',
      className: 'bg-orange-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'amber',
      className: 'bg-amber-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'yellow',
      className: 'bg-yellow-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'lime',
      className: 'bg-lime-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'green',
      className: 'bg-green-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'emerald',
      className: 'bg-emerald-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'teal',
      className: 'bg-teal-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'cyan',
      className: 'bg-cyan-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'sky',
      className: 'bg-sky-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'blue',
      className: 'bg-blue-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'indigo',
      className: 'bg-indigo-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'violet',
      className: 'bg-violet-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'purple',
      className: 'bg-purple-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'fuchsia',
      className: 'bg-fuchsia-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'pink',
      className: 'bg-pink-50',
    },
    {
      variant: ['solid', 'soft'],
      color: 'rose',
      className: 'bg-rose-50',
    },
  ],
});

const badgeIndicatorClass = cva('h-[0.3rem] w-[0.3rem] rounded-full', {
  variants: {
    color: {
      slate: 'bg-slate-900 shadow-haptic-sm-slate-900',
      gray: 'bg-gray-900 shadow-haptic-sm-gray-900',
      zinc: 'bg-zinc-900 shadow-haptic-sm-zinc-900',
      neutral: 'bg-neutral-900 shadow-haptic-sm-neutral-900',
      stone: 'bg-stone-900 shadow-haptic-sm-stone-900',
      red: 'bg-red-900 shadow-haptic-sm-red-900',
      orange: 'bg-orange-900 shadow-haptic-sm-orange-900',
      amber: 'bg-amber-900 shadow-haptic-sm-amber-900',
      yellow: 'bg-yellow-900 shadow-haptic-sm-yellow-900',
      lime: 'bg-lime-900 shadow-haptic-sm-lime-900',
      green: 'bg-green-900 shadow-haptic-sm-green-900',
      emerald: 'bg-emerald-900 shadow-haptic-sm-emerald-900',
      teal: 'bg-teal-900 shadow-haptic-sm-teal-900',
      cyan: 'bg-cyan-900 shadow-haptic-sm-cyan-900',
      sky: 'bg-sky-900 shadow-haptic-sm-sky-900',
      blue: 'bg-blue-900 shadow-haptic-sm-blue-900',
      indigo: 'bg-indigo-900 shadow-haptic-sm-indigo-900',
      violet: 'bg-violet-900 shadow-haptic-sm-violet-900',
      purple: 'bg-purple-900 shadow-haptic-sm-purple-900',
      fuchsia: 'bg-fuchsia-900 shadow-haptic-sm-fuchsia-900',
      pink: 'bg-pink-900 shadow-haptic-sm-pink-900',
      rose: 'bg-rose-900 shadow-haptic-sm-rose-900',
    },
  },
});
