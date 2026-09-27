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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PlatformGuideAssistant from '@/components/PlatformGuideAssistant';
import WelcomeGuide from '@/components/WelcomeGuide';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LiveSupportCornerWidget } from '@/components/support/LiveSupportCornerWidget';
import SafeBoundary from '@/components/common/SafeBoundary';
import Index from './pages/Index';

// Removed: UploadTextbooks, UploadJordanianContent, ManageJordanianContent
// Now using UploadedSourcesTab inside JordanianAssistant
import DamijAuthGuard from './components/damij/DamijAuthGuard';

// Universal sleek fallback for lazy loaded routes
const GlobalFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent text-white font-sans">
    <div className="relative w-12 h-12 mb-3">
      <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
      <div className="absolute inset-1.5 rounded-full border-2 border-purple-500/20 border-b-purple-400 animate-[spin_1.2s_linear_infinite_reverse]" />
    </div>
    <div className="text-xs font-semibold text-slate-300/80 animate-pulse">...جاري التحميل</div>
  </div>
);

const wrap = <P extends object>(Comp: React.LazyExoticComponent<ComponentType<P>>) => {
  const Wrapped: React.FC<P> = (props) => (
    <Suspense fallback={<GlobalFallback />}>
      <Comp {...props} />
    </Suspense>
  );
  return Wrapped;
};

