
import React, { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Physics from './pages/Physics';
import Chemistry from './pages/Chemistry';
import Mathematics from './pages/Mathematics';
import Biology from './pages/Biology';
import SubjectPuzzles from './pages/SubjectPuzzles';
import VisualLibrary from './pages/VisualLibrary';
import UploadImagePage from './pages/UploadImagePage';
import ScientificJournal from './pages/ScientificJournal';
import UploadJournalPage from './pages/UploadJournalPage';
import StudyOrganization from './pages/StudyOrganization';
import ChatRooms from './pages/ChatRooms';
import Auth from './pages/Auth';
import MathPuzzles from './pages/MathPuzzles';
import UserProfile from './pages/UserProfile';
import Contact from './pages/Contact';
import PuzzleDetails from './pages/PuzzleDetails';
import { LanguageProvider } from './i18n/LanguageContext';

// Authentication guard component - now doesn't force redirect
const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return children;
};

// Create the router with LanguageProvider inside each route element to ensure it wraps all components
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard><LanguageProvider><Index /></LanguageProvider></AuthGuard>,
    errorElement: <NotFound />,
  },
  {
    path: '/auth',
    element: <LanguageProvider><Auth /></LanguageProvider>,
  },
  {
    path: '/physics',
    element: <AuthGuard><LanguageProvider><Physics /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/chemistry',
    element: <AuthGuard><LanguageProvider><Chemistry /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/mathematics',
    element: <AuthGuard><LanguageProvider><Mathematics /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/biology',
    element: <AuthGuard><LanguageProvider><Biology /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/subject-puzzles',
    element: <AuthGuard><LanguageProvider><SubjectPuzzles /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/puzzle/:puzzleId',
    element: <AuthGuard><LanguageProvider><PuzzleDetails /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/visual-library',
    element: <AuthGuard><LanguageProvider><VisualLibrary /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/upload-image',
    element: <AuthGuard><LanguageProvider><UploadImagePage /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/scientific-journal',
    element: <AuthGuard><LanguageProvider><ScientificJournal /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/upload-journal',
    element: <AuthGuard><LanguageProvider><UploadJournalPage /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/study-organization',
    element: <AuthGuard><LanguageProvider><StudyOrganization /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/chat-rooms',
    element: <AuthGuard><LanguageProvider><ChatRooms /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/math-puzzles',
    element: <AuthGuard><LanguageProvider><MathPuzzles /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/profile',
    element: <AuthGuard><LanguageProvider><UserProfile /></LanguageProvider></AuthGuard>,
  },
  {
    path: '/contact',
    element: <AuthGuard><LanguageProvider><Contact /></LanguageProvider></AuthGuard>,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
