import React, { useState } from 'react';
import { AdminSettings } from './components/AdminSettings';
import { InterviewSession } from './components/InterviewSession';
import { ReportView } from './components/ReportView';
import { AdminDashboard } from './components/AdminDashboard';
import { CandidateSuccess } from './components/CandidateSuccess';
import { AppView, JobConfig, InterviewStyle, Message, AppLanguage } from './types';

const INITIAL_CONFIG: JobConfig = {
  companyName: 'NASE Colombia',
  companyLogoUrl: '',
  companyCulture: 'Orientada al servicio, disciplinada, responsable y puntual.',
  jobTitle: 'Auxiliar de Aseo Hospitalario',
  jobDescription: `Contrato a término fijo
Tiempo Completo
Presencial

NASE Colombia busca personas dinámicas y comprometidas para unirse a nuestro equipo en Cajicá. Si tienes experiencia en el sector hospitalario y estás buscando un nuevo desafío, ¡esta es tu oportunidad!

Requisitos:
- Experiencia mínima de 6 meses en el sector hospitalario
- Residir en Cajicá
- Mínimo noveno grado de bachiller
- Persona activa, disciplinada, responsable y puntual

Funciones:
- Ejecutar labores de aseo y desinfección en áreas de hospitalización
- Asear y desinfectar instalaciones locativas
- Realizar labores de limpieza en general
- Recolectar residuos hospitalarios y disponerlos según normas
- Registrar operaciones en formatos establecidos

Oferta:
- Salario mínimo legal vigente + prestaciones de ley
- Contrato a término fijo
- Horario: Turnos rotativos de domingo a domingo, con día compensatorio en la semana
¿Interesado? ¡Postúlate!
Aportarás valor a nuestra empresa con tu dedicación y habilidades. ¡Esperamos tu candidatura para formar parte de NASE Colombia!
Requerimientos

Educación mínima: Bachillerato / Educación Media
Edad: entre 22 y 50 años
Conocimientos: Trabajo en equipo`,
  jobDescriptionLink: '',
  salary: '$ 1.423.500,00',
  schedule: 'Turnos rotativos D-D',
  experience: 'Mínimo 6 meses',
  jobSummary: '',
  interviewerProfile: 'Profesional de RRHH enfocado en verificar experiencia técnica en protocolos de limpieza hospitalaria y disponibilidad de tiempo.',
  interviewerProfileLink: '',
  interviewerName: 'Equipo de Selección',
  interviewStyle: InterviewStyle.GENERAL,
  questionCount: 5,
  officeLocation: 'Cajicá, Cundinamarca',
  language: AppLanguage.SPANISH,
  candidateName: 'Ernesto Vásquez Flores',
  candidateResume: `Calle Perdiz, 8
Sevilla 41006
620198492
vasquezfloresernesto@outlook.com

Perfil profesional

Personal de limpieza con más de 10 años de experiencia. Poseo una gran ética de trabajo combinada con excelentes habilidades para la aplicación efectiva de productos y técnicas de limpieza para distintas superficies y espacios. Busco unirme a un equipo eficiente y organizado.

Experiencia laboral

Junio 2021 – Actual

Limpiezas Hispal Limp – Sevilla

Personal de limpieza

Conservación periódica de superficies acristaladas, laminadas y reflectantes con la técnica y los productos específicos.
Cumplimiento de la normativa de señalización y seguridad durante la ejecución de las tareas de limpieza.
Almacenamiento y suministro de materiales higiénicos de repuesto en las áreas designadas de las instalaciones.
Julio 2015 – Marzo 2020

MANHUSER Limpieza – Sevilla

Personal de limpieza

Mantenimiento de las diferentes zonas: retirada de polvo, limpieza de suelos y baños, desinfección de sanitarios, etc.
Higienizaciones específicas, proyectos de reciclaje y otros trabajos especiales de mantenimiento requeridos.
Uso de herramientas y máquinas fregadoras, así como limpieza de las mismas, cambio de cepillos y mantenimiento básico.
Noviembre 2010 – Febrero 2015

LimpiezaSM – Sevilla

Ayudante de limpieza

Higienización, limpieza y saneamiento, y vaciado de contenedores y papeleras.
Barrido de alfombras y moquetas.
Cumplimentación de partes de limpieza diarios.
Formación académica

Junio 2008

Centro de Educación de Adultos Manolo Reyes Sevilla

Graduado escolar

Aptitudes

Resistencia física
Limpieza general
Disponibilidad para turnos
Exigencia en los acabados
Vaciado y limpieza de contenedores
Reposición de suministros
Información adicional

Disponibilidad inmediata y flexibilidad horaria

Posibilidad para trabajar en festivos y fines de semana`,
  candidateResumeLink: '',
  modelSelection: 'gemini-3-flash-preview' // Default to Flash as requested
};