// ===== Code-split lazy loaded platform pages =====
const StudyScheduleCreator = wrap(lazy(() => import("./pages/StudyScheduleCreator")));
const StudentProgress = wrap(lazy(() => import("./pages/StudentProgress")));
const NotFound = wrap(lazy(() => import("./pages/NotFound")));
const Physics = wrap(lazy(() => import("./pages/Physics")));
const Chemistry = wrap(lazy(() => import("./pages/Chemistry")));
const Mathematics = wrap(lazy(() => import("./pages/Mathematics")));
const CalculatorPage = wrap(lazy(() => import("./pages/CalculatorPage")));
const GraphVisualizerPage = wrap(lazy(() => import("./pages/GraphVisualizerPage")));
const MathematiciansPage = wrap(lazy(() => import("./pages/MathematiciansPage")));
const MathAIAssistantPage = wrap(lazy(() => import("./pages/MathAIAssistantPage")));
const Biology = wrap(lazy(() => import("./pages/Biology")));
const SubjectPuzzles = wrap(lazy(() => import("./pages/SubjectPuzzles")));
const VisualLibrary = wrap(lazy(() => import("./pages/VisualLibrary")));
const UploadImagePage = wrap(lazy(() => import("./pages/UploadImagePage")));
const ScientificJournal = wrap(lazy(() => import("./pages/ScientificJournal")));
const UploadJournalPage = wrap(lazy(() => import("./pages/UploadJournalPage")));
const TeacherAchievements = wrap(lazy(() => import("./pages/TeacherAchievements")));
const TeacherAchievementDetail = wrap(lazy(() => import("./pages/TeacherAchievementDetail")));
const StudyOrganization = wrap(lazy(() => import("./pages/StudyOrganization")));
const ChatRooms = wrap(lazy(() => import("./pages/ChatRooms")));
const Auth = wrap(lazy(() => import("./pages/Auth")));
const FalakKnowledgeAI = wrap(lazy(() => import("./pages/FalakKnowledgeAI")));
const MathPuzzles = wrap(lazy(() => import("./pages/MathPuzzles")));
const UserProfile = wrap(lazy(() => import("./pages/UserProfile")));
const Contact = wrap(lazy(() => import("./pages/Contact")));
const PuzzleDetails = wrap(lazy(() => import("./pages/PuzzleDetails")));
const EducationalVideos = wrap(lazy(() => import("./pages/EducationalVideos")));
const ScientificPlatforms = wrap(lazy(() => import("./pages/ScientificPlatforms")));
const LiteraryPlatforms = wrap(lazy(() => import("./pages/LiteraryPlatforms")));
const IslamicEducation = wrap(lazy(() => import("./pages/IslamicEducation")));
const HijriEventsExplorer = wrap(lazy(() => import("./pages/HijriEventsExplorer")));
const IslamicHistoricalEras = wrap(lazy(() => import("./pages/IslamicHistoricalEras")));
const BTEC = wrap(lazy(() => import("./pages/BTEC")));
const BTECInformationTechnology = wrap(lazy(() => import("./pages/BTECInformationTechnology")));
const TechCodingPlatform = wrap(lazy(() => import("./pages/TechCodingPlatform")));
const AIPlatformBuilderPro = wrap(lazy(() => import("./pages/AIPlatformBuilderPro")));
const Complaints = wrap(lazy(() => import("./pages/Complaints")));
const BTECStudentProjects = wrap(lazy(() => import("./components/btec/BTECStudentProjects")));
const CodeFixerSection = wrap(lazy(() => import("./components/btec/CodeFixerSection")));
const DevelopmentTipsSection = wrap(lazy(() => import("./components/btec/DevelopmentTipsSection")));
const BuildPlatformSection = wrap(lazy(() => import("./components/btec/BuildPlatformSection")));
const EnglishLanguage = wrap(lazy(() => import("./pages/EnglishLanguage")));
const ScientificSimulations = wrap(lazy(() => import("./pages/ScientificSimulations")));
const ScientificSimulationsHub = wrap(lazy(() => import("./pages/ScientificSimulationsHub")));
const ExperimentsSection = wrap(lazy(() => import("./pages/ExperimentsSection")));
const BlackbodyRadiationSimulation = wrap(lazy(() => import("./pages/BlackbodyRadiationSimulation")));
const BuildAtomSimulation = wrap(lazy(() => import("./pages/BuildAtomSimulation")));
const LHCSimulation = wrap(lazy(() => import("./pages/LHCSimulation")));
const ElectromagneticWavesSimulation = wrap(lazy(() => import("./pages/ElectromagneticWavesSimulation")));
const NuclearReactionsSimulation = wrap(lazy(() => import("./pages/NuclearReactionsSimulation")));
const ChemicalReactionsSimulation = wrap(lazy(() => import("./pages/ChemicalReactionsSimulation")));
const FourierSeriesSimulation = wrap(lazy(() => import("./pages/FourierSeriesSimulation")));
const Function3DVisualization = wrap(lazy(() => import("./pages/Function3DVisualization")));
const OpticsLabSimulation = wrap(lazy(() => import("./pages/OpticsLabSimulation")));
const CircuitBuilderSimulation = wrap(lazy(() => import("./pages/CircuitBuilderSimulation")));
const CircuitBuilderAdvanced = wrap(lazy(() => import("./pages/CircuitBuilderAdvanced")));
const ProjectileMotionSimulation = wrap(lazy(() => import("./pages/ProjectileMotionSimulation")));
const ProjectileMotion3D = wrap(lazy(() => import("./pages/ProjectileMotion3D")));
const SolarSystemSimulation = wrap(lazy(() => import("./pages/SolarSystemSimulation")));
const SolarSystem3D = wrap(lazy(() => import("./pages/SolarSystem3D")));
const GeneticsLabSimulation = wrap(lazy(() => import("./pages/GeneticsLabSimulation")));
const EcosystemSimulation = wrap(lazy(() => import("./pages/EcosystemSimulation")));
const ElectromagnetismLabSimulation = wrap(lazy(() => import("./pages/ElectromagnetismLabSimulation")));
const WavesAndSoundSimulation = wrap(lazy(() => import("./pages/WavesAndSoundSimulation")));
const StaticElectricitySimulation = wrap(lazy(() => import("./pages/StaticElectricitySimulation")));
const AdvancedAstronomySimulation = wrap(lazy(() => import("./pages/AdvancedAstronomySimulation")));
const QuantumMechanicsSimulation = wrap(lazy(() => import("./pages/QuantumMechanicsSimulation")));
const AnalyticalChemistrySimulation = wrap(lazy(() => import("./pages/AnalyticalChemistrySimulation")));
const ElectrochemistrySimulation = wrap(lazy(() => import("./pages/ElectrochemistrySimulation")));
const MolecularBiologySimulation = wrap(lazy(() => import("./pages/MolecularBiologySimulation")));
const HumanBodySimulation = wrap(lazy(() => import("./pages/HumanBodySimulation")));
const AdvancedNuclearSimulation = wrap(lazy(() => import("./pages/AdvancedNuclearSimulation")));
const DigitalElectronicsSimulation = wrap(lazy(() => import("./pages/DigitalElectronicsSimulation")));
const EarthSciencesSimulation = wrap(lazy(() => import("./pages/EarthSciencesSimulation")));
const RocketScienceSimulation = wrap(lazy(() => import("./pages/RocketScienceSimulation")));
const AdvancedOpticsSimulation = wrap(lazy(() => import("./pages/AdvancedOpticsSimulation")));
const MaterialsScienceSimulation = wrap(lazy(() => import("./pages/MaterialsScienceSimulation")));
const ThermodynamicsSimulation = wrap(lazy(() => import("./pages/ThermodynamicsSimulation")));
const Thermodynamics3D = wrap(lazy(() => import("./pages/Thermodynamics3D")));
const RocketScience3D = wrap(lazy(() => import("./pages/RocketScience3D")));
const FluidMechanicsSimulation = wrap(lazy(() => import("./pages/FluidMechanicsSimulation")));
const FluidMechanics3D = wrap(lazy(() => import("./pages/FluidMechanics3D")));
const CircularMotionSimulation = wrap(lazy(() => import("./pages/CircularMotionSimulation")));
const CircularMotion3D = wrap(lazy(() => import("./pages/CircularMotion3D")));
const SpecialRelativitySimulation = wrap(lazy(() => import("./pages/SpecialRelativitySimulation")));
const InterferenceDiffractionSimulation = wrap(lazy(() => import("./pages/InterferenceDiffractionSimulation")));
const PlasmaPhysicsSimulation = wrap(lazy(() => import("./pages/PlasmaPhysicsSimulation")));
const ChemicalKineticsSimulation = wrap(lazy(() => import("./pages/ChemicalKineticsSimulation")));
const OrganicChemistrySimulation = wrap(lazy(() => import("./pages/OrganicChemistrySimulation")));
const StatesOfMatterSimulation = wrap(lazy(() => import("./pages/StatesOfMatterSimulation")));
const AcidsBasesSimulation = wrap(lazy(() => import("./pages/AcidsBasesSimulation")));
const NuclearApplicationsSimulation = wrap(lazy(() => import("./pages/NuclearApplicationsSimulation")));
const LivingCellSimulation = wrap(lazy(() => import("./pages/LivingCellSimulation")));
const CellDivisionSimulation = wrap(lazy(() => import("./pages/CellDivisionSimulation")));
const PhotosynthesisRespirationSimulation = wrap(lazy(() => import("./pages/PhotosynthesisRespirationSimulation")));
const ImmuneSystemSimulation = wrap(lazy(() => import("./pages/ImmuneSystemSimulation")));
const EvolutionSimulation = wrap(lazy(() => import("./pages/EvolutionSimulation")));
const SpatialGeometrySimulation = wrap(lazy(() => import("./pages/SpatialGeometrySimulation")));
const ProbabilitySimulation = wrap(lazy(() => import("./pages/ProbabilitySimulation")));
const RoboticsSimulation = wrap(lazy(() => import("./pages/RoboticsSimulation")));
const MechanicalEngineeringSimulation = wrap(lazy(() => import("./pages/MechanicalEngineeringSimulation")));
const PhotoelectricEffectSimulation = wrap(lazy(() => import("./pages/PhotoelectricEffectSimulation")));
const MillikanOilDropSimulation = wrap(lazy(() => import("./pages/MillikanOilDropSimulation")));
const BlackHoleSimulation = wrap(lazy(() => import("./pages/BlackHoleSimulation")));
const RutherfordScatteringSimulation = wrap(lazy(() => import("./pages/RutherfordScatteringSimulation")));
const ChemicalEquilibriumSimulation = wrap(lazy(() => import("./pages/ChemicalEquilibriumSimulation")));
const CrisprGeneEditingSimulation = wrap(lazy(() => import("./pages/CrisprGeneEditingSimulation")));
const XRayDiffractionSimulation = wrap(lazy(() => import("./pages/XRayDiffractionSimulation")));
const AerodynamicsWindTunnelSimulation = wrap(lazy(() => import("./pages/AerodynamicsWindTunnelSimulation")));
const SuperconductivitySimulation = wrap(lazy(() => import("./pages/SuperconductivitySimulation")));
const OrbitalMechanicsSimulation = wrap(lazy(() => import("./pages/OrbitalMechanicsSimulation")));
const EnvironmentalSustainability = wrap(lazy(() => import("./pages/EnvironmentalSustainability")));
const CarbonCalculator = wrap(lazy(() => import("./pages/CarbonCalculator")));
const SchoolProjects = wrap(lazy(() => import("./pages/SchoolProjects")));
const HomeProjects = wrap(lazy(() => import("./pages/HomeProjects")));
const PersonalSustainabilityIndex = wrap(lazy(() => import("./pages/PersonalSustainabilityIndex")));
const PsychologicalGuide = wrap(lazy(() => import("./pages/PsychologicalGuide")));
const StudentProjects = wrap(lazy(() => import("./components/environmental/StudentProjects")));
const RecyclingProjectAdvisor = wrap(lazy(() => import("./pages/RecyclingProjectAdvisor")));
const EcoPredictDashboard = wrap(lazy(() => import("./pages/EcoPredictDashboard")));
const MedicalAssistant = wrap(lazy(() => import("./pages/MedicalAssistant")));
const AdministratorsTeachers = wrap(lazy(() => import("./pages/AdministratorsTeachers")));
const ArtDesign = wrap(lazy(() => import("./pages/ArtDesign")));
const DrawingChallengeRoom = wrap(lazy(() => import("./pages/DrawingChallengeRoom")));
const CommunicationBridge = wrap(lazy(() => import("./pages/CommunicationBridge")));
const TeacherRegistration = wrap(lazy(() => import("./pages/TeacherRegistration")));
const TeacherDashboard = wrap(lazy(() => import("./pages/TeacherDashboard")));
const TeacherAssignments = wrap(lazy(() => import("./pages/TeacherAssignments")));
const TeacherNotes = wrap(lazy(() => import("./pages/TeacherNotes")));
const TeacherStatistics = wrap(lazy(() => import("./pages/TeacherStatistics")));
const ParentRegistration = wrap(lazy(() => import("./pages/ParentRegistration")));
const ParentDashboard = wrap(lazy(() => import("./pages/ParentDashboard")));
const ParentAssignments = wrap(lazy(() => import("./pages/ParentAssignments")));
const ParentNotes = wrap(lazy(() => import("./pages/ParentNotes")));
const ClassChat = wrap(lazy(() => import("./pages/ClassChat")));
const ControlCenter = wrap(lazy(() => import("./pages/ControlCenter")));
const SuperAdminControlHub = wrap(lazy(() => import("./pages/admin/SuperAdminControlHub")));
const StudentCommunityForum = wrap(lazy(() => import("./pages/StudentCommunityForum")));
const EducationSection = wrap(lazy(() => import("./pages/EducationSection")));
const AIAssistantSection = wrap(lazy(() => import("./pages/AIAssistantSection")));
const JordanianAssistant = wrap(lazy(() => import("./pages/JordanianAssistant")));
const ConversationView = wrap(lazy(() => import("./pages/ConversationView")));
const SchoolMagazine = wrap(lazy(() => import("./pages/SchoolMagazine")));
const NewsDetail = wrap(lazy(() => import("./pages/NewsDetail")));
const MathematicsQuestionBank = wrap(lazy(() => import("./pages/MathematicsQuestionBank")));
const AIPlatformBuilder = wrap(lazy(() => import("./pages/AIPlatformBuilder")));
const PublishedProject = wrap(lazy(() => import("./pages/PublishedProject")));
const TenantSettings = wrap(lazy(() => import("./pages/TenantSettings")));
const PlatformDocumentation = wrap(lazy(() => import("./pages/PlatformDocumentation")));
const SpacedRepetitionSystem = wrap(lazy(() => import("./pages/SpacedRepetitionSystem")));
const AIImageGenerator = wrap(lazy(() => import("./pages/AIImageGenerator")));
const SignLanguagePage = wrap(lazy(() => import("./pages/SignLanguagePage")));
const ExamScannerPage = wrap(lazy(() => import("./pages/ExamScannerPage")));
const SmartCitySection = wrap(lazy(() => import("./pages/SmartCitySection")));
const AIArchitecturalDesign = wrap(lazy(() => import("./pages/AIArchitecturalDesign")));
const RoboticConstruction = wrap(lazy(() => import("./pages/RoboticConstruction")));
const AIInteriorDesign = wrap(lazy(() => import("./pages/AIInteriorDesign")));
const GJUCompetition = wrap(lazy(() => import("./pages/GJUCompetition")));
const FacePayAI = wrap(lazy(() => import("./pages/FacePayAI")));
const AIFutureStore = wrap(lazy(() => import("./pages/AIFutureStore")));
const RoboticsGenerator = wrap(lazy(() => import("./pages/RoboticsGenerator")));
const RoboticsSection = wrap(lazy(() => import("./pages/RoboticsSection")));
const JordanDigitalTwin = wrap(lazy(() => import("./pages/JordanDigitalTwin")));
const CancerDetection = wrap(lazy(() => import("./pages/CancerDetection")));

