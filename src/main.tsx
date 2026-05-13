import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import SchoolContextProvider from './Context/SchoolContextProvider.tsx';
// import { AuthProvider } from './Context/AuthProvider.tsx';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.ts';
import { store } from './features/store/store.ts';
// import { store } from './New_Version/features/store/store.ts';
// import { queryClient } from './New_Version/lib/queryClient.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store} >
      <QueryClientProvider client={queryClient}>
        {/* <AuthProvider> */}
          {/* <SchoolContextProvider> */}

            <App />

          {/* </SchoolContextProvider> */}
        {/* </AuthProvider> */}
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
