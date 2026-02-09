import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { Fragment } from 'react';

import { cn } from '@/utils/classnames';

import type { ReactNode } from 'react';

interface BaseDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  onAfterLeave?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  overlayClassName?: string;
  containerClassName?: string;
  panelClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  closeButtonClassName?: string;
  showCloseButton?: boolean;
}

export const BaseDialog = ({
  open,
  onClose,
  onAfterLeave,
  title,
  description,
  children,
  footer,
  className,
  overlayClassName,
  containerClassName,
  panelClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  titleClassName,
  descriptionClassName,
  closeButtonClassName,
  showCloseButton = true,
}: BaseDialogProps) => {
  const showHeader = Boolean(title) || Boolean(description) || showCloseButton;

  return (
    <Transition show={open} appear as={Fragment} afterLeave={onAfterLeave}>
      <Dialog as="div" onClose={onClose} className={cn('relative z-50', className)}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-75"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={cn('fixed inset-0 bg-black/30 backdrop-blur-[2px]', overlayClassName)}
            aria-hidden="true"
          />
        </TransitionChild>

        <div
          className={cn('fixed inset-0 flex items-center justify-center p-4', containerClassName)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-75"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              className={cn(
                'w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white text-sm shadow-2xl',
                panelClassName
              )}
            >
              {showHeader ? (
                <div
                  className={cn(
                    'flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4',
                    headerClassName
                  )}
                >
                  <div>
                    {title ? (
                      <DialogTitle
                        className={cn(
                          'text-lg font-semibold tracking-tight text-gray-900',
                          titleClassName
                        )}
                      >
                        {title}
                      </DialogTitle>
                    ) : null}
                    {description ? (
                      <Description
                        className={cn('mt-1 text-xs text-gray-500', descriptionClassName)}
                      >
                        {description}
                      </Description>
                    ) : null}
                  </div>

                  {showCloseButton ? (
                    <button
                      type="button"
                      onClick={() => onClose(false)}
                      className={cn(
                        'rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700',
                        closeButtonClassName
                      )}
                      aria-label="关闭弹窗"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className={cn('p-6', bodyClassName)}>{children}</div>

              {footer ? (
                <div
                  className={cn(
                    'flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4',
                    footerClassName
                  )}
                >
                  {footer}
                </div>
              ) : null}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

BaseDialog.displayName = 'BaseDialog';
