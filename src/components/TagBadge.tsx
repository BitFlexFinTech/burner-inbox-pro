import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface InboxTag {
  id: string;
  name: string;
  color: string;
}

export const INBOX_TAGS: InboxTag[] = [
  { id: 'shopping', name: 'Shopping', color: 'bg-blue-500' },
  { id: 'social', name: 'Social', color: 'bg-pink-500' },
  { id: 'finance', name: 'Finance', color: 'bg-green-500' },
  { id: 'gaming', name: 'Gaming', color: 'bg-purple-500' },
  { id: 'work', name: 'Work', color: 'bg-orange-500' },
  { id: 'other', name: 'Other', color: 'bg-muted-foreground' },
];

export function getTagById(id: string): InboxTag | undefined {
  return INBOX_TAGS.find(t => t.id === id);
}

interface TagBadgeProps {
  tag: InboxTag;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function TagBadge({ tag, onRemove, className, size = 'sm' }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        tag.color,
        'text-white',
        className
      )}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-white/20 rounded-full p-0.5"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}
