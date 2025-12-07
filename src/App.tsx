import React, { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import StudyScheduleCreator from './pages/StudyScheduleCreator';
import StudentProgress from './pages/StudentProgress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PlatformGuideAssistant from '@/components/PlatformGuideAssistant';
import WelcomeGuide from '@/components/WelcomeGuide';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Physics from './pages/Physics';
import Chemistry from './pages/Chemistry';
import Mathematics from './pages/Mathematics';
import CalculatorPage from './pages/CalculatorPage';
import GraphVisualizerPage from './pages/GraphVisualizerPage';
import MathematiciansPage from './pages/MathematiciansPage';
import MathAIAssistantPage from './pages/MathAIAssistantPage';
import Biology from './pages/Biology';
import SubjectPuzzles from './pages/SubjectPuzzles';
import VisualLibrary from './pages/VisualLibrary';
import UploadImagePage from './pages/UploadImagePage';
import ScientificJournal from './pages/ScientificJournal';
import UploadJournalPage from './pages/UploadJournalPage';
import StudyOrganization from './pages/StudyOrganization';
import ChatRooms from './pages/ChatRooms';
import Auth from './pages/Auth';
import FalakKnowledgeAI from './pages/FalakKnowledgeAI';
import MathPuzzles from './pages/MathPuzzles';
import UserProfile from './pages/UserProfile';
import Contact from './pages/Contact';
import PuzzleDetails from './pages/PuzzleDetails';
import EducationalVideos from './pages/EducationalVideos';
import ScientificPlatforms from './pages/ScientificPlatforms';
import LiteraryPlatforms from './pages/LiteraryPlatforms';
import IslamicEducation from './pages/IslamicEducation';
import HijriEventsExplorer from './pages/HijriEventsExplorer';
import IslamicHistoricalEras from './pages/IslamicHistoricalEras';
import BTEC from './pages/BTEC';
import BTECInformationTechnology from './pages/BTECInformationTechnology';
import ProgrammingSection from './components/btec/ProgrammingSection';
import BTECStudentProjects from './components/btec/BTECStudentProjects';
import CodeFixerSection from './components/btec/CodeFixerSection';
import DevelopmentTipsSection from './components/btec/DevelopmentTipsSection';
import BuildPlatformSection from './components/btec/BuildPlatformSection';
import ArabicLanguage from './pages/ArabicLanguage';
import ArabicLanguagePlatform from './pages/ArabicLanguagePlatform';
import ArabicGrammarSection from './pages/ArabicGrammarSection';
import ArabicMorphologySection from './pages/ArabicMorphologySection';
import ArabicProsodySection from './pages/ArabicProsodySection';
import ArabicCriticismSection from './pages/ArabicCriticismSection';
import EnglishLanguage from './pages/EnglishLanguage';
import ScientificSimulations from './pages/ScientificSimulations';
import BlackbodyRadiationSimulation from './pages/BlackbodyRadiationSimulation';
import BuildAtomSimulation from './pages/BuildAtomSimulation';
import LHCSimulation from './pages/LHCSimulation';
import ElectromagneticWavesSimulation from './pages/ElectromagneticWavesSimulation';
import NuclearReactionsSimulation from './pages/NuclearReactionsSimulation';
import ChemicalReactionsSimulation from './pages/ChemicalReactionsSimulation';
import FourierSeriesSimulation from './pages/FourierSeriesSimulation';
import Function3DVisualization from './pages/Function3DVisualization';
import EnvironmentalSustainability from './pages/EnvironmentalSustainability';
import CarbonCalculator from './pages/CarbonCalculator';
import SchoolProjects from './pages/SchoolProjects';
import HomeProjects from './pages/HomeProjects';
import PersonalSustainabilityIndex from './pages/PersonalSustainabilityIndex';
import PsychologicalGuide from './pages/PsychologicalGuide';
import StudentProjects from './components/environmental/StudentProjects';
import RecyclingProjectAdvisor from './pages/RecyclingProjectAdvisor';
import EcoPredictDashboard from './pages/EcoPredictDashboard';
import RecordedLessons from './components/educational/RecordedLessons';
import AdministratorsTeachers from './pages/AdministratorsTeachers';
import ArtDesign from './pages/ArtDesign';
import DrawingChallengeRoom from './pages/DrawingChallengeRoom';
import GrammarBasicsSection from "./pages/GrammarBasicsSection";
import GrammarLibrarySection from "./pages/GrammarLibrarySection";
import GrammarSubsectionsPage from "./pages/GrammarSubsectionsPage";
import MorphologyBasicsSection from "./pages/MorphologyBasicsSection";
import MorphologyRootsSection from "./pages/MorphologyRootsSection";
import MorphologyDerivativesSection from "./pages/MorphologyDerivativesSection";
import MorphologySubsectionsPage from "./pages/MorphologySubsectionsPage";
import CommunicationBridge from './pages/CommunicationBridge';
import JordanTawjihi from './pages/JordanTawjihi';
import JordanTawjihiHistory from './pages/JordanTawjihiHistory';
import JordanTawjihiReligion from './pages/JordanTawjihiReligion';
import JordanTawjihiEnglish from './pages/JordanTawjihiEnglish';
import JordanTawjihiArabic from './pages/JordanTawjihiArabic';
import TeacherRegistration from './pages/TeacherRegistration';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherNotes from './pages/TeacherNotes';
import TeacherStatistics from './pages/TeacherStatistics';
import ParentRegistration from './pages/ParentRegistration';
import ParentDashboard from './pages/ParentDashboard';
import ParentAssignments from './pages/ParentAssignments';
import ParentNotes from './pages/ParentNotes';
import ClassChat from './pages/ClassChat';
import ControlCenter from './pages/ControlCenter';
import ManagementSection from './pages/ManagementSection';
import EducationSection from './pages/EducationSection';
import AIAssistantSection from './pages/AIAssistantSection';
import JordanianAssistant from './pages/JordanianAssistant';
import ConversationView from './pages/ConversationView';
// Removed: UploadTextbooks, UploadJordanianContent, ManageJordanianContent
// Now using UploadedSourcesTab inside JordanianAssistant
import SchoolMagazine from './pages/SchoolMagazine';
import NewsDetail from './pages/NewsDetail';
import MathematicsQuestionBank from './pages/MathematicsQuestionBank';
import ProtectedArabicLanguagePlatform from './pages/ProtectedArabicLanguagePlatform';
import AIPlatformBuilder from './pages/AIPlatformBuilder';
import PublishedProject from './pages/PublishedProject';
import TenantSettings from './pages/TenantSettings';
import './App.css';

// Root layout component that includes the PlatformGuideAssistant and WelcomeGuide
const RootLayout = () => {
  return (
    <>
      <Outlet />
      <WelcomeGuide />
      <PlatformGuideAssistant />
    </>
  );
};

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

// Create routes with proper authentication guards and root layout
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <PublicRoute><Index /></PublicRoute>,
      },
      {
        path: 'auth',
        element: <PublicRoute><Auth /></PublicRoute>,
      },
      {
        path: 'scientific-platforms',
        element: <PublicRoute><ScientificPlatforms /></PublicRoute>,
      },
      {
        path: 'literary-platforms',
        element: <PublicRoute><LiteraryPlatforms /></PublicRoute>,
      },
      {
        path: 'islamic-education',
        element: <PublicRoute><IslamicEducation /></PublicRoute>,
      },
      {
        path: 'islamic-education/hijri-events',
        element: <PublicRoute><HijriEventsExplorer /></PublicRoute>,
      },
      {
        path: 'islamic-education/historical-eras',
        element: <PublicRoute><IslamicHistoricalEras /></PublicRoute>,
      },
      {
        path: 'jordan-tawjihi',
        element: <PublicRoute><JordanTawjihi /></PublicRoute>,
      },
      {
        path: 'jordan-tawjihi/history',
        element: <PublicRoute><JordanTawjihiHistory /></PublicRoute>,
      },
      {
        path: 'jordan-tawjihi/religion',
        element: <PublicRoute><JordanTawjihiReligion /></PublicRoute>,
      },
      {
        path: 'jordan-tawjihi/english',
        element: <PublicRoute><JordanTawjihiEnglish /></PublicRoute>,
      },
      {
        path: 'jordan-tawjihi/arabic',
        element: <PublicRoute><JordanTawjihiArabic /></PublicRoute>,
      },
      {
        path: 'btec',
        element: <PublicRoute><BTEC /></PublicRoute>,
      },
      {
        path: 'btec/information-technology',
        element: <PublicRoute><BTECInformationTechnology /></PublicRoute>,
      },
      {
        path: 'btec/it/programming',
        element: <PublicRoute><ProgrammingSection /></PublicRoute>,
      },
      {
        path: 'btec/it/student-projects',
        element: <PublicRoute><BTECStudentProjects /></PublicRoute>,
      },
      {
        path: 'btec/it/code-fixer',
        element: <PublicRoute><CodeFixerSection /></PublicRoute>,
      },
      {
        path: 'btec/it/dev-tips',
        element: <PublicRoute><DevelopmentTipsSection /></PublicRoute>,
      },
      {
        path: 'btec/it/build-platform',
        element: <PublicRoute><BuildPlatformSection /></PublicRoute>,
      },
      {
        path: 'arabic-language',
        element: <AuthGuard><ArabicLanguage /></AuthGuard>,
      },
      {
        path: 'arabic-platform',
        element: <PublicRoute><ProtectedArabicLanguagePlatform /></PublicRoute>,
      },
      {
        path: 'arabic-platform/grammar',
        element: <PublicRoute><GrammarSubsectionsPage /></PublicRoute>,
      },
      {
        path: 'arabic-platform/morphology',
        element: <PublicRoute><MorphologySubsectionsPage /></PublicRoute>,
      },
      {
        path: 'arabic-platform/prosody',
        element: <PublicRoute><ArabicProsodySection /></PublicRoute>,
      },
      {
        path: 'arabic-platform/criticism',
        element: <PublicRoute><ArabicCriticismSection /></PublicRoute>,
      },
      {
        path: 'arabic-platform/grammar/basics',
        element: <PublicRoute><GrammarBasicsSection /></PublicRoute>,
      },
      {
        path: 'arabic-platform/grammar/library',
        element: <PublicRoute><GrammarLibrarySection /></PublicRoute>,
      },
      {
        path: 'arabic-platform/morphology/basics',
        element: <PublicRoute><MorphologyBasicsSection /></PublicRoute>,
      },
      {
        path: 'arabic-platform/morphology/roots',
        element: <PublicRoute><MorphologyRootsSection /></PublicRoute>,
      },
      {
        path: 'arabic-platform/morphology/derivatives',
        element: <PublicRoute><MorphologyDerivativesSection /></PublicRoute>,
      },
      {
        path: 'english-language',
        element: <AuthGuard><EnglishLanguage /></AuthGuard>,
      },
      {
        path: 'physics',
        element: <AuthGuard><Physics /></AuthGuard>,
      },
      {
        path: 'chemistry',
        element: <AuthGuard><Chemistry /></AuthGuard>,
      },
      {
        path: 'mathematics',
        element: <AuthGuard><Mathematics /></AuthGuard>,
      },
      {
        path: 'mathematics/calculator',
        element: <AuthGuard><CalculatorPage /></AuthGuard>,
      },
      {
        path: 'mathematics/graph-visualizer',
        element: <AuthGuard><GraphVisualizerPage /></AuthGuard>,
      },
      {
        path: 'mathematics/mathematicians',
        element: <AuthGuard><MathematiciansPage /></AuthGuard>,
      },
      {
        path: 'mathematics/ai-assistant',
        element: <AuthGuard><MathAIAssistantPage /></AuthGuard>,
      },
      {
        path: 'mathematics/question-bank',
        element: <AuthGuard><MathematicsQuestionBank /></AuthGuard>,
      },
      {
        path: 'biology',
        element: <AuthGuard><Biology /></AuthGuard>,
      },
      {
        path: 'subject-puzzles',
        element: <AuthGuard><SubjectPuzzles /></AuthGuard>,
      },
      {
        path: 'puzzle/:puzzleId',
        element: <AuthGuard><PuzzleDetails /></AuthGuard>,
      },
      {
        path: 'visual-library',
        element: <AuthGuard><VisualLibrary /></AuthGuard>,
      },
      {
        path: 'upload-image',
        element: <AuthGuard><UploadImagePage /></AuthGuard>,
      },
      {
        path: 'scientific-journal',
        element: <AuthGuard><ScientificJournal /></AuthGuard>,
      },
      {
        path: 'upload-journal',
        element: <AuthGuard><UploadJournalPage /></AuthGuard>,
      },
      {
        path: 'study-organization',
        element: <AuthGuard><StudyOrganization /></AuthGuard>,
      },
      {
        path: 'chat-rooms',
        element: <AuthGuard><ChatRooms /></AuthGuard>,
      },
      {
        path: 'math-puzzles',
        element: <AuthGuard><MathPuzzles /></AuthGuard>,
      },
      {
        path: 'profile',
        element: <AuthGuard><UserProfile /></AuthGuard>,
      },
      {
        path: 'contact',
        element: <AuthGuard><Contact /></AuthGuard>,
      },
      {
        path: 'educational-videos',
        element: <AuthGuard><EducationalVideos /></AuthGuard>,
      },
      {
        path: 'scientific-simulations',
        element: <AuthGuard><ScientificSimulations /></AuthGuard>,
      },
      {
        path: 'simulation/blackbody-radiation',
        element: <AuthGuard><BlackbodyRadiationSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/build-atom',
        element: <AuthGuard><BuildAtomSimulation /></AuthGuard>,
      },
      {
        path: 'lhc-simulation',
        element: <AuthGuard><LHCSimulation /></AuthGuard>,
      },
      {
        path: 'electromagnetic-waves',
        element: <AuthGuard><ElectromagneticWavesSimulation /></AuthGuard>,
      },
      {
        path: 'nuclear-reactions',
        element: <AuthGuard><NuclearReactionsSimulation /></AuthGuard>,
      },
      {
        path: 'chemical-reactions',
        element: <AuthGuard><ChemicalReactionsSimulation /></AuthGuard>,
      },
      {
        path: 'fourier-series',
        element: <AuthGuard><FourierSeriesSimulation /></AuthGuard>,
      },
      {
        path: '3d-function-visualizer',
        element: <AuthGuard><Function3DVisualization /></AuthGuard>,
      },
      {
        path: 'environmental-sustainability',
        element: <AuthGuard><EnvironmentalSustainability /></AuthGuard>,
      },
      {
        path: 'environmental/carbon-calculator',
        element: <AuthGuard><CarbonCalculator /></AuthGuard>,
      },
      {
        path: 'environmental/school-projects',
        element: <AuthGuard><SchoolProjects /></AuthGuard>,
      },
      {
        path: 'environmental/home-projects',
        element: <AuthGuard><HomeProjects /></AuthGuard>,
      },
      {
        path: 'environmental/personal-sustainability-index',
        element: <AuthGuard><PersonalSustainabilityIndex /></AuthGuard>,
      },
      {
        path: 'falak-knowledge-ai',
        element: <AuthGuard><FalakKnowledgeAI /></AuthGuard>,
      },
      {
        path: 'study-schedule',
        element: <AuthGuard><StudyScheduleCreator /></AuthGuard>,
      },
      {
        path: 'student-progress',
        element: <AuthGuard><StudentProgress /></AuthGuard>,
      },
      {
        path: 'psychological-guide',
        element: <AuthGuard><PsychologicalGuide /></AuthGuard>,
      },
      {
        path: 'environmental/student-projects',
        element: <AuthGuard><StudentProjects /></AuthGuard>,
      },
      {
        path: 'environmental/recycling-advisor',
        element: <AuthGuard><RecyclingProjectAdvisor /></AuthGuard>,
      },
      {
        path: 'environmental/eco-predict',
        element: <AuthGuard><EcoPredictDashboard /></AuthGuard>,
      },
      {
        path: 'recorded-lessons',
        element: <AuthGuard><RecordedLessons /></AuthGuard>,
      },
      {
        path: 'administrators-teachers',
        element: <AuthGuard><AdministratorsTeachers /></AuthGuard>,
      },
      {
        path: 'art-design',
        element: <AuthGuard><ArtDesign /></AuthGuard>,
      },
      {
        path: 'drawing-challenge/:roomId',
        element: <AuthGuard><DrawingChallengeRoom /></AuthGuard>,
      },
      {
        path: 'communication-bridge',
        element: <AuthGuard><CommunicationBridge /></AuthGuard>,
      },
      {
        path: 'teacher-registration',
        element: <AuthGuard><TeacherRegistration /></AuthGuard>,
      },
      {
        path: 'teacher-dashboard',
        element: <AuthGuard><TeacherDashboard /></AuthGuard>,
      },
      {
        path: 'teacher/assignments',
        element: <AuthGuard><TeacherAssignments /></AuthGuard>,
      },
      {
        path: 'teacher/notes',
        element: <AuthGuard><TeacherNotes /></AuthGuard>,
      },
      {
        path: 'teacher/statistics',
        element: <AuthGuard><TeacherStatistics /></AuthGuard>,
      },
      {
        path: 'teacher/chat',
        element: <AuthGuard><ClassChat /></AuthGuard>,
      },
      {
        path: 'parent-registration',
        element: <AuthGuard><ParentRegistration /></AuthGuard>,
      },
      {
        path: 'parent-dashboard',
        element: <AuthGuard><ParentDashboard /></AuthGuard>,
      },
      {
        path: 'parent/assignments',
        element: <AuthGuard><ParentAssignments /></AuthGuard>,
      },
      {
        path: 'parent/notes',
        element: <AuthGuard><ParentNotes /></AuthGuard>,
      },
      {
        path: 'parent/chat',
        element: <AuthGuard><ClassChat /></AuthGuard>,
      },
      {
        path: 'control-center',
        element: <AuthGuard><ControlCenter /></AuthGuard>,
      },
      {
        path: 'management-section',
        element: <PublicRoute><ManagementSection /></PublicRoute>,
      },
      {
        path: 'education-section',
        element: <AuthGuard><EducationSection /></AuthGuard>,
      },
      {
        path: 'ai-assistant-section',
        element: <PublicRoute><AIAssistantSection /></PublicRoute>,
      },
      {
        path: 'jordanian-assistant',
        element: <AuthGuard><JordanianAssistant /></AuthGuard>,
      },
      {
        path: 'conversation/:conversationId',
        element: <AuthGuard><ConversationView /></AuthGuard>,
      },
      // Removed upload-textbooks, upload-jordanian-content, manage-jordanian-content routes
      // Upload is now only through "المصادر المتاحة" in JordanianAssistant
      {
        path: 'school-magazine',
        element: <PublicRoute><SchoolMagazine /></PublicRoute>,
      },
      {
        path: 'news/:id',
        element: <PublicRoute><NewsDetail /></PublicRoute>,
      },
      {
        path: 'ai-platform-builder',
        element: <AuthGuard><AIPlatformBuilder /></AuthGuard>,
      },
      {
        path: 'ai-platform-builder/:projectId',
        element: <AuthGuard><AIPlatformBuilder /></AuthGuard>,
      },
      {
        path: 'tenant-settings',
        element: <AuthGuard><TenantSettings /></AuthGuard>,
      },
      {
        path: 'published/:slug',
        element: <PublicRoute><PublishedProject /></PublicRoute>,
      },
      {
        path: '*',
        element: <NotFound />,
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
