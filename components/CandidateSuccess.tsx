import React from 'react';
import { JobConfig, AppLanguage } from '../types';

interface CandidateSuccessProps {
  config: JobConfig;
  onReturnHome: () => void;
}

const UI_TEXT = {
  [AppLanguage.ENGLISH]: {
    title: "Interview Complete",
    subtitle: "Thank you for your time.",
    message: "Your responses have been recorded and sent to the recruitment team. We will be in touch shortly.",
    button: "Return to Home"
  },
  [AppLanguage.SPANISH]: {
    title: "Entrevista Completada",
    subtitle: "Gracias por tu tiempo.",
    message: "Tus respuestas han sido registradas y enviadas al equipo de reclutamiento. Nos pondremos en contacto contigo pronto.",
    button: "Volver al Inicio"
  },
  [AppLanguage.PORTUGUESE]: {
    title: "Entrevista Concluída",
    subtitle: "Obrigado pelo seu tempo.",
    message: "Suas respostas foram registradas e enviadas para a equipe de recrutamento. Entraremos em contato em breve.",
    button: "Voltar ao Início"
  }
};

export const CandidateSuccess: React.FC<CandidateSuccessProps> = ({ config, onReturnHome }) => {
  const text = UI_TEXT[config.language] || UI_TEXT[AppLanguage.ENGLISH];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6 animate-fade-in-up">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{text.title}</h2>
          <p className="text-slate-500 font-medium mt-1">{text.subtitle}</p>
        </div>

        <p className="text-slate-600 leading-relaxed">
          {text.message}
        </p>
        
        <hr className="border-slate-100" />
        
        <button 
          onClick={onReturnHome}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-indigo-200"
        >
          {text.button}
        </button>
      </div>
    </div>
  );
};
