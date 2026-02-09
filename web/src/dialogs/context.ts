import { createContext } from 'react';

import type { ReactNode } from 'react';

export type DialogActionVariant = 'primary' | 'secondary' | 'danger';

export interface DialogAction {
  key: string;
  label: string;
  variant?: DialogActionVariant;
  disabled?: boolean;
  autoFocus?: boolean;
  closeOnClick?: boolean;
  onClick?: () => boolean | void | Promise<boolean | void>;
}

export interface DialogOptions {
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  actions?: DialogAction[];
  dismissActionKey?: string;
  dismissible?: boolean;
  showCloseButton?: boolean;
  panelClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

export interface ConfirmOptions {
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  dismissible?: boolean;
  panelClassName?: string;
}

export interface DialogContextValue {
  openDialog: (options: DialogOptions) => Promise<string>;
  closeDialog: (actionKey?: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
