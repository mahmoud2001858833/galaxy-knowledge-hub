
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

// Hostname-based redirect: damij-jo.life always serves the Damij platform
if (typeof window !== 'undefined' && /(^|\.)damij-jo\.life$/i.test(window.location.hostname)) {
  const path = window.location.pathname;
  if (!path.startsWith('/damij')) {
    window.location.replace('/damij' + window.location.search + window.location.hash);
  }
}

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
