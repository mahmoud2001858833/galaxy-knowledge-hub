import React, { useEffect, useState, Suspense, lazy, ComponentType } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';
import { GJUFloatingNav } from '@/components/gju/GJUFloatingNav';
import ScrollToTop from '@/components/ScrollToTop';
import { AutoReadWrapper } from '@/components/accessibility/AutoReadWrapper';
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
import TeacherAchievements from './pages/TeacherAchievements';
import TeacherAchievementDetail from './pages/TeacherAchievementDetail';
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
import TechCodingPlatform from './pages/TechCodingPlatform';
import AIPlatformBuilderPro from './pages/AIPlatformBuilderPro';
import Complaints from './pages/Complaints';
import BTECStudentProjects from './components/btec/BTECStudentProjects';
import CodeFixerSection from './components/btec/CodeFixerSection';
import DevelopmentTipsSection from './components/btec/DevelopmentTipsSection';
import BuildPlatformSection from './components/btec/BuildPlatformSection';
import EnglishLanguage from './pages/EnglishLanguage';
import ScientificSimulations from './pages/ScientificSimulations';
import ScientificSimulationsHub from './pages/ScientificSimulationsHub';
import ExperimentsSection from './pages/ExperimentsSection';
import BlackbodyRadiationSimulation from './pages/BlackbodyRadiationSimulation';
import BuildAtomSimulation from './pages/BuildAtomSimulation';
import LHCSimulation from './pages/LHCSimulation';
import ElectromagneticWavesSimulation from './pages/ElectromagneticWavesSimulation';
import NuclearReactionsSimulation from './pages/NuclearReactionsSimulation';
import ChemicalReactionsSimulation from './pages/ChemicalReactionsSimulation';
import FourierSeriesSimulation from './pages/FourierSeriesSimulation';
import Function3DVisualization from './pages/Function3DVisualization';
import OpticsLabSimulation from './pages/OpticsLabSimulation';
import OpticsLab3D from './pages/OpticsLab3D';
import CircuitBuilderSimulation from './pages/CircuitBuilderSimulation';
import CircuitBuilderAdvanced from './pages/CircuitBuilderAdvanced';
import ProjectileMotionSimulation from './pages/ProjectileMotionSimulation';
import ProjectileMotion3D from './pages/ProjectileMotion3D';

import SolarSystemSimulation from './pages/SolarSystemSimulation';
import SolarSystem3D from './pages/SolarSystem3D';
import GeneticsLabSimulation from './pages/GeneticsLabSimulation';
import EcosystemSimulation from './pages/EcosystemSimulation';
import ElectromagnetismLabSimulation from './pages/ElectromagnetismLabSimulation';
import WavesAndSoundSimulation from './pages/WavesAndSoundSimulation';
import StaticElectricitySimulation from './pages/StaticElectricitySimulation';
import AdvancedAstronomySimulation from './pages/AdvancedAstronomySimulation';
import QuantumMechanicsSimulation from './pages/QuantumMechanicsSimulation';
import AnalyticalChemistrySimulation from './pages/AnalyticalChemistrySimulation';
import ElectrochemistrySimulation from './pages/ElectrochemistrySimulation';
import MolecularBiologySimulation from './pages/MolecularBiologySimulation';
import HumanBodySimulation from './pages/HumanBodySimulation';
import AdvancedNuclearSimulation from './pages/AdvancedNuclearSimulation';
import DigitalElectronicsSimulation from './pages/DigitalElectronicsSimulation';
import EarthSciencesSimulation from './pages/EarthSciencesSimulation';
import RocketScienceSimulation from './pages/RocketScienceSimulation';
import AdvancedOpticsSimulation from './pages/AdvancedOpticsSimulation';
import MaterialsScienceSimulation from './pages/MaterialsScienceSimulation';
import ThermodynamicsSimulation from './pages/ThermodynamicsSimulation';
import Thermodynamics3D from './pages/Thermodynamics3D';
import RocketScience3D from './pages/RocketScience3D';
import FluidMechanicsSimulation from './pages/FluidMechanicsSimulation';
import FluidMechanics3D from './pages/FluidMechanics3D';
import CircularMotionSimulation from './pages/CircularMotionSimulation';
import CircularMotion3D from './pages/CircularMotion3D';
import SpecialRelativitySimulation from './pages/SpecialRelativitySimulation';
import InterferenceDiffractionSimulation from './pages/InterferenceDiffractionSimulation';
import PlasmaPhysicsSimulation from './pages/PlasmaPhysicsSimulation';
import ChemicalKineticsSimulation from './pages/ChemicalKineticsSimulation';
import OrganicChemistrySimulation from './pages/OrganicChemistrySimulation';
import StatesOfMatterSimulation from './pages/StatesOfMatterSimulation';
import AcidsBasesSimulation from './pages/AcidsBasesSimulation';
import NuclearApplicationsSimulation from './pages/NuclearApplicationsSimulation';
import LivingCellSimulation from './pages/LivingCellSimulation';
import CellDivisionSimulation from './pages/CellDivisionSimulation';
import PhotosynthesisRespirationSimulation from './pages/PhotosynthesisRespirationSimulation';
import ImmuneSystemSimulation from './pages/ImmuneSystemSimulation';
import EvolutionSimulation from './pages/EvolutionSimulation';
import SpatialGeometrySimulation from './pages/SpatialGeometrySimulation';
import ProbabilitySimulation from './pages/ProbabilitySimulation';
import RoboticsSimulation from './pages/RoboticsSimulation';
import MechanicalEngineeringSimulation from './pages/MechanicalEngineeringSimulation';
import MechanicalEngineering3D from './pages/MechanicalEngineering3D';
import WavesSound3D from './pages/WavesSound3D';
import Electromagnetism3D from './pages/Electromagnetism3D';


