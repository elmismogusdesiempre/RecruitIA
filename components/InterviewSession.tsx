import React, { useState, useEffect, useRef } from 'react';
import { JobConfig, Message, AppLanguage } from '../types';
import { startInterviewSession } from '../services/geminiService';
import { QuotaManager, QuotaExceededError } from '../services/quotaManager';
import { Loader } from './UI/Loader';
import { Chat } from '@google/genai';

interface InterviewSessionProps {
  config: JobConfig;
  onComplete: (messages: Message[]) => void;
}

const UI_TEXT = {
  [AppLanguage.ENGLISH]: {
    placeholder: "Type your answer here...",
    live: "Live Interview",
    disclaimer: "AI generated content may be inaccurate.",
    startMessage: "Hello. Start the interview in English.",
    quotaTitle: "Daily Limit Reached",
    quotaDesc: "To prevent costs, this application has hit its daily safety limit for AI processing.",
    quotaAction: "Please contact the administrator or try again tomorrow.",
    initError: "Failed to initialize interview. Please try again."
  },
  [AppLanguage.SPANISH]: {
    placeholder: "Escribe tu respuesta aquí...",
    live: "Entrevista en Vivo",
    disclaimer: "El contenido generado por IA puede ser inexacto.",
    startMessage: "Hola. Inicia la entrevista en Español.",
    quotaTitle: "Límite Diario Alcanzado",
    quotaDesc: "Para prevenir costos, esta aplicación ha alcanzado su límite de seguridad diario de procesamiento de IA.",
    quotaAction: "Por favor contacte al administrador o intente de nuevo mañana.",
    initError: "Error al iniciar la entrevista. Por favor intente de nuevo."
  },
  [AppLanguage.PORTUGUESE]: {
    placeholder: "Digite sua resposta aqui...",
    live: "Entrevista ao Vivo",
    disclaimer: "O conteúdo gerado por IA pode ser impreciso.",
    startMessage: "Olá. Inicie a entrevista em Português.",
    quotaTitle: "Limite Diário Atingido",
    quotaDesc: "Para evitar custos, este aplicativo atingiu seu limite de segurança diário para processamento de IA.",
    quotaAction: "Entre em contato com o administrador ou tente novamente amanhã.",
    initError: "Falha ao iniciar entrevista. Tente novamente."
  }
};

export const InterviewSession: React.FC<InterviewSessionProps> = ({ config, onComplete }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quotaError, setQuotaError] = useState(false);
  const [initError, setInitError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const text = UI_TEXT[config.language] || UI_TEXT[AppLanguage.ENGLISH];

  // Helper to check quota before actions
  const checkQuota = () => {
    const quotaType = config.modelSelection.includes('flash') ? 'FLASH' : 'PRO';
    QuotaManager.checkAndIncrement(quotaType);
  };

  // Initialize Chat
  useEffect(() => {
    const init = async () => {
      setIsTyping(true);
      try {
        const chat = await startInterviewSession(config);
        setChatSession(chat);
        
        // Check Quota for the greeting message
        checkQuota();
        
        // Initial greeting - we prime the model to speak the correct language
        const response = await chat.sendMessage({ message: text.startMessage });
        
        setMessages([{
          role: 'model',
          text: response.text || "...",
          timestamp: new Date()
        }]);
      } catch (error) {
        if (error instanceof QuotaExceededError) {
          setQuotaError(true);
        } else {
          console.error("Failed to start session", error);
          setInitError(true);
        }
      } finally {
        setIsTyping(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSession) return;

    const userMsg: Message = { role: 'user', text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      checkQuota(); // Check quota before sending
      const result = await chatSession.sendMessage({ message: userMsg.text });
      const modelText = result.text || "";

      if (modelText.includes("INTERVIEW_COMPLETE")) {
         // Clean up the termination keyword for display
         const cleanText = modelText.replace("INTERVIEW_COMPLETE", "").trim();
         if (cleanText) {
             setMessages(prev => [...prev, { role: 'model', text: cleanText, timestamp: new Date() }]);
         }
         // End session after a brief delay for reading
         setTimeout(() => onComplete([...messages, userMsg, { role: 'model', text: cleanText, timestamp: new Date() }]), 2000);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: modelText, timestamp: new Date() }]);
      }

    } catch (error) {
      if (error instanceof QuotaExceededError) {
        setQuotaError(true);
      } else {
        console.error("Error sending message", error);
        setMessages(prev => [...prev, { role: 'model', text: "...", timestamp: new Date() }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (quotaError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-red-50 p-6 text-center animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-red-100">
           <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
             🛑
           </div>
           <h2 className="text-2xl font-bold text-slate-800 mb-2">{text.quotaTitle}</h2>
           <p className="text-slate-600 mb-6">{text.quotaDesc}</p>
           <div className="text-sm bg-slate-50 p-3 rounded-lg text-slate-500 border border-slate-200">
             {text.quotaAction}
           </div>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-slate-50 p-6 text-center animate-fade-in">
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm">
                <div className="text-4xl mb-4">🔌</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Connection Error</h3>
                <p className="text-slate-500 mb-4">{text.initError}</p>
                <button onClick={() => window.location.reload()} className="text-indigo-600 font-medium hover:underline">
                    Reload Application
                </button>
           </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        {config.companyLogoUrl ? (
          <img 
            src={config.companyLogoUrl} 
            alt={config.companyName} 
            className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-white" 
          />
        ) : (
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl">
            {config.companyName.charAt(0)}
          </div>
        )}
        
        <div>
          <h2 className="font-bold text-slate-800">{config.jobTitle}</h2>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {text.live} • {config.companyName}
          </p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
            }`}>
              {/* Increased font size from text-sm to text-lg/xl */}
              <p className="whitespace-pre-wrap text-lg md:text-xl leading-relaxed">{msg.text}</p>
              <span className={`text-xs mt-2 block opacity-70 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-100 rounded-2xl p-4 rounded-bl-none shadow-sm">
                <Loader />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={text.placeholder}
            disabled={isTyping}
            /* Added text-lg for larger input text */
            className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-50"
            rows={1}
            style={{ minHeight: '50px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl px-6 font-medium transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          {text.disclaimer}
        </p>
      </div>
    </div>
  );
};