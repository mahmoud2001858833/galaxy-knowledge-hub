
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Physics from './pages/Physics';
import Chemistry from './pages/Chemistry';
import Biology from './pages/Biology';
import Mathematics from './pages/Mathematics';
import MathPuzzles from './pages/MathPuzzles';
import NotFound from './pages/NotFound';
import ChatRooms from './pages/ChatRooms';
import StudyOrganization from './pages/StudyOrganization';
import VisualLibrary from './pages/VisualLibrary';
import ScientificJournal from './pages/ScientificJournal';
import UploadImagePage from './pages/UploadImagePage';
import UploadJournalPage from './pages/UploadJournalPage';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/physics" element={<Physics />} />
        <Route path="/chemistry" element={<Chemistry />} />
        <Route path="/biology" element={<Biology />} />
        <Route path="/mathematics" element={<Mathematics />} />
        <Route path="/math-puzzles" element={<MathPuzzles />} />
        <Route path="/chat-rooms" element={<ChatRooms />} />
        <Route path="/study-organization" element={<StudyOrganization />} />
        <Route path="/visual-library" element={<VisualLibrary />} />
        <Route path="/scientific-journal" element={<ScientificJournal />} />
        <Route path="/upload-image" element={<UploadImagePage />} />
        <Route path="/upload-journal" element={<UploadJournalPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