import EnvironmentalSustainability from './pages/EnvironmentalSustainability';
import CarbonCalculator from './pages/CarbonCalculator';
import SchoolProjects from './pages/SchoolProjects';
import HomeProjects from './pages/HomeProjects';
import PersonalSustainabilityIndex from './pages/PersonalSustainabilityIndex';
import PsychologicalGuide from './pages/PsychologicalGuide';
import StudentProjects from './components/environmental/StudentProjects';
import RecyclingProjectAdvisor from './pages/RecyclingProjectAdvisor';
import EcoPredictDashboard from './pages/EcoPredictDashboard';
import MedicalAssistant from './pages/MedicalAssistant';
import AdministratorsTeachers from './pages/AdministratorsTeachers';
import ArtDesign from './pages/ArtDesign';
import DrawingChallengeRoom from './pages/DrawingChallengeRoom';
import CommunicationBridge from './pages/CommunicationBridge';
import JordanTawjihi from './pages/JordanTawjihi';
import JordanTawjihiHistory from './pages/JordanTawjihiHistory';
import JordanTawjihiReligion from './pages/JordanTawjihiReligion';
import JordanTawjihiEnglish from './pages/JordanTawjihiEnglish';
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

import AIPlatformBuilder from './pages/AIPlatformBuilder';
import PublishedProject from './pages/PublishedProject';
import TenantSettings from './pages/TenantSettings';
import PlatformDocumentation from './pages/PlatformDocumentation';
import SpacedRepetitionSystem from './pages/SpacedRepetitionSystem';
import AIImageGenerator from './pages/AIImageGenerator';
import SignLanguagePage from './pages/SignLanguagePage';
import ExamScannerPage from './pages/ExamScannerPage';
import SmartCitySection from './pages/SmartCitySection';
import AIArchitecturalDesign from './pages/AIArchitecturalDesign';
import RoboticConstruction from './pages/RoboticConstruction';
import AIInteriorDesign from './pages/AIInteriorDesign';
import GJUCompetition from './pages/GJUCompetition';
import FacePayAI from './pages/FacePayAI';
import AIFutureStore from './pages/AIFutureStore';
import RoboticsGenerator from './pages/RoboticsGenerator';
import JordanDigitalTwin from './pages/JordanDigitalTwin';
import HassanGardenAI from './pages/HassanGardenAI';
import MemoryTree from './pages/MemoryTree';
import CancerDetection from './pages/CancerDetection';
// ===== Damij: lazy-loaded to keep the main bundle small (faster first load + Safari friendly) =====
import DamijAuthGuard from './components/damij/DamijAuthGuard';

const DamijFallback = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Tajawal","Cairo","Inter",sans-serif',
    color: 'hsl(215 55% 22%)',
    background: 'linear-gradient(180deg,#f6f9fc,#eef3f8)',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 44, height: 44, margin: '0 auto 12px',
        border: '3px solid rgba(0,0,0,0.1)',
        borderTopColor: 'hsl(200 65% 34%)',
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite'
      }} />
      <div style={{ fontSize: 14, opacity: 0.7 }}>...جاري التحميل</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  </div>
);

