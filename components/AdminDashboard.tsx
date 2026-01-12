import React from 'react';
import { JobConfig, AppLanguage } from '../types';
import { Card } from './UI/Card';

interface AdminDashboardProps {
  config: JobConfig;
  hasReport: boolean;
  onNavigate: (view: 'admin-settings' | 'admin-report') => void;
  onLogout: () => void;
}

const UI_TEXT = {
  [AppLanguage.ENGLISH]: {
    welcome: "Recruiter Dashboard",
    subtitle: "Manage interviews and view results",
    configTitle: "Interview Configuration",
    configDesc: "Setup job details, interviewer persona, and language.",
    configBtn: "Edit Configuration",
    reportTitle: "Candidate Reports",
    reportDesc: "View the analysis of the most recent interview session.",
    reportBtn: "View Latest Report",
    noReport: "No interview data available yet.",
    logout: "Logout"
  },
  [AppLanguage.SPANISH]: {
    welcome: "Panel de Reclutador",
    subtitle: "Gestiona entrevistas y ver resultados",
    configTitle: "Configuración de Entrevista",
    configDesc: "Configura detalles del trabajo, persona del entrevistador e idioma.",
    configBtn: "Editar Configuración",
    reportTitle: "Informes de Candidatos",
    reportDesc: "Ver el análisis de la sesión de entrevista más reciente.",
    reportBtn: "Ver Último Informe",
    noReport: "Aún no hay datos de entrevista disponibles.",
    logout: "Cerrar Sesión"
  },
  [AppLanguage.PORTUGUESE]: {
    welcome: "Painel do Recrutador",
    subtitle: "Gerenciar entrevistas e ver resultados",
    configTitle: "Configuração da Entrevista",
    configDesc: "Configurar detalhes do trabalho, persona do entrevistador e idioma.",
    configBtn: "Editar Configuração",
    reportTitle: "Relatórios de Candidatos",
    reportDesc: "Ver a análise da sessão de entrevista mais recente.",
    reportBtn: "Ver Último Relatório",
    noReport: "Ainda não há dados de entrevista disponíveis.",
    logout: "Sair"
  }
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, hasReport, onNavigate, onLogout }) => {
  const text = UI_TEXT[config.language] || UI_TEXT[AppLanguage.ENGLISH];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{text.welcome}</h1>
            <p className="text-slate-500">{text.subtitle}</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-slate-500 hover:text-red-600 font-medium text-sm transition px-4 py-2 hover:bg-red-50 rounded-lg"
          >
            {text.logout}
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Config Card */}
          <div onClick={() => onNavigate('admin-settings')} className="cursor-pointer group">
            <Card className="h-full border-2 border-transparent group-hover:border-indigo-500 transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="flex flex-col h-full items-center text-center p-4">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 text-2xl">
                  ⚙️
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{text.configTitle}</h3>
                <p className="text-slate-500 mb-6 flex-grow">{text.configDesc}</p>
                <button className="w-full py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {text.configBtn}
                </button>
              </div>
            </Card>
          </div>

          {/* Report Card */}
          <div 
            onClick={() => hasReport && onNavigate('admin-report')} 
            className={`cursor-pointer group ${!hasReport ? 'opacity-60 pointer-events-none grayscale' : ''}`}
          >
            <Card className="h-full border-2 border-transparent group-hover:border-indigo-500 transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="flex flex-col h-full items-center text-center p-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-2xl">
                  📊
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{text.reportTitle}</h3>
                <p className="text-slate-500 mb-6 flex-grow">{text.reportDesc}</p>
                {hasReport ? (
                  <button className="w-full py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                    {text.reportBtn}
                  </button>
                ) : (
                  <span className="text-xs text-orange-500 font-medium bg-orange-50 px-3 py-1 rounded-full">
                    {text.noReport}
                  </span>
                )}
              </div>
            </Card>
          </div>
        </div>
        
        <div className="text-center text-xs text-slate-400 mt-10">
           RecruitAI Admin Panel
        </div>
      </div>
    </div>
  );
};
