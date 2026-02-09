import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { DialogProvider } from '@/dialogs';

import router from './router';

function App() {
  return (
    <DialogProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </DialogProvider>
  );
}

export default App;
