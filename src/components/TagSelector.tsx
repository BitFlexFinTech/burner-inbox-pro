import { useState } from 'react';
import { Check, Tag, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { INBOX_TAGS, InboxTag, TagBadge } from './TagBadge';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function TagSelector({ 
  selectedTags, 
  onTagsChange, 
  trigger,
  className,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(t => t !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn('h-7 px-2', className)}
            onClick={(e) => e.stopPropagation()}
          >
            <Tag className="h-3.5 w-3.5" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-48 p-2" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
          Select tags
        </div>
        <div className="space-y-1">
          {INBOX_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                  'hover:bg-muted transition-colors',
                  isSelected && 'bg-muted'
                )}
              >
                <span className={cn('w-3 h-3 rounded-full', tag.color)} />
                <span className="flex-1 text-left">{tag.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface BulkTagSelectorProps {
  onApplyTags: (tags: string[]) => void;
  className?: string;
}

export function BulkTagSelector({ onApplyTags, className }: BulkTagSelectorProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onApplyTags(selectedTags);
    setSelectedTags([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Tag className="h-3.5 w-3.5 mr-1.5" />
          Add Tags
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
          Add tags to selected
        </div>
        <div className="space-y-1 mb-2">
          {INBOX_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedTags(selectedTags.filter(t => t !== tag.id));
                  } else {
                    setSelectedTags([...selectedTags, tag.id]);
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                  'hover:bg-muted transition-colors',
                  isSelected && 'bg-muted'
                )}
              >
                <span className={cn('w-3 h-3 rounded-full', tag.color)} />
                <span className="flex-1 text-left">{tag.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
        <Button 
          size="sm" 
          className="w-full" 
          onClick={handleApply}
          disabled={selectedTags.length === 0}
        >
          Apply Tags
        </Button>
      </PopoverContent>
    </Popover>
  );
}