const UI_TEXT = {
  [AppLanguage.ENGLISH]: {
    title: "RecruitAI",
    subtitle: "Automated Interview Interface",
    cardTitle: "Start Interview",
    cardDesc: "Ready to begin? Click below to start your session. Ensure you have your resume details ready.",
    btnStart: "Begin Session Now",
    btnNext: "Next",
    footer: "Powered by Gemini AI • v1.0.0",
    adminTitle: "Admin Access",
    adminDesc: "Enter security credentials",
    btnCancel: "Cancel",
    btnUnlock: "Unlock",
    accessDenied: "Access Denied",
    noConfig: "No interview has been configured yet. Please ask the recruiter to setup the interview.",
    // New Cards Text
    tip1Title: "Conversational Flow",
    tip1Desc: "This is a natural conversation. The AI adapts to your answers, just like a human recruiter.",
    tip2Title: "Zero Pressure",
    tip2Desc: "Relax. There are no 'trick' questions. We just want to get to know your professional profile.",
    tip3Title: "Take Your Time",
    tip3Desc: "Think before you type. The session will not close. You have all the time you need to answer.",
    // Summary Card
    summaryTitle: "Confirm Details",
    summaryInterviewer: "Interviewer",
    summaryRole: "Role applying for",
    summaryDesc: "Snapshot",
    lblSalary: "Salary",
    lblSchedule: "Schedule",
    lblExp: "Experience",
    defaultInterviewer: "AI Recruiter"
  },
  [AppLanguage.SPANISH]: {
    title: "RecruitAI",
    subtitle: "Interfaz de Entrevista Automatizada",
    cardTitle: "Iniciar Entrevista",
    cardDesc: "¿Listo para comenzar? Haz clic abajo. Asegúrate de tener los detalles de tu currículum a mano.",
    btnStart: "Comenzar Sesión Ahora",
    btnNext: "Siguiente",
    footer: "Desarrollado por Gemini AI • v1.0.0",
    adminTitle: "Acceso Admin",
    adminDesc: "Ingrese credenciales de seguridad",
    btnCancel: "Cancelar",
    btnUnlock: "Desbloquear",
    accessDenied: "Acceso Denegado",
    noConfig: "No se ha configurado ninguna entrevista aún. Por favor pida al reclutador que configure la entrevista.",
    // New Cards Text
    tip1Title: "Flujo Conversacional",
    tip1Desc: "Esta es una charla natural. La IA se adapta a tus respuestas tal como lo haría una persona.",
    tip2Title: "Cero Presión",
    tip2Desc: "Relájate. No hay preguntas 'trampa'. Solo queremos conocer tu perfil profesional y humano.",
    tip3Title: "Tómate tu Tiempo",
    tip3Desc: "Piensa antes de escribir. La sesión no se cerrará. Tienes todo el tiempo que necesites.",
    // Summary Card
    summaryTitle: "Confirmar Detalles",
    summaryInterviewer: "Entrevistador",
    summaryRole: "Puesto a aplicar",
    summaryDesc: "Resumen",
    lblSalary: "Salario",
    lblSchedule: "Horario",
    lblExp: "Experiencia",
    defaultInterviewer: "Reclutador IA"
  },
  [AppLanguage.PORTUGUESE]: {
    title: "RecruitAI",
    subtitle: "Interface de Entrevista Automatizada",
    cardTitle: "Iniciar Entrevista",
    cardDesc: "Pronto para começar? Clique abaixo. Certifique-se de ter os detalhes do seu currículo prontos.",
    btnStart: "Iniciar Sessão Agora",
    btnNext: "Próximo",
    footer: "Desenvolvido por Gemini AI • v1.0.0",
    adminTitle: "Acesso Admin",
    adminDesc: "Insira credenciais de segurança",
    btnCancel: "Cancelar",
    btnUnlock: "Desbloquear",
    accessDenied: "Acesso Negado",
    noConfig: "Nenhuma entrevista foi configurada ainda. Peça ao recrutador para configurar a entrevista.",
    // New Cards Text
    tip1Title: "Fluxo de Conversa",
    tip1Desc: "Esta é uma conversa natural. A IA se adapta às suas respostas, como um recrutador humano.",
    tip2Title: "Zero Pressão",
    tip2Desc: "Relaxe. Não há perguntas 'pegadinha'. Queremos apenas conhecer seu perfil profissional.",
    tip3Title: "Sem Pressa",
    tip3Desc: "Pense antes de digitar. A sessão não será encerrada. Você tem todo o tempo que precisar.",
     // Summary Card
    summaryTitle: "Confirmar Detalhes",
    summaryInterviewer: "Entrevistador",
    summaryRole: "Cargo",
    summaryDesc: "Resumo",
    lblSalary: "Salário",
    lblSchedule: "Horário",
    lblExp: "Experiência",
    defaultInterviewer: "Recrutador IA"
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('role-selection');
  const [config, setConfig] = useState<JobConfig>(INITIAL_CONFIG);
  const [messages, setMessages] = useState<Message[]>([]);
  const [interviewReady, setInterviewReady] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  
  // Onboarding Step State (0 to 3)
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Admin Login State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Get current text resources based on config language
  const text = UI_TEXT[config.language] || UI_TEXT[AppLanguage.ENGLISH];

  // -- Navigation Handlers --

  const handleRecruiterLogin = () => {
    setView('admin-dashboard');
    setSecretClicks(0);
    setShowAdminLogin(false);
    setPasswordInput('');
  };

  const handleSecretAccess = () => {
    const newCount = secretClicks + 1;
    setSecretClicks(newCount);
    
    // Trigger login modal after 5 clicks
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setSecretClicks(0); 
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin123456") {
      handleRecruiterLogin();
    } else {
      alert(text.accessDenied);
      setPasswordInput('');
    }
  };

  const handleCancelLogin = () => {
    setShowAdminLogin(false);
    setPasswordInput('');
    setSecretClicks(0);
  };

  const handleCandidateLogin = () => {
    // Check if we have a manually generated summary or if we should auto-generate one on the fly for the default config
    // For default config, interviewReady might be false initially until "Start" is clicked, but we want to allow it if config is populated.
    if (config.companyName && config.jobTitle) {
      setView('candidate-interview');
    } else {
      alert(text.noConfig);
    }
  };

  const handleNextStep = () => {
    setOnboardingStep(prev => prev + 1);
  };

  const handleAdminNavigate = (target: 'admin-settings' | 'admin-report') => {
    setView(target);
  };

  const handleConfigSave = (newConfig: JobConfig) => {
    setConfig(newConfig);
    setInterviewReady(true);
    // Return to dashboard after saving
    setView('admin-dashboard');
  };

  const handleInterviewComplete = (msgs: Message[]) => {
    setMessages(msgs);
    setView('candidate-success');
  };

  const handleReturnToRoleSelection = () => {
    setView('role-selection');
    setOnboardingStep(0); // Reset slides
    setSecretClicks(0);
  };

  const handleAdminBack = () => {
    setView('admin-dashboard');
  };

  // -- View Rendering --

  if (view === 'role-selection') {
    
    // Define the content for each slide step
    const steps = [
      {
        icon: '💬',
        title: text.tip1Title,
        desc: text.tip1Desc,
        action: handleNextStep,
        btnText: text.btnNext
      },
      {
        icon: '🧘',
        title: text.tip2Title,
        desc: text.tip2Desc,
        action: handleNextStep,
        btnText: text.btnNext
      },
      {
        icon: '⏳',
        title: text.tip3Title,
        desc: text.tip3Desc,
        action: handleNextStep,
        btnText: text.btnNext
      },
      {
        icon: '📋',
        title: text.summaryTitle,
        // Using a custom render logic for the final summary card
        desc: (
          <div className="text-left bg-white p-6 rounded-2xl border border-slate-100 w-full max-w-lg mx-auto shadow-lg">
             {/* Header */}
             <div className="mb-6">
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                    {config.jobTitle || 'Job Title Not Set'}
                </h3>
                <p className="text-lg text-indigo-600 font-bold">
                    {config.companyName || 'Company Name'} 
                    {config.officeLocation && <span className="text-slate-400 font-normal"> • {config.officeLocation}</span>}
                </p>
             </div>

             {/* AI Summary - Big Bold Text as requested */}
             <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-2">
                 <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 leading-tight">
                    {config.jobSummary || `${config.jobTitle}, ${config.companyName}, ${config.officeLocation}. ${config.salary}. ${config.schedule}.`}
                 </h1>
             </div>
             
             <div className="text-right">
                <span className="text-xs text-slate-400 font-medium italic">
                    (AI generated summary)
                </span>
             </div>
          </div>
        ),
        action: handleCandidateLogin,
        btnText: text.btnStart
      }
    ];

    const currentSlide = steps[onboardingStep];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6 relative overflow-hidden">
        
        {/* Hidden Admin Access Trigger - Top Left Corner */}
        <div 
          onClick={handleSecretAccess}
          className="absolute top-0 left-0 w-24 h-24 z-40 cursor-default"
          title="" 
          style={{ background: 'transparent' }}
        />

        {/* Password Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in-up border border-white/20">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                  🔒
                </div>
                <h3 className="text-xl font-bold text-slate-800">{text.adminTitle}</h3>
                <p className="text-sm text-slate-500">{text.adminDesc}</p>
              </div>
              
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-center tracking-widest"
                  placeholder="••••••••"
                  autoFocus
                />
                <div className="flex gap-3 pt-2">
                    <button 
                        type="button" 
                        onClick={handleCancelLogin}
                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-medium transition"
                    >
                        {text.btnCancel}
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition"
                    >
                        {text.btnUnlock}
                    </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="max-w-2xl w-full flex flex-col gap-8 relative z-10 py-10 items-center">
          
          {/* Header */}
          <div className="text-center text-white mb-2 animate-fade-in-up">
            <h1 className="text-5xl font-extrabold tracking-tight mb-3">{text.title}</h1>
            <p className="opacity-90 text-xl font-light">{text.subtitle}</p>
          </div>

          {/* Unified Slide Card */}
          <div 
            key={onboardingStep} // Key triggers animation on step change
            className="bg-white p-12 rounded-3xl w-full flex flex-col items-center text-center shadow-2xl animate-fade-in-up border-b-8 border-indigo-100 min-h-[450px] justify-center relative"
          >
            <div className="w-28 h-28 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-8 text-5xl shadow-inner transform transition hover:scale-105 duration-300">
              {currentSlide.icon}
            </div>
            
            <h2 className="text-4xl font-extrabold text-slate-800 mb-6 tracking-tight">
                {currentSlide.title}
            </h2>
            
            {/* Render desc as node or text */}
            <div className="text-slate-500 text-xl leading-relaxed max-w-lg mx-auto mb-10 w-full">
              {currentSlide.desc}
            </div>
            
            <button 
                onClick={currentSlide.action}
                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all w-full md:w-auto min-w-[280px] hover:translate-y-[-2px]"
            >
              {currentSlide.btnText}
            </button>

            {/* Step Indicators (Dots) */}
            <div className="absolute bottom-6 flex gap-2">
                {steps.map((_, idx) => (
                    <div 
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            idx === onboardingStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'
                        }`}
                    />
                ))}
            </div>
          </div>

          <div className="text-center text-white/40 text-sm mt-4">
            {text.footer}
          </div>

        </div>
      </div>
    );
  }

  if (view === 'admin-dashboard') {
    return (
      <AdminDashboard 
        config={config} 
        hasReport={messages.length > 0} 
        onNavigate={handleAdminNavigate} 
        onLogout={handleReturnToRoleSelection} 
      />
    );
  }

  if (view === 'admin-settings') {
    return (
      <div className="bg-slate-50 min-h-screen">
          <div className="max-w-4xl mx-auto pt-4 px-4">
            <button onClick={handleAdminBack} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium">
                ← Back to Dashboard
            </button>
          </div>
         <AdminSettings initialConfig={config} onSave={handleConfigSave} />
      </div>
    );
  }

  if (view === 'admin-report') {
    return <ReportView config={config} messages={messages} onBack={handleAdminBack} />;
  }

  if (view === 'candidate-interview') {
    return <InterviewSession config={config} onComplete={handleInterviewComplete} />;
  }

  if (view === 'candidate-success') {
    return <CandidateSuccess config={config} onReturnHome={handleReturnToRoleSelection} />;
  }

  return <div>Unknown State</div>;
};

export default App;