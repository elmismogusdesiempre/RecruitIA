import React, { useState, ChangeEvent } from 'react';
import { JobConfig, InterviewStyle, AppLanguage } from '../types';
import { Card } from './UI/Card';
import { generateJobSummary } from '../services/geminiService';

interface AdminSettingsProps {
  initialConfig: JobConfig;
  onSave: (config: JobConfig) => void;
}

const UI_TEXT = {
  [AppLanguage.ENGLISH]: {
    title: "Setup Interview Profile",
    subtitle: "Configure the AI recruiter's knowledge, behavior and language.",
    tabs: {
      basics: "Basics",
      details: "Details",
      candidate: "Candidate",
      persona: "Persona"
    },
    basics: {
      title: "Company & Role Identity",
      companyName: "Company Name",
      logoUrl: "Company Logo URL",
      logoPlaceholder: "https://example.com/logo.png",
      jobTitle: "Job Title",
      language: "Language / Idioma",
      langDesc: "Controls the language of the interview and the app UI.",
      model: "AI Model Engine",
      modelDesc: "Select 'Pro' for complex behavioral interviews, 'Flash' for speed/efficiency.",
      location: "Office Location",
      culture: "Company Culture & Values (Internal Context)",
      cultureDesc: "Describe the company's vibe (e.g., 'Formal', 'Relaxed'). Not shown to candidate.",
      upload: "Upload Text",
      flash: "Gemini 3 Flash (Fast & Efficient)",
      pro: "Gemini 3 Pro (Deep Reasoning)"
    },
    details: {
      title: "Job Context & Requirements",
      salary: "Salary",
      schedule: "Schedule",
      experience: "Experience",
      description: "Upload Job Description (Text/MD)",
      chooseFile: "Choose File",
      orPaste: "or paste text below",
      drivePlaceholder: "Paste Google Drive Link (Document must be accessible)",
      descPlaceholder: "Paste full job description here..."
    },
    candidate: {
      title: "Candidate Profile",
      name: "Candidate Name",
      uploadCv: "Upload CV / Resume",
      cvUploaded: "CV Uploaded",
      uploadPdf: "Upload PDF",
      fileReady: "File ready",
      driveCvPlaceholder: "Or paste Drive Link to Resume",
      pasteCv: "Or Paste Resume Text",
      pasteCvPlaceholder: "Paste resume content here if PDF is not available..."
    },
    persona: {
      title: "Interviewer Configuration",
      name: "Interviewer Name",
      namePlaceholder: "e.g. Sarah from HR",
      nameDesc: "The name the AI will use to introduce itself.",
      style: "Interview Style",
      questions: "Number of Questions",
      persona: "Interviewer Persona (Optional)",
      personaDesc: "Upload a text file describing the tone or 'personality' of the recruiter.",
      uploadPersona: "Upload Persona",
      drivePersona: "Or paste Drive Link to Persona Doc",
      personaPlaceholder: "e.g. Strict technical interviewer who focuses on edge cases..."
    },
    launch: "Launch Interview Environment",
    configuring: "Configuring...",
    generating: "Generating AI Summary..."
  },
  [AppLanguage.SPANISH]: {
    title: "Configurar Perfil de Entrevista",
    subtitle: "Configure el conocimiento, comportamiento e idioma del reclutador IA.",
    tabs: {
      basics: "Básicos",
      details: "Detalles",
      candidate: "Candidato",
      persona: "Persona"
    },
    basics: {
      title: "Identidad de Empresa y Rol",
      companyName: "Nombre de la Empresa",
      logoUrl: "URL del Logo de la Empresa",
      logoPlaceholder: "https://ejemplo.com/logo.png",
      jobTitle: "Título del Puesto",
      language: "Idioma / Language",
      langDesc: "Controla el idioma de la entrevista y de la interfaz.",
      model: "Motor de IA",
      modelDesc: "Seleccione 'Pro' para entrevistas complejas, 'Flash' para velocidad.",
      location: "Ubicación de Oficina",
      culture: "Cultura y Valores (Contexto Interno)",
      cultureDesc: "Describa el ambiente (ej. 'Formal', 'Relajado'). No visible para el candidato.",
      upload: "Subir Texto",
      flash: "Gemini 3 Flash (Rápido y Eficiente)",
      pro: "Gemini 3 Pro (Razonamiento Profundo)"
    },
    details: {
      title: "Contexto y Requisitos del Trabajo",
      salary: "Salario",
      schedule: "Horario",
      experience: "Experiencia",
      description: "Subir Descripción del Trabajo (Texto/MD)",
      chooseFile: "Elegir Archivo",
      orPaste: "o pegar texto abajo",
      drivePlaceholder: "Pegar enlace de Google Drive (Debe ser accesible)",
      descPlaceholder: "Pegue la descripción completa aquí..."
    },
    candidate: {
      title: "Perfil del Candidato",
      name: "Nombre del Candidato",
      uploadCv: "Subir CV / Hoja de Vida",
      cvUploaded: "CV Subido",
      uploadPdf: "Subir PDF",
      fileReady: "Archivo listo",
      driveCvPlaceholder: "O pegar enlace Drive al CV",
      pasteCv: "O Pegar Texto del CV",
      pasteCvPlaceholder: "Pegue el contenido del CV aquí si no tiene PDF..."
    },
    persona: {
      title: "Configuración del Entrevistador",
      name: "Nombre del Entrevistador",
      namePlaceholder: "ej. Sara de RRHH",
      nameDesc: "El nombre que usará la IA para presentarse.",
      style: "Estilo de Entrevista",
      questions: "Número de Preguntas",
      persona: "Persona del Entrevistador (Opcional)",
      personaDesc: "Suba un archivo describiendo el tono o 'personalidad' del reclutador.",
      uploadPersona: "Subir Persona",
      drivePersona: "O enlace Drive al Doc de Persona",
      personaPlaceholder: "ej. Entrevistador técnico estricto que se enfoca en casos borde..."
    },
    launch: "Lanzar Entorno de Entrevista",
    configuring: "Configurando...",
    generating: "Generando Resumen IA..."
  },
  [AppLanguage.PORTUGUESE]: {
    title: "Configurar Perfil de Entrevista",
    subtitle: "Configure o conhecimento, comportamento e idioma do recrutador de IA.",
    tabs: {
      basics: "Básicos",
      details: "Detalhes",
      candidate: "Candidato",
      persona: "Persona"
    },
    basics: {
      title: "Identidade da Empresa e Função",
      companyName: "Nome da Empresa",
      logoUrl: "URL do Logotipo da Empresa",
      logoPlaceholder: "https://exemplo.com/logo.png",
      jobTitle: "Título da Vaga",
      language: "Idioma / Language",
      langDesc: "Controla o idioma da entrevista e da interface.",
      model: "Motor de IA",
      modelDesc: "Selecione 'Pro' para entrevistas complexas, 'Flash' para velocidade.",
      location: "Localização do Escritório",
      culture: "Cultura e Valores (Contexto Interno)",
      cultureDesc: "Descreva o ambiente (ex. 'Formal', 'Relaxado'). Não visível ao candidato.",
      upload: "Carregar Texto",
      flash: "Gemini 3 Flash (Rápido e Eficiente)",
      pro: "Gemini 3 Pro (Raciocínio Profundo)"
    },
    details: {
      title: "Contexto e Requisitos da Vaga",
      salary: "Salário",
      schedule: "Horário",
      experience: "Experiência",
      description: "Carregar Descrição da Vaga (Texto/MD)",
      chooseFile: "Escolher Arquivo",
      orPaste: "ou colar texto abaixo",
      drivePlaceholder: "Colar link do Google Drive (Deve ser acessível)",
      descPlaceholder: "Cole a descrição completa aqui..."
    },
    candidate: {
      title: "Perfil do Candidato",
      name: "Nome do Candidato",
      uploadCv: "Carregar CV / Currículo",
      cvUploaded: "CV Carregado",
      uploadPdf: "Carregar PDF",
      fileReady: "Arquivo pronto",
      driveCvPlaceholder: "Ou colar link do Drive para o CV",
      pasteCv: "Ou Colar Texto do CV",
      pasteCvPlaceholder: "Cole o conteúdo do currículo aqui se não tiver PDF..."
    },
    persona: {
      title: "Configuração do Entrevistador",
      name: "Nome do Entrevistador",
      namePlaceholder: "ex. Sarah do RH",
      nameDesc: "O nome que a IA usará para se apresentar.",
      style: "Estilo de Entrevista",
      questions: "Número de Perguntas",
      persona: "Persona do Entrevistador (Opcional)",
      personaDesc: "Carregue um arquivo descrevendo o tom ou 'personalidade' do recrutador.",
      uploadPersona: "Carregar Persona",
      drivePersona: "Ou link do Drive para o Doc de Persona",
      personaPlaceholder: "ex. Entrevistador técnico rigoroso que foca em casos extremos..."
    },
    launch: "Iniciar Ambiente de Entrevista",
    configuring: "Configurando...",
    generating: "Gerando Resumo IA..."
  }
};

