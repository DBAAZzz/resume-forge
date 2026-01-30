import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Wand2 } from 'lucide-react';
import { useRef } from 'react';

const TagComponent = (props: NodeViewProps) => {
  const { node, selected } = props;
  const type = node.attrs.type || 'neutral';
  const reason = node.attrs.reason || '';
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const getTypeStyles = () => {
    switch (type) {
      case 'strength':
        return 'text-green-600';
      case 'weakness':
        return 'bg-red-50 text-neutral-700 underline decoration-dotted underline-offset-8 decoration-red-400';
      default:
        return selected
          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  const handleMouseEnter = (open: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!open) {
      buttonRef.current?.click();
    }
  };

  const handleMouseLeave = (open: boolean) => {
    if (open) {
      timeoutRef.current = setTimeout(() => {
        buttonRef.current?.click();
      }, 300);
    }
  };

  const TagContent = (
    <span
      className={`
          inline-flex items-center font-medium
          transition-colors duration-200 select-none cursor-pointer
          ${getTypeStyles()}
        `}
      data-id={node.attrs.id as string}
    >
      {node.attrs.label as string}
    </span>
  );

  if (type !== 'weakness' && type !== 'strength') {
    return (
      <NodeViewWrapper className="tag-node-view inline-block align-middle" as="span">
        {TagContent}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="tag-node-view inline-block align-middle" as="span">
      <Popover className="relative inline-block w-full">
        {({ open }) => (
          <div
            onMouseEnter={() => handleMouseEnter(open)}
            onMouseLeave={() => handleMouseLeave(open)}
          >
            <PopoverButton ref={buttonRef} className="w-full focus:outline-none" as="div">
              {TagContent}
            </PopoverButton>

            <PopoverPanel
              transition
              anchor={{ to: 'top', gap: 10 }}
              portal
              className="relative z-50 w-80 overflow-visible rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-xl ring-1 ring-black/5 transition duration-200 ease-out data-[closed]:translate-y-1 data-[closed]:opacity-0 "
            >
              {type === 'weakness' ? (
                <div className="flex flex-col gap-3 p-1">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    </div>
                    <span className="whitespace-normal text-sm leading-relaxed text-slate-600">
                      {node.attrs.reason || '建议优化此部分描述'}
                    </span>
                  </div>

                  <button
                    className="group flex w-fit items-center justify-center gap-1.5 rounded-md bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition-all hover:bg-purple-100 hover:text-purple-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      // AI action logic
                    }}
                  >
                    <Wand2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                    <span>AI 优化</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-1">
                  <span className="whitespace-normal text-sm leading-relaxed text-slate-600">
                    {reason || 'Great highlight!'}
                  </span>
                </div>
              )}
            </PopoverPanel>
          </div>
        )}
      </Popover>
    </NodeViewWrapper>
  );
};

export default TagComponent;
