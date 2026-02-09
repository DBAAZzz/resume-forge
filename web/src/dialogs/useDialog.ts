import { useContext } from 'react';

import { DialogContext } from './context';

export const useDialog = () => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }

  return context;
};