export const AdminSettings: React.FC<AdminSettingsProps> = ({ initialConfig, onSave }) => {
  const [config, setConfig] = useState<JobConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'basics' | 'details' | 'candidate' | 'persona'>('basics');
  const [isGenerating, setIsGenerating] = useState(false);

  const text = UI_TEXT[config.language] || UI_TEXT[AppLanguage.ENGLISH];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleFileRead = (e: ChangeEvent<HTMLInputElement>, field: keyof JobConfig) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target?.result as string;
        setConfig(prev => ({ ...prev, [field]: textContent }));
      };
      reader.readAsText(file);
    }
  };

  const handleResumeUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Extract base64 data (remove "data:application/pdf;base64," prefix)
        const base64Data = result.split(',')[1];
        
        setConfig(prev => ({
          ...prev,
          resumeFile: {
            mimeType: file.type,
            data: base64Data
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = async () => {
    setIsGenerating(true);
    let finalConfig = { ...config };

    // Auto-generate summary if not already present or force regenerate to match language if description exists
    if (config.jobDescription) {
        const context = `
            Company: ${config.companyName}
            Title: ${config.jobTitle}
            Salary: ${config.salary || 'N/A'}
            Schedule: ${config.schedule || 'N/A'}
            Experience: ${config.experience || 'N/A'}
        `;
        try {
            // Pass the selected language to ensure the summary is translated correctly
            const summary = await generateJobSummary(config.jobDescription, context, config.language);
            finalConfig.jobSummary = summary;
        } catch (e) {
            console.error("Failed to generate summary on launch", e);
        }
    }

    onSave(finalConfig);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{text.title}</h1>
        <p className="text-slate-500 mt-2">{text.subtitle}</p>
      </header>

      <div className="flex gap-4 mb-6 justify-center overflow-x-auto pb-2">
        {(['basics', 'details', 'candidate', 'persona'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {text.tabs[tab]}
          </button>
        ))}
      </div>

      <div className="space-y-6 animate-fade-in">
        {activeTab === 'basics' && (
          <Card title={text.basics.title}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.basics.companyName}</label>
                <input
                  type="text"
                  name="companyName"
                  value={config.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.basics.logoUrl}</label>
                <input
                  type="url"
                  name="companyLogoUrl"
                  value={config.companyLogoUrl || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder={text.basics.logoPlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.basics.jobTitle}</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={config.jobTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
              
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.basics.language}</label>
                <select
                  name="language"
                  value={config.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(AppLanguage).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">{text.basics.langDesc}</p>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.basics.model}</label>
                <select
                  name="modelSelection"
                  value={config.modelSelection}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                >
                    <option value="gemini-3-flash-preview">{text.basics.flash}</option>
                    <option value="gemini-3-pro-preview">{text.basics.pro}</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">{text.basics.modelDesc}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.basics.location}</label>
                <div className="flex gap-2">
                    <input
                    type="text"
                    name="officeLocation"
                    value={config.officeLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. San Francisco, CA"
                    />
                    <div className="text-xs text-slate-400 flex items-center bg-slate-50 px-3 rounded border border-slate-100 whitespace-nowrap">
                        <span className="mr-1">📍</span> Maps
                    </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.basics.culture}</label>
                <div className="flex items-center gap-4 mb-2">
                   <p className="text-xs text-slate-500 flex-grow">
                     {text.basics.cultureDesc}
                   </p>
                   <label className="cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 px-3 py-1 rounded transition text-xs font-medium whitespace-nowrap">
                    {text.basics.upload}
                    <input type="file" className="hidden" accept=".txt,.md" onChange={(e) => handleFileRead(e, 'companyCulture')} />
                  </label>
                </div>
                <textarea
                  name="companyCulture"
                  value={config.companyCulture}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition font-mono text-sm text-slate-600"
                  placeholder="..."
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'details' && (
          <Card title={text.details.title}>
            <div className="space-y-6">
              {/* Specific Fields for the Card Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{text.details.salary}</label>
                    <input
                        type="text"
                        name="salary"
                        value={config.salary || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. $50k - $70k"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-700"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{text.details.schedule}</label>
                    <input
                        type="text"
                        name="schedule"
                        value={config.schedule || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. Mon-Fri"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-700"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{text.details.experience}</label>
                    <input
                        type="text"
                        name="experience"
                        value={config.experience || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. 3+ Years"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-700"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.details.description}</label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg transition text-sm font-medium">
                      {text.details.chooseFile}
                      <input type="file" className="hidden" accept=".txt,.md,.json" onChange={(e) => handleFileRead(e, 'jobDescription')} />
                    </label>
                    <span className="text-xs text-slate-400">{text.details.orPaste}</span>
                  </div>
                  
                  {/* Google Drive Link Input */}
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                        <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="m43.65 16.6 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-27.5c-1.55 0-3.1.4-4.5 1.2l13.75 23.8z" fill="#00ac47"/><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 11.55-19.95c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/><path d="m43.65 16.6-13.75-23.8c-1.35.8-2.9 1.9-3.85 3.3l-13.75 23.8 13.75 23.8h27.5z" fill="#00832d"/><path d="m73.55 76.8-29.9-51.8 13.75-23.8 29.9 51.8c-.8 1.4-1.95 2.9-3.3 3.8z" fill="#2684fc"/><path d="m6.6 66.85c.8 1.4 1.95 2.5 3.3 3.3l29.9-51.8-13.75-23.8-23.3 40.35c.85 1.45 1.95 2.5 3.3 3.3z" fill="#ffba00"/></svg>
                     </div>
                     <input
                        type="url"
                        name="jobDescriptionLink"
                        value={config.jobDescriptionLink}
                        onChange={handleInputChange}
                        placeholder={text.details.drivePlaceholder}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                     />
                  </div>
                </div>
              </div>
              <textarea
                name="jobDescription"
                value={config.jobDescription}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition font-mono text-sm text-slate-600"
                placeholder={text.details.descPlaceholder}
              />
            </div>
          </Card>
        )}

        {activeTab === 'candidate' && (
          <Card title={text.candidate.title}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.candidate.name}</label>
                <input
                  type="text"
                  name="candidateName"
                  value={config.candidateName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{text.candidate.uploadCv}</label>
                 <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {config.resumeFile ? text.candidate.cvUploaded : text.candidate.uploadPdf}
                            <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
                        </label>
                        {config.resumeFile && <span className="text-xs text-green-600 font-medium">✓ {text.candidate.fileReady}</span>}
                    </div>

                    {/* Google Drive Link Input for Resume */}
                    <div className="flex items-center gap-2">
                     <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                        <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="m43.65 16.6 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-27.5c-1.55 0-3.1.4-4.5 1.2l13.75 23.8z" fill="#00ac47"/><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 11.55-19.95c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/><path d="m43.65 16.6-13.75-23.8c-1.35.8-2.9 1.9-3.85 3.3l-13.75 23.8 13.75 23.8h27.5z" fill="#00832d"/><path d="m73.55 76.8-29.9-51.8 13.75-23.8 29.9 51.8c-.8 1.4-1.95 2.9-3.3 3.8z" fill="#2684fc"/><path d="m6.6 66.85c.8 1.4 1.95 2.5 3.3 3.3l29.9-51.8-13.75-23.8-23.3 40.35c.85 1.45 1.95 2.5 3.3 3.3z" fill="#ffba00"/></svg>
                     </div>
                     <input
                        type="url"
                        name="candidateResumeLink"
                        value={config.candidateResumeLink}
                        onChange={handleInputChange}
                        placeholder={text.candidate.driveCvPlaceholder}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                     />
                    </div>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.candidate.pasteCv}</label>
                <textarea
                  name="candidateResume"
                  value={config.candidateResume || ''}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition font-mono text-sm text-slate-600"
                  placeholder={text.candidate.pasteCvPlaceholder}
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'persona' && (
          <Card title={text.persona.title}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.persona.name}</label>
                <input
                  type="text"
                  name="interviewerName"
                  value={config.interviewerName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={text.persona.namePlaceholder}
                />
                <p className="text-xs text-slate-400 mt-1">{text.persona.nameDesc}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.persona.style}</label>
                <select
                  name="interviewStyle"
                  value={config.interviewStyle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(InterviewStyle).map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.persona.questions}</label>
                <input
                  type="number"
                  name="questionCount"
                  min={3}
                  max={20}
                  value={config.questionCount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{text.persona.persona}</label>
                <p className="text-xs text-slate-500 mb-2">{text.persona.personaDesc}</p>
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg transition text-sm font-medium">
                            {text.persona.uploadPersona}
                            <input type="file" className="hidden" accept=".txt,.md" onChange={(e) => handleFileRead(e, 'interviewerProfile')} />
                        </label>
                    </div>

                    {/* Google Drive Link Input for Persona */}
                    <div className="flex items-center gap-2">
                     <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                        <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="m43.65 16.6 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-27.5c-1.55 0-3.1.4-4.5 1.2l13.75 23.8z" fill="#00ac47"/><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 11.55-19.95c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/><path d="m43.65 16.6-13.75-23.8c-1.35.8-2.9 1.9-3.85 3.3l-13.75 23.8 13.75 23.8h27.5z" fill="#00832d"/><path d="m73.55 76.8-29.9-51.8 13.75-23.8 29.9 51.8c-.8 1.4-1.95 2.9-3.3 3.8z" fill="#2684fc"/><path d="m6.6 66.85c.8 1.4 1.95 2.5 3.3 3.3l29.9-51.8-13.75-23.8-23.3 40.35c.85 1.45 1.95 2.5 3.3 3.3z" fill="#ffba00"/></svg>
                     </div>
                     <input
                        type="url"
                        name="interviewerProfileLink"
                        value={config.interviewerProfileLink}
                        onChange={handleInputChange}
                        placeholder={text.persona.drivePersona}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                     />
                    </div>
                </div>
                <textarea
                  name="interviewerProfile"
                  value={config.interviewerProfile}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm text-slate-600 mt-2"
                  placeholder={text.persona.personaPlaceholder}
                />
              </div>
            </div>
          </Card>
        )}

        <div className="pt-6 flex justify-end items-center gap-4">
          {isGenerating && <span className="text-sm text-indigo-600 font-medium animate-pulse">{text.generating}</span>}
          <button
            onClick={handleLaunch}
            disabled={isGenerating}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? text.configuring : text.launch}
          </button>
        </div>
      </div>
    </div>
  );
};