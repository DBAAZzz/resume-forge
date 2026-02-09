import { useCallback, useMemo, useRef, useState } from 'react';

import { BaseDialog } from '@/components/base';
import { cn } from '@/utils/classnames';

import {
  DialogContext,
  type ConfirmOptions,
  type DialogContextValue,
  type DialogOptions,
} from './context';

import type { ReactNode } from 'react';

interface DialogState {
  open: boolean;
  options: DialogOptions | null;
}

const getActionClassName = (variant: 'primary' | 'secondary' | 'danger' = 'secondary') => {
  switch (variant) {
    case 'primary':
      return 'rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800';
    case 'danger':
      return 'rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500';
    case 'secondary':
    default:
      return 'rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100';
  }
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DialogState>({
    open: false,
    options: null,
  });
  const resolverRef = useRef<((actionKey: string) => void) | null>(null);

  const resolveAndClose = useCallback((actionKey: string) => {
    resolverRef.current?.(actionKey);
    resolverRef.current = null;
    setState((prevState) =>
      prevState.open
        ? {
            ...prevState,
            open: false,
          }
        : prevState
    );
  }, []);

  const handleAfterLeave = useCallback(() => {
    setState((prevState) =>
      prevState.open || !prevState.options
        ? prevState
        : {
            ...prevState,
            options: null,
          }
    );
  }, []);

  const openDialog = useCallback((options: DialogOptions): Promise<string> => {
    resolverRef.current?.(options.dismissActionKey ?? 'dismiss');

    setState({
      open: true,
      options,
    });

    return new Promise<string>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const closeDialog = useCallback(
    (actionKey = state.options?.dismissActionKey ?? 'dismiss') => {
      resolveAndClose(actionKey);
    },
    [resolveAndClose, state.options]
  );

  const confirm = useCallback(
    async ({
      title,
      description,
      content,
      confirmLabel = '确认',
      cancelLabel = '取消',
      danger = false,
      dismissible = true,
      panelClassName,
    }: ConfirmOptions): Promise<boolean> => {
      const result = await openDialog({
        title,
        description,
        content,
        dismissible,
        panelClassName,
        actions: [
          { key: 'cancel', label: cancelLabel, variant: 'secondary' },
          { key: 'confirm', label: confirmLabel, variant: danger ? 'danger' : 'primary' },
        ],
      });

      return result === 'confirm';
    },
    [openDialog]
  );

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      openDialog,
      closeDialog,
      confirm,
    }),
    [openDialog, closeDialog, confirm]
  );

  const actions = state.options?.actions ?? [];
  const dismissible = state.options?.dismissible ?? true;
  const dismissActionKey = state.options?.dismissActionKey ?? 'dismiss';
  const showCloseButton = state.options?.showCloseButton ?? dismissible;

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <BaseDialog
        open={state.open}
        onAfterLeave={handleAfterLeave}
        onClose={(nextOpen) => {
          if (nextOpen) return;
          if (!dismissible) return;
          closeDialog(dismissActionKey);
        }}
        title={state.options?.title}
        description={state.options?.description}
        panelClassName={cn('max-w-2xl', state.options?.panelClassName)}
        bodyClassName={cn('space-y-3', state.options?.bodyClassName)}
        footerClassName={state.options?.footerClassName}
        showCloseButton={showCloseButton}
        footer={
          actions.length > 0 ? (
            <>
              {actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  autoFocus={action.autoFocus}
                  disabled={action.disabled}
                  className={cn(
                    getActionClassName(action.variant),
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                  onClick={async () => {
                    try {
                      const shouldContinue = await action.onClick?.();
                      if (shouldContinue === false) {
                        return;
                      }
                    } catch (error) {
                      console.error('Dialog action failed', error);
                      return;
                    }

                    if (action.closeOnClick ?? true) {
                      closeDialog(action.key);
                    }
                  }}
                >
                  {action.label}
                </button>
              ))}
            </>
          ) : null
        }
      >
        {state.options?.content}
      </BaseDialog>
    </DialogContext.Provider>
  );
};

DialogProvider.displayName = 'DialogProvider';
