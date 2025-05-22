
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

// Authentication guard component that redirects to login if not authenticated
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
        if (!session) {
          // If not authenticated, show a toast and redirect to login
          toast({
            title: "تسجيل دخول مطلوب",
            description: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة",
            variant: "destructive",
          });
          // Redirect to auth page with return URL
          navigate(`/auth?returnUrl=${encodeURIComponent(location.pathname)}`, { replace: true });
        }
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
  }, [navigate, location.pathname, toast]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

// Separate component that doesn't require authentication
const PublicRoute = ({ children }) => {
  return children;
};

// Create routes with proper authentication guards
const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicRoute><Index /></PublicRoute>,
    errorElement: <NotFound />,
  },
  {
    path: '/auth',
    element: <PublicRoute><Auth /></PublicRoute>,
  },
  {
    path: '/physics',
    element: <AuthGuard><Physics /></AuthGuard>,
  },
  {
    path: '/chemistry',
    element: <AuthGuard><Chemistry /></AuthGuard>,
  },
  {
    path: '/mathematics',
    element: <AuthGuard><Mathematics /></AuthGuard>,
  },
  {
    path: '/biology',
    element: <AuthGuard><Biology /></AuthGuard>,
  },
  {
    path: '/subject-puzzles',
    element: <AuthGuard><SubjectPuzzles /></AuthGuard>,
  },
  {
    path: '/puzzle/:puzzleId',
    element: <AuthGuard><PuzzleDetails /></AuthGuard>,
  },
  {
    path: '/visual-library',
    element: <AuthGuard><VisualLibrary /></AuthGuard>,
  },
  {
    path: '/upload-image',
    element: <AuthGuard><UploadImagePage /></AuthGuard>,
  },
  {
    path: '/scientific-journal',
    element: <AuthGuard><ScientificJournal /></AuthGuard>,
  },
  {
    path: '/upload-journal',
    element: <AuthGuard><UploadJournalPage /></AuthGuard>,
  },
  {
    path: '/study-organization',
    element: <AuthGuard><StudyOrganization /></AuthGuard>,
  },
  {
    path: '/chat-rooms',
    element: <AuthGuard><ChatRooms /></AuthGuard>,
  },
  {
    path: '/math-puzzles',
    element: <AuthGuard><MathPuzzles /></AuthGuard>,
  },
  {
    path: '/profile',
    element: <AuthGuard><UserProfile /></AuthGuard>,
  },
  {
    path: '/contact',
    element: <AuthGuard><Contact /></AuthGuard>,
  },
  {
    path: '*',
    element: <NotFound />,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