// ===== Damij: lazy-loaded =====
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
      {!isGJUMode && <SafeBoundary name="WelcomeGuide"><WelcomeGuide /></SafeBoundary>}
      {!isGJUMode && <SafeBoundary name="PlatformGuideAssistant"><PlatformGuideAssistant /></SafeBoundary>}
      {!isGJUMode && <SafeBoundary name="LiveSupportCornerWidget"><LiveSupportCornerWidget /></SafeBoundary>}
      {!isGJUMode && <SafeBoundary name="AccessibilityPanel"><AccessibilityPanel /></SafeBoundary>}
      {isGJUMode && !isDamijRoute && <SafeBoundary name="GJUFloatingNav"><GJUFloatingNav /></SafeBoundary>}
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
        path: 'community',
        element: <PublicRoute><StudentCommunityForum /></PublicRoute>,
      },
      {
        path: 'forum',
        element: <PublicRoute><StudentCommunityForum /></PublicRoute>,
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
        element: <AuthGuard><ElectromagnetismLabSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/waves-sound',
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
        element: <AuthGuard><MechanicalEngineeringSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/photoelectric-effect',
        element: <AuthGuard><PhotoelectricEffectSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/millikan-oil-drop',
        element: <AuthGuard><MillikanOilDropSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/black-hole-relativity',
        element: <AuthGuard><BlackHoleSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/rutherford-scattering',
        element: <AuthGuard><RutherfordScatteringSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/chemical-equilibrium',
        element: <AuthGuard><ChemicalEquilibriumSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/crispr-gene-editing',
        element: <AuthGuard><CrisprGeneEditingSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/xray-diffraction',
        element: <AuthGuard><XRayDiffractionSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/aerodynamics-wind-tunnel',
        element: <AuthGuard><AerodynamicsWindTunnelSimulation /></AuthGuard>,
      },
      {
        path: 'simulation/superconductivity',
        element: <AuthGuard><SuperconductivitySimulation /></AuthGuard>,
      },
      {
        path: 'simulation/orbital-mechanics',
        element: <AuthGuard><OrbitalMechanicsSimulation /></AuthGuard>,
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
        path: 'admin',
        element: <SuperAdminControlHub />,
      },
      {
        path: 'control-center',
        element: <SuperAdminControlHub />,
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
        path: 'docs',
        element: <PublicRoute><PlatformDocumentation /></PublicRoute>,
      },
      {
        path: 'documentation',
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
        path: 'robotics-section',
        element: <PublicRoute><RoboticsSection /></PublicRoute>,
      },
      {
        path: 'robotics',
        element: <PublicRoute><RoboticsSection /></PublicRoute>,
      },
      {
        path: 'gju/jordan-digital-twin',
        element: <PublicRoute><JordanDigitalTwin /></PublicRoute>,
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
        path: 'sources',
        element: <Navigate to="/damij/sources" replace />,
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
    <ThemeProvider>
      <AccessibilityProvider>
        <RouterProvider router={router} />
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;
