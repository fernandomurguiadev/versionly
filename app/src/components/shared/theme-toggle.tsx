'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light'  as const, icon: Sun,     label: 'Claro'   },
    { value: 'system' as const, icon: Monitor,  label: 'Sistema' },
    { value: 'dark'   as const, icon: Moon,     label: 'Oscuro'  },
  ];

  return (
    <div className={cn('flex items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-0.5', className)}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-all',
            theme === value
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
