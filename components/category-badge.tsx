'use client';

import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

const categoryColors: Record<string, string> = {
  Food: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
  Transport: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20',
  Education: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/20',
  Shopping: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/20',
  Entertainment: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20',
  Bills: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/20',
  Health: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  Travel: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
  Other: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/20',
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        categoryColors[category] || categoryColors.Other
      )}
    >
      {category}
    </span>
  );
}