const wrap = <P,>(Comp: React.LazyExoticComponent<ComponentType<P>>) => {
  const Wrapped: React.FC<P> = (props) => (
    <Suspense fallback={<DamijFallback />}>
      <Comp {...(props as any)} />
    </Suspense>
  );
  return Wrapped;
};

const DamijLayout = wrap(lazy(() => import('./pages/damij/DamijLayout')));
const DamijLanding = wrap(lazy(() => import('./pages/damij/DamijLanding')));
const DamijLandingStandalone = wrap(lazy(() => import('./pages/damij/DamijLandingStandalone')));
const DamijDocs = wrap(lazy(() => import('./pages/damij/DamijDocs')));
const DamijDoctorSurvey = wrap(lazy(() => import('./pages/damij/DamijDoctorSurvey')));
const DamijResults = wrap(lazy(() => import('./pages/damij/DamijResults')));
const DamijAuth = wrap(lazy(() => import('./pages/damij/auth/DamijAuth')));
const DamijResetPassword = wrap(lazy(() => import('./pages/damij/auth/DamijResetPassword')));
const BrailleHome = wrap(lazy(() => import('./pages/damij/braille/BrailleHome')));
const BrailleToText = wrap(lazy(() => import('./pages/damij/braille/BrailleToText')));
const BrailleLearn = wrap(lazy(() => import('./pages/damij/braille/BrailleLearn')));
const UniversalBrailleConverter = wrap(lazy(() => import('./pages/damij/braille/UniversalBrailleConverter')));
const TactileGraphics = wrap(lazy(() => import('./pages/damij/braille/TactileGraphics')));
const InteractiveBrailleLearn = wrap(lazy(() => import('./pages/damij/braille/InteractiveBrailleLearn')));
const BlindEyeHome = wrap(lazy(() => import('./pages/damij/blind-eye/BlindEyeHome')));
const BlindEyeNavigator = wrap(lazy(() => import('./pages/damij/blind-eye/BlindEyeNavigator')));
const BlindEyeSettings = wrap(lazy(() => import('./pages/damij/blind-eye/BlindEyeSettings')));
const BlindEyeOnboarding = wrap(lazy(() => import('./pages/damij/blind-eye/BlindEyeOnboarding')));
const AutismLayout = wrap(lazy(() => import('./pages/damij/autism/AutismLayout')));
const AutismHome = wrap(lazy(() => import('./pages/damij/autism/AutismHome')));
const AutismDiagnosis = wrap(lazy(() => import('./pages/damij/autism/AutismDiagnosis')));
const AutismTherapy = wrap(lazy(() => import('./pages/damij/autism/AutismTherapy')));
const AutismTherapyPlan = wrap(lazy(() => import('./pages/damij/autism/AutismTherapyPlan')));
const AutismGamePlayer = wrap(lazy(() => import('./pages/damij/autism/AutismGamePlayer')));
const AutismProfile = wrap(lazy(() => import('./pages/damij/autism/AutismProfile')));
const AutismProgramSetup = wrap(lazy(() => import('./pages/damij/autism/AutismProgramSetup')));
const AutismProgramCalendar = wrap(lazy(() => import('./pages/damij/autism/AutismProgramCalendar')));
const AutismDayView = wrap(lazy(() => import('./pages/damij/autism/AutismDayView')));
const AutismChildPage = wrap(lazy(() => import('./pages/damij/autism/AutismChildPage')));
const AutismProgressDashboard = wrap(lazy(() => import('./pages/damij/autism/AutismProgressDashboard')));
const ADHDHome = wrap(lazy(() => import('./pages/damij/adhd/ADHDHome')));
const ADHDScreening = wrap(lazy(() => import('./pages/damij/adhd/ADHDScreening')));
const ADHDTraining = wrap(lazy(() => import('./pages/damij/adhd/ADHDTraining')));
const ADHDInstrumentRunner = wrap(lazy(() => import('./pages/damij/adhd/ADHDInstrumentRunner')));
const ADHDScreeningReport = wrap(lazy(() => import('./pages/damij/adhd/ADHDScreeningReport')));
const ADHDAssessmentHub = wrap(lazy(() => import('./pages/damij/adhd/ADHDAssessmentHub')));
const ADHDCPTTask = wrap(lazy(() => import('./pages/damij/adhd/ADHDCPTTask')));
const ADHDNBackTask = wrap(lazy(() => import('./pages/damij/adhd/ADHDNBackTask')));
const ADHDStroopTask = wrap(lazy(() => import('./pages/damij/adhd/ADHDStroopTask')));
const ADHDGoNoGoTask = wrap(lazy(() => import('./pages/damij/adhd/ADHDGoNoGoTask')));
const ADHDTrainingHub = wrap(lazy(() => import('./pages/damij/adhd/ADHDTrainingHub')));
const ADHDFocusBuilder = wrap(lazy(() => import('./pages/damij/adhd/ADHDFocusBuilder')));
const ADHDInterventions = wrap(lazy(() => import('./pages/damij/adhd/ADHDInterventions')));
const ADHDDashboard = wrap(lazy(() => import('./pages/damij/adhd/ADHDDashboard')));
const ADHDResources = wrap(lazy(() => import('./pages/damij/adhd/ADHDResources')));
const ADHDGamesHub = wrap(lazy(() => import('./pages/damij/adhd/ADHDGamesHub')));
const ADHDGamePlay = wrap(lazy(() => import('./pages/damij/adhd/ADHDGamePlay')));
const ADHDDiagnosticReport = wrap(lazy(() => import('./pages/damij/adhd/ADHDDiagnosticReport')));
const ADHDProgramSetup = wrap(lazy(() => import('./pages/damij/adhd/ADHDProgramSetup')));
const ADHDProgramCalendar = wrap(lazy(() => import('./pages/damij/adhd/ADHDProgramCalendar')));
const ADHDProgramDay = wrap(lazy(() => import('./pages/damij/adhd/ADHDProgramDay')));
const ADHDMonthlyTracker = wrap(lazy(() => import('./pages/damij/adhd/ADHDMonthlyTracker')));
const DamijDashboard = wrap(lazy(() => import('./pages/damij/dashboard/DamijDashboard')));
const SignHome = wrap(lazy(() => import('./pages/damij/sign/SignHome')));
const SignTranslator = wrap(lazy(() => import('./pages/damij/sign/SignTranslator')));
const YouTubeSignTranslator = wrap(lazy(() => import('./pages/damij/sign/YouTubeSignTranslator')));
const SignDictionaryAdmin = wrap(lazy(() => import('./pages/damij/sign/SignDictionaryAdmin')));
const SignVocabOverridesAdmin = wrap(lazy(() => import('./pages/damij/sign/SignVocabOverridesAdmin')));
const SensoryHome = wrap(lazy(() => import('./pages/damij/sensory/SensoryHome')));
const SensoryUpload = wrap(lazy(() => import('./pages/damij/sensory/SensoryUpload')));
const SensoryOutput = wrap(lazy(() => import('./pages/damij/sensory/SensoryOutput')));
const SensoryProfileSetup = wrap(lazy(() => import('./pages/damij/sensory/SensoryProfileSetup')));
const SensoryImageTactile = wrap(lazy(() => import('./pages/damij/sensory/SensoryImageTactile')));
const SensoryInteractionLog = wrap(lazy(() => import('./pages/damij/sensory/SensoryInteractionLog')));
const SensoryHapticSettings = wrap(lazy(() => import('./pages/damij/sensory/SensoryHapticSettings')));
const SensoryUnifiedComm = wrap(lazy(() => import('./pages/damij/sensory/SensoryUnifiedComm')));
const SensoryTriSense = wrap(lazy(() => import('./pages/damij/sensory/SensoryTriSense')));
const SensoryAdaptiveUI = wrap(lazy(() => import('./pages/damij/sensory/SensoryAdaptiveUI')));
const ClinicalHome = wrap(lazy(() => import('./pages/damij/clinical/ClinicalHome')));
const ClinicalCases = wrap(lazy(() => import('./pages/damij/clinical/ClinicalCases')));
const ClinicalLab = wrap(lazy(() => import('./pages/damij/clinical/ClinicalLab')));
const ClinicalFreeExperiment = wrap(lazy(() => import('./pages/damij/clinical/ClinicalFreeExperiment')));
const ClinicalReports = wrap(lazy(() => import('./pages/damij/clinical/ClinicalReports')));
const ClinicalCaseDetail = wrap(lazy(() => import('./pages/damij/clinical/ClinicalCaseDetail')));
const ClinicalLabSession = wrap(lazy(() => import('./pages/damij/clinical/ClinicalLabSession')));
const ClinicalReport = wrap(lazy(() => import('./pages/damij/clinical/ClinicalReport')));
const ClinicalDashboard = wrap(lazy(() => import('./pages/damij/clinical/ClinicalDashboard')));
const ClinicalCompare = wrap(lazy(() => import('./pages/damij/clinical/ClinicalCompare')));
const ClinicalPortfolio = wrap(lazy(() => import('./pages/damij/clinical/ClinicalPortfolio')));
const ClinicalPublicReport = wrap(lazy(() => import('./pages/damij/clinical/ClinicalPublicReport')));
const SourcesLibrary = wrap(lazy(() => import('./pages/damij/sources/SourcesLibrary')));

