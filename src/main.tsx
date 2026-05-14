
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { NotificationProvider } from "@/components/NotificationProvider";

const queryClient = new QueryClient();

// Make sure React is correctly initialized before rendering
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <NotificationProvider>
            <App />
            <Toaster />
            <SonnerToaster richColors closeButton position="top-center" />
          </NotificationProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
