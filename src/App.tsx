import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: '/physics',
    element: <Physics />,
  },
  {
    path: '/chemistry',
    element: <Chemistry />,
  },
  {
    path: '/mathematics',
    element: <Mathematics />,
  },
  {
    path: '/biology',
    element: <Biology />,
  },
  {
    path: '/subject-puzzles',
    element: <SubjectPuzzles />,
  },
  {
    path: '/visual-library',
    element: <VisualLibrary />,
  },
  {
    path: '/upload-image',
    element: <UploadImagePage />,
  },
  {
    path: '/scientific-journal',
    element: <ScientificJournal />,
  },
  {
    path: '/upload-journal',
    element: <UploadJournalPage />,
  },
  {
    path: '/study-organization',
    element: <StudyOrganization />,
  },
  {
    path: '/chat-rooms',
    element: <ChatRooms />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/math-puzzles',
    element: <MathPuzzles />,
  },
  {
    path: '/profile',
    element: <UserProfile />,
  }
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
