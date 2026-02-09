import { cn } from '@/utils/classnames';

import { type VendorOption } from './modelConfig';

interface VendorCardProps {
  option: VendorOption;
  selected: boolean;
  onSelect: () => void;
}

export const VendorCard = ({ option, selected, onSelect }: VendorCardProps) => {
  const isAvailable = option.status === 'available';

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={onSelect}
      className={cn(
        'group relative w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200',
        selected
          ? 'border-black bg-gray-50 text-gray-900 shadow-[0_8px_20px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/5'
          : 'border-gray-200 bg-white text-gray-900',
        isAvailable
          ? selected
            ? 'hover:border-black hover:bg-gray-100'
            : 'hover:border-gray-300 hover:bg-gray-50'
          : 'cursor-not-allowed opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
              selected ? 'border-black/10 bg-white' : 'border-gray-200 bg-gray-50'
            )}
          >
            <img
              src={option.iconUrl}
              alt={`${option.label} logo`}
              className={cn(
                'h-5 w-5 object-contain',
                option.value === 'openai' && !selected ? 'rounded-sm bg-black p-0.5' : ''
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{option.label}</p>
            <p
              className={cn(
                'whitespace-nowrap text-xs',
                selected ? 'text-gray-600' : 'text-gray-500'
              )}
            >
              {option.description}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
            isAvailable
              ? selected
                ? 'bg-black text-white'
                : 'bg-emerald-50 text-emerald-600'
              : selected
                ? 'bg-gray-900 text-white'
                : 'bg-amber-50 text-amber-600'
          )}
        >
          {isAvailable ? 'Available' : 'Preview'}
        </span>
      </div>

      {option.previewModels?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {option.previewModels.map((previewModel) => (
            <span
              key={previewModel}
              className={cn(
                'rounded-md border px-2 py-1 font-mono text-[10px]',
                selected
                  ? 'border-black/10 bg-white text-gray-700'
                  : 'border-gray-200 bg-gray-100 text-gray-500'
              )}
            >
              {previewModel}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
};