// Lazy-init sensory tracking only when a damij route is opened (and only in the browser)
if (typeof window !== 'undefined') {
  const initDamijSideEffects = () => {
    const onDamij = (window.location.pathname || '').toLowerCase().startsWith('/damij')
      || /(^|\.)damij-jo\.life$/i.test(window.location.hostname);
    if (!onDamij) return;
    import('./pages/damij/sensory/interactionLog')
      .then(m => { try { m.installInteractionTracking(); } catch {} })
      .catch(() => {});
    import('./pages/damij/sensory/adaptiveUI')
      .then(m => { try { m.initAdaptiveUI(); } catch {} })
      .catch(() => {});
  };
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(initDamijSideEffects, { timeout: 2000 });
  } else {
    setTimeout(initDamijSideEffects, 800);
  }
}
import './App.css';

// Root layout component that includes the PlatformGuideAssistant, WelcomeGuide, and AccessibilityPanel
const RootLayout = () => {
  const location = useLocation();
  const path = (location.pathname || '').toLowerCase();
  const isDamijRoute = path.startsWith('/damij');
  const isGJURoute = path.startsWith('/gju') || path === '/gju-competition';
  const isIsolatedRoute = isGJURoute || isDamijRoute;
  const isGJUMode =
    isIsolatedRoute ||
    (typeof window !== 'undefined' && sessionStorage.getItem('gju_mode') === 'true');
  return (
    <AutoReadWrapper>
      <ScrollToTop />
      <Outlet />
      {!isGJUMode && <WelcomeGuide />}
      {!isGJUMode && <PlatformGuideAssistant />}
      {!isGJUMode && <AccessibilityPanel />}
      {isGJUMode && !isDamijRoute && <GJUFloatingNav />}
    </AutoReadWrapper>
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
        element: (typeof window !== 'undefined' && /(^|\.)damij-jo\.life$/i.test(window.location.hostname))
          ? <DamijLandingStandalone />
          : <PublicRoute><Index /></PublicRoute>,
      },
      {
        path: 'autism/c/:token',
        element: <AutismChildPage />,
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
        path: 'btec',
        element: <PublicRoute><BTEC /></PublicRoute>,
      },
      {
        path: 'btec/information-technology',
        element: <PublicRoute><BTECInformationTechnology /></PublicRoute>,
      },
      {
        path: 'btec/it/programming',
        element: <PublicRoute><TechCodingPlatform /></PublicRoute>,
      },
      {
        path: 'ai-platform-builder',
        element: <PublicRoute><AIPlatformBuilderPro /></PublicRoute>,
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
        path: 'exam-scanner',
        element: <AuthGuard><ExamScannerPage /></AuthGuard>,
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
        path: 'teacher-achievements',
        element: <PublicRoute><TeacherAchievements /></PublicRoute>,
      },
      {
        path: 'teacher-achievements/:slug',
        element: <PublicRoute><TeacherAchievementDetail /></PublicRoute>,
      },
      {
        path: 'spaced-repetition',
        element: <PublicRoute><SpacedRepetitionSystem /></PublicRoute>,
      },
      {
        path: 'ai-image-generator',
        element: <PublicRoute><AIImageGenerator /></PublicRoute>,
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
        path: 'complaints',
        element: <PublicRoute><Complaints /></PublicRoute>,
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
        path: 'scientific-simulations-hub',
        element: <PublicRoute><ScientificSimulationsHub /></PublicRoute>,
      },
      {
        path: 'experiments-section',
        element: <AuthGuard><ExperimentsSection /></AuthGuard>,
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
        path: 'simulation/optics-lab',
        element: <AuthGuard><OpticsLab3D /></AuthGuard>,
      },
      {
        path: 'simulation/optics-lab-classic',
        element: <AuthGuard><OpticsLabSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/circuit-builder',
        element: <AuthGuard><CircuitBuilderSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/circuit-builder-advanced',
        element: <AuthGuard><CircuitBuilderAdvanced /></AuthGuard>,
      },
      {
        path: 'simulation/projectile-motion',
        element: <AuthGuard><ProjectileMotion3D /></AuthGuard>,
      },
      {
        path: 'simulation/projectile-motion-classic',
        element: <AuthGuard><ProjectileMotionSimulation /></AuthGuard>,
      },


      {
        path: 'simulation/solar-system',
        element: <AuthGuard><SolarSystemSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/solar-system-3d',
        element: <AuthGuard><SolarSystem3D /></AuthGuard>,
      },
      {
        path: 'simulation/genetics-lab',
        element: <AuthGuard><GeneticsLabSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/ecosystem',
        element: <AuthGuard><EcosystemSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/electromagnetism',
        element: <AuthGuard><Electromagnetism3D /></AuthGuard>,
      },
      {
        path: 'simulation/electromagnetism-classic',
        element: <AuthGuard><ElectromagnetismLabSimulation /></AuthGuard>,
      },

      {
        path: 'simulation/waves-sound',
        element: <AuthGuard><WavesSound3D /></AuthGuard>,
      },
      {
        path: 'simulation/waves-sound-classic',
        element: <AuthGuard><WavesAndSoundSimulation /></AuthGuard>,
      },

      {
        path: 'simulation/static-electricity',
        element: <AuthGuard><StaticElectricitySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/advanced-astronomy',
        element: <AuthGuard><AdvancedAstronomySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/quantum-mechanics',
        element: <AuthGuard><QuantumMechanicsSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/analytical-chemistry',
        element: <AuthGuard><AnalyticalChemistrySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/electrochemistry',
        element: <AuthGuard><ElectrochemistrySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/molecular-biology',
        element: <AuthGuard><MolecularBiologySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/human-body',
        element: <AuthGuard><HumanBodySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/advanced-nuclear',
        element: <AuthGuard><AdvancedNuclearSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/digital-electronics',
        element: <AuthGuard><DigitalElectronicsSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/earth-sciences',
        element: <AuthGuard><EarthSciencesSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/rocket-science',
        element: <AuthGuard><RocketScience3D /></AuthGuard>,
      },
      {
        path: 'simulation/rocket-science-classic',
        element: <AuthGuard><RocketScienceSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/advanced-optics',
        element: <AuthGuard><AdvancedOpticsSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/materials-science',
        element: <AuthGuard><MaterialsScienceSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/thermodynamics',
        element: <AuthGuard><Thermodynamics3D /></AuthGuard>,
      },
      {
        path: 'simulation/thermodynamics-classic',
        element: <AuthGuard><ThermodynamicsSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/fluid-mechanics',
        element: <AuthGuard><FluidMechanics3D /></AuthGuard>,
      },
      {
        path: 'simulation/fluid-mechanics-classic',
        element: <AuthGuard><FluidMechanicsSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/circular-motion',
        element: <AuthGuard><CircularMotion3D /></AuthGuard>,
      },
      {
        path: 'simulation/circular-motion-classic',
        element: <AuthGuard><CircularMotionSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/special-relativity',
        element: <AuthGuard><SpecialRelativitySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/interference-diffraction',
        element: <AuthGuard><InterferenceDiffractionSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/plasma-physics',
        element: <AuthGuard><PlasmaPhysicsSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/chemical-kinetics',
        element: <AuthGuard><ChemicalKineticsSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/organic-chemistry',
        element: <AuthGuard><OrganicChemistrySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/states-of-matter',
        element: <AuthGuard><StatesOfMatterSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/acids-bases',
        element: <AuthGuard><AcidsBasesSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/nuclear-applications',
        element: <AuthGuard><NuclearApplicationsSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/living-cell',
        element: <AuthGuard><LivingCellSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/cell-division',
        element: <AuthGuard><CellDivisionSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/photosynthesis-respiration',
        element: <AuthGuard><PhotosynthesisRespirationSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/immune-system',
        element: <AuthGuard><ImmuneSystemSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/evolution',
        element: <AuthGuard><EvolutionSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/spatial-geometry',
        element: <AuthGuard><SpatialGeometrySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/probability',
        element: <AuthGuard><ProbabilitySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/robotics',
        element: <AuthGuard><RoboticsSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/mechanical-engineering',
        element: <AuthGuard><MechanicalEngineering3D /></AuthGuard>,
      },
      {
        path: 'simulation/mechanical-engineering-classic',
        element: <AuthGuard><MechanicalEngineeringSimulation /></AuthGuard>,
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
        path: 'medical-assistant',
        element: <PublicRoute><MedicalAssistant /></PublicRoute>,
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
        path: 'platform-documentation',
        element: <PublicRoute><PlatformDocumentation /></PublicRoute>,
      },
      {
        path: 'published/:slug',
        element: <PublicRoute><PublishedProject /></PublicRoute>,
      },
      {
        path: 'sign-language',
        element: <PublicRoute><SignLanguagePage /></PublicRoute>,
      },
      {
        path: 'smart-city',
        element: <PublicRoute><SmartCitySection /></PublicRoute>,
      },
      {
        path: 'smart-city/architectural-design',
        element: <PublicRoute><AIArchitecturalDesign /></PublicRoute>,
      },
      {
        path: 'smart-city/robotic-construction',
        element: <PublicRoute><RoboticConstruction /></PublicRoute>,
      },
      {
        path: 'smart-city/interior-design',
        element: <PublicRoute><AIInteriorDesign /></PublicRoute>,
      },
      {
        path: 'gju-competition',
        element: <PublicRoute><GJUCompetition /></PublicRoute>,
      },
      {
        path: 'face-pay',
        element: <PublicRoute><FacePayAI /></PublicRoute>,
      },
      {
        path: 'ai-future-store',
        element: <PublicRoute><AIFutureStore /></PublicRoute>,
      },
      {
        path: 'gju/robotics-generator',
        element: <PublicRoute><RoboticsGenerator /></PublicRoute>,
      },
      {
        path: 'gju/jordan-digital-twin',
        element: <PublicRoute><JordanDigitalTwin /></PublicRoute>,
      },
      {
        path: 'hassan-garden-ai',
        element: <PublicRoute><HassanGardenAI /></PublicRoute>,
      },
      {
        path: 'memory-tree',
        element: <PublicRoute><MemoryTree /></PublicRoute>,
      },
      {
        path: 'cancer-detection',
        element: <PublicRoute><CancerDetection /></PublicRoute>,
      },
      {
        path: 'damij/auth',
        element: <DamijAuth />,
      },
      {
        path: 'damij/auth/reset',
        element: <DamijResetPassword />,
      },
      {
        path: 'damij/doctor-survey',
        element: <DamijDoctorSurvey />,
      },
      {
        path: 'damij/results',
        element: <DamijResults />,
      },
      {
        path: 'docs',
        element: <DamijDocs />,
      },
      {
        path: 'damij',
        element: <DamijAuthGuard><DamijLayout /></DamijAuthGuard>,
        children: [
          { index: true, element: <DamijLanding /> },
          { path: 'docs', element: <DamijDocs /> },
          { path: 'doctor-survey', element: <DamijDoctorSurvey /> },
          { path: 'braille', element: <BrailleHome /> },
          
          { path: 'braille/braille-to-text', element: <BrailleToText /> },
          { path: 'braille/learn', element: <BrailleLearn /> },
          { path: 'braille/universal', element: <UniversalBrailleConverter /> },
          { path: 'braille/tactile', element: <TactileGraphics /> },
          { path: 'braille/interactive-learn', element: <InteractiveBrailleLearn /> },
          { path: 'blind-eye', element: <BlindEyeHome /> },
          { path: 'blind-eye/navigate', element: <BlindEyeNavigator /> },
          { path: 'blind-eye/settings', element: <BlindEyeSettings /> },
          { path: 'blind-eye/onboarding', element: <BlindEyeOnboarding /> },
          {
            path: 'autism',
            element: <AutismLayout />,
            children: [
              { index: true, element: <AutismHome /> },
              { path: 'diagnosis', element: <AutismDiagnosis /> },
              { path: 'therapy', element: <AutismTherapy /> },
              { path: 'plan', element: <AutismTherapyPlan /> },
              { path: 'play', element: <AutismGamePlayer /> },
              { path: 'profile', element: <AutismProfile /> },
              { path: 'program/setup', element: <AutismProgramSetup /> },
              { path: 'program/:programId', element: <AutismProgramCalendar /> },
              { path: 'program/:programId/dashboard', element: <AutismProgressDashboard /> },
              { path: 'program/:programId/day/:dayId', element: <AutismDayView /> },
            ],
          },
          { path: 'adhd', element: <ADHDHome /> },
          { path: 'adhd/screening', element: <ADHDScreening /> },
          { path: 'adhd/screening/report/:assessmentId', element: <ADHDScreeningReport /> },
          { path: 'adhd/screening/:instrumentKey', element: <ADHDInstrumentRunner /> },
          { path: 'adhd/assessment', element: <ADHDAssessmentHub /> },
          { path: 'adhd/assessment/cpt', element: <ADHDCPTTask /> },
          { path: 'adhd/assessment/nback', element: <ADHDNBackTask /> },
          { path: 'adhd/assessment/stroop', element: <ADHDStroopTask /> },
          { path: 'adhd/assessment/gonogo', element: <ADHDGoNoGoTask /> },
          { path: 'adhd/training', element: <ADHDTrainingHub /> },
          { path: 'adhd/training/focus', element: <ADHDFocusBuilder /> },
          { path: 'adhd/training/legacy', element: <ADHDTraining /> },
          { path: 'adhd/interventions', element: <ADHDInterventions /> },
          { path: 'adhd/dashboard', element: <ADHDDashboard /> },
          { path: 'adhd/resources', element: <ADHDResources /> },
          { path: 'adhd/games', element: <ADHDGamesHub /> },
          { path: 'adhd/games/play/:gameKey', element: <ADHDGamePlay /> },
          { path: 'adhd/games/report/:reportId', element: <ADHDDiagnosticReport /> },
          { path: 'adhd/program/setup', element: <ADHDProgramSetup /> },
          { path: 'adhd/program/:programId', element: <ADHDProgramCalendar /> },
          { path: 'adhd/program/:programId/day/:dayId', element: <ADHDProgramDay /> },
          { path: 'adhd/monthly', element: <ADHDMonthlyTracker /> },
          { path: 'dashboard', element: <DamijDashboard /> },
          { path: 'sign', element: <SignHome /> },
          { path: 'sign/translator', element: <SignTranslator /> },
          { path: 'sign/youtube', element: <YouTubeSignTranslator /> },
          { path: 'sign/dictionary', element: <SignDictionaryAdmin /> },
          { path: 'sign/vocab-overrides', element: <SignVocabOverridesAdmin /> },
          { path: 'sensory', element: <SensoryHome /> },
          { path: 'sensory/profile', element: <SensoryProfileSetup /> },
          { path: 'sensory/upload', element: <SensoryUpload /> },
          { path: 'sensory/output', element: <SensoryOutput /> },
          { path: 'sensory/image-tactile', element: <SensoryImageTactile /> },
          { path: 'sensory/log', element: <SensoryInteractionLog /> },
          { path: 'sensory/haptic-settings', element: <SensoryHapticSettings /> },
          { path: 'sensory/unified-comm', element: <SensoryUnifiedComm /> },
          { path: 'sensory/tri-sense', element: <SensoryTriSense /> },
          { path: 'sensory/adaptive-ui', element: <SensoryAdaptiveUI /> },
          { path: 'clinical', element: <ClinicalHome /> },
          { path: 'clinical/cases', element: <ClinicalCases /> },
          { path: 'clinical/lab', element: <ClinicalLab /> },
          { path: 'clinical/free', element: <ClinicalFreeExperiment /> },
          { path: 'clinical/reports', element: <ClinicalReports /> },
          { path: 'clinical/case/:caseId', element: <ClinicalCaseDetail /> },
          { path: 'clinical/lab/:sessionId', element: <ClinicalLabSession /> },
          { path: 'clinical/report/:reportId', element: <ClinicalReport /> },
          { path: 'clinical/dashboard', element: <ClinicalDashboard /> },
          { path: 'clinical/compare', element: <ClinicalCompare /> },
          { path: 'clinical/portfolio', element: <ClinicalPortfolio /> },
          { path: 'clinical/public/:token', element: <ClinicalPublicReport /> },
          { path: 'sources', element: <SourcesLibrary /> },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      }
    ]
  }
]);

function App() {
  return (
    <AccessibilityProvider>
      <RouterProvider router={router} />
    </AccessibilityProvider>
  );
}

export default App;
