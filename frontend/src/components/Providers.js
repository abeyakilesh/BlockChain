'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            className: '!bg-white dark:!bg-dark-900 !text-slate-900 dark:!text-slate-100 !border !border-slate-200 dark:!border-white/10 !backdrop-blur-xl',
            success: {
              iconTheme: { primary: '#00d4ff', secondary: 'transparent' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'transparent' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
