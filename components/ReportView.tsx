import React, { useEffect, useState } from 'react';
import { JobConfig, Message, ReportData, AppLanguage } from '../types';
import { generateInterviewReport } from '../services/geminiService';
import { QuotaExceededError } from '../services/quotaManager';
import { Card } from './UI/Card';
import { Loader } from './UI/Loader';

interface ReportViewProps {
  config: JobConfig;
  messages: Message[];
  onBack: () => void;
}

const UI_TEXT = {
  [AppLanguage.ENGLISH]: {
    title: "Candidate Evaluation Report",
    fit: "Overall Fit & Level",
    summary: "Executive Summary",
    detailed: "Detailed Analysis",
    strengths: "Key Strengths",
    improvements: "Areas for Improvement",
    sources: "Fact Check & Sources",
    backToDash: "Back to Dashboard",
    analyzing: "Analyzing candidate performance...",
    crossRef: "Cross-referencing claims and evaluating fit.",
    sourcesDesc: "The AI used Google Search to verify industry context or specific claims.",
    tabEval: "Evaluation",
    tabTranscript: "Interview Transcript",
    download: "Download Report",
    interviewer: "Interviewer",
    candidate: "Candidate",
    quotaError: "Quota Exceeded: Cannot generate report.",
    levels: ["Novice", "Beginner", "Competent", "Proficient", "Expert"]
  },
   [AppLanguage.SPANISH]: {
    title: "Informe de Evaluación del Candidato",
    fit: "Nivel y Ajuste General",
    summary: "Resumen Ejecutivo",
    detailed: "Análisis Detallado",
    strengths: "Fortalezas Clave",
    improvements: "Áreas de Mejora",
    sources: "Verificación de Hechos y Fuentes",
    backToDash: "Volver al Panel",
    analyzing: "Analizando desempeño del candidato...",
    crossRef: "Referenciando afirmaciones y evaluando ajuste.",
    sourcesDesc: "La IA usó Google Search para verificar el contexto de la industria o afirmaciones específicas.",
    tabEval: "Evaluación",
    tabTranscript: "Transcripción de Entrevista",
    download: "Descargar Informe",
    interviewer: "Entrevistador",
    candidate: "Candidato",
    quotaError: "Cuota Excedida: No se puede generar el informe.",
    levels: ["Novato", "Principiante", "Competente", "Avanzado", "Experto"]
  },
   [AppLanguage.PORTUGUESE]: {
    title: "Relatório de Avaliação do Candidato",
    fit: "Nível e Adequação Geral",
    summary: "Resumo Executivo",
    detailed: "Análise Detalhada",
    strengths: "Pontos Fortes",
    improvements: "Áreas de Melhoria",
    sources: "Verificação de Fatos e Fontes",
    backToDash: "Voltar ao Painel",
    analyzing: "Analisando desempenho do candidato...",
    crossRef: "Cruzando informações e avaliando adequação.",
    sourcesDesc: "A IA usou o Google Search para verificar o contexto da indústria ou reivindicações específicas.",
    tabEval: "Avaliação",
    tabTranscript: "Transcrição da Entrevista",
    download: "Baixar Relatório",
    interviewer: "Entrevistador",
    candidate: "Candidato",
    quotaError: "Cota Excedida: Não é possível gerar relatório.",
    levels: ["Iniciante", "Básico", "Competente", "Proficiente", "Especialista"]
  }
}

// Visual Component for the Ladder
const LevelLadder: React.FC<{ score: number; labels: string[], small?: boolean }> = ({ score, labels, small = false }) => {
  // Map score (0-100) to level (0-4)
  const levelIndex = Math.min(Math.floor(score / 20), 4);
  
  const steps = [
    { width: 'w-full', color: 'bg-emerald-500', label: labels[4] }, // 80-100
    { width: 'w-[80%]', color: 'bg-blue-500', label: labels[3] },    // 60-79
    { width: 'w-[60%]', color: 'bg-indigo-400', label: labels[2] },  // 40-59
    { width: 'w-[40%]', color: 'bg-yellow-400', label: labels[1] },  // 20-39
    { width: 'w-[20%]', color: 'bg-red-400', label: labels[0] },     // 0-19
  ];

  return (
    <div className={`flex flex-col items-center ${small ? 'w-24' : 'w-full max-w-[180px]'}`}>
      <div className="flex flex-col-reverse w-full gap-1">
        {steps.map((step, idx) => {
           const isActive = idx === levelIndex;
           const isPassed = idx < levelIndex;
           
           return (
             <div key={idx} className="flex items-center relative h-8">
               {/* The Step Bar */}
               <div 
                  className={`h-full rounded-r-lg shadow-sm transition-all duration-500 ${step.width} ${isActive || isPassed ? step.color : 'bg-slate-100'}`}
               ></div>
               
               {/* The Person Emoji */}
               {isActive && (
                 <div className="absolute left-0 z-10 transform -translate-x-1/2" style={{ left: small ? '50%' : step.width }}>
                    <span className={`${small ? 'text-2xl' : 'text-3xl'} filter drop-shadow-md animate-bounce`}>
                      🧑‍💼
                    </span>
                 </div>
               )}
             </div>
           )
        })}
      </div>
      <div className={`mt-3 font-bold text-center ${small ? 'text-xs' : 'text-lg'} text-slate-700`}>
        {steps[levelIndex].label}
      </div>
      {!small && <div className="text-sm text-slate-400 font-medium">{score}/100 Score</div>}
    </div>
  );
};

export const ReportView: React.FC<ReportViewProps> = ({ config, messages, onBack }) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'evaluation' | 'transcript'>('evaluation');

  const text = UI_TEXT[config.language] || UI_TEXT[AppLanguage.ENGLISH];

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await generateInterviewReport(config, messages);
        setReport(data);
      } catch (e) {
        if (e instanceof QuotaExceededError) {
            setErrorMsg(text.quotaError);
        } else {
            setErrorMsg("Error generating report.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadReport = () => {
    if (!report) return;
    
    const timestamp = new Date().toLocaleString();
    const content = `
=========================================
${text.title.toUpperCase()}
=========================================
Company: ${config.companyName}
Role: ${config.jobTitle}
Date: ${timestamp}
Recommendation: ${report.hiringRecommendation}
Score: ${report.score}/100

${text.summary.toUpperCase()}
-----------------------------------------
${report.candidateSummary}

${text.detailed.toUpperCase()}
-----------------------------------------
${report.detailedAnalysis}

${text.strengths.toUpperCase()}
-----------------------------------------
${report.strengths.map(s => `- ${s}`).join('\n')}

${text.improvements.toUpperCase()}
-----------------------------------------
${report.weaknesses.map(w => `- ${w}`).join('\n')}

=========================================
${text.tabTranscript.toUpperCase()}
=========================================
${messages.map(m => `
[${m.role === 'model' ? text.interviewer : text.candidate}] (${m.timestamp.toLocaleTimeString()}):
${m.text}
`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Interview_Report_${config.jobTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <Loader />
        <h2 className="text-xl font-semibold text-slate-700">{text.analyzing}</h2>
        <p className="text-slate-500">{text.crossRef}</p>
      </div>
    );
  }

  // Error State (Quota)
  if (errorMsg) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  ⚠️
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">{errorMsg}</h2>
              <p className="text-slate-500 mb-6">Daily API limits prevent this report from being generated right now.</p>
              <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 font-medium">
                {text.backToDash}
              </button>
              <div className="mt-8 w-full max-w-2xl text-left">
                  <h3 className="font-semibold text-slate-700 mb-2">{text.tabTranscript}</h3>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="mb-2 text-sm">
                            <strong className="text-slate-800">{msg.role}:</strong> <span className="text-slate-600">{msg.text}</span>
                        </div>
                    ))}
                  </div>
              </div>
          </div>
      );
  }

  if (!report) return <div>Error loading report</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{text.title}</h1>
                <p className="text-slate-500">{config.jobTitle} - {config.companyName}</p>
            </div>
            <div className="flex gap-3">
             <button 
                onClick={downloadReport} 
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition text-sm shadow-md"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {text.download}
             </button>
             <button 
                onClick={onBack} 
                className="text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition text-sm"
             >
                {text.backToDash}
             </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
            <button 
                onClick={() => setActiveTab('evaluation')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'evaluation' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                {text.tabEval}
            </button>
            <button 
                onClick={() => setActiveTab('transcript')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transcript' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                {text.tabTranscript}
            </button>
        </div>

        {/* EVALUATION VIEW */}
        {activeTab === 'evaluation' && (
            <div className="animate-fade-in space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Score Card with LADDER */}
                    <Card className="md:col-span-1 border-t-4 border-t-indigo-500">
                        <div className="text-center py-4 flex flex-col items-center">
                            <h3 className="text-slate-500 text-sm uppercase tracking-wider font-semibold mb-4">{text.fit}</h3>
                            <LevelLadder score={report.score} labels={text.levels} />
                            <div className="mt-6">
                                <span className="bg-slate-100 text-slate-800 px-4 py-1 rounded-full text-sm font-bold border border-slate-200">
                                    {report.hiringRecommendation}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Summary */}
                    <Card className="md:col-span-2" title={text.summary}>
                        <p className="text-slate-700 leading-relaxed mb-4">{report.candidateSummary}</p>
                        <hr className="my-4 border-slate-100" />
                        <h4 className="font-semibold text-slate-800 mb-2 text-sm">{text.detailed}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{report.detailedAnalysis}</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title={text.strengths}>
                        <div className="flex flex-row gap-4">
                            <div className="flex-1">
                                <ul className="space-y-3">
                                    {report.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="mt-1 block min-w-[16px] h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                                            <span className="text-slate-700 text-sm">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Mini Ladder for Strengths */}
                            <div className="hidden sm:flex flex-col items-center justify-center border-l border-slate-100 pl-4">
                                <span className="text-[10px] uppercase text-slate-400 font-bold mb-2 tracking-wider">Level</span>
                                <LevelLadder score={report.score} labels={text.levels} small />
                            </div>
                        </div>
                    </Card>

                    <Card title={text.improvements}>
                         <div className="flex flex-row gap-4">
                            <div className="flex-1">
                                <ul className="space-y-3">
                                    {report.weaknesses.map((w, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="mt-1 block min-w-[16px] h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold">!</span>
                                            <span className="text-slate-700 text-sm">{w}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Mini Ladder for Improvements (Shows current level vs where they could be) */}
                            <div className="hidden sm:flex flex-col items-center justify-center border-l border-slate-100 pl-4">
                                <span className="text-[10px] uppercase text-slate-400 font-bold mb-2 tracking-wider">Level</span>
                                <LevelLadder score={report.score} labels={text.levels} small />
                            </div>
                        </div>
                    </Card>
                </div>

                {report.groundingLinks && report.groundingLinks.length > 0 && (
                    <Card title={text.sources}>
                        <div className="space-y-3">
                            <p className="text-sm text-slate-500">{text.sourcesDesc}</p>
                            <ul className="space-y-2">
                                {report.groundingLinks.map((link, i) => (
                                    <li key={i}>
                                        <a href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                            {link.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                )}
            </div>
        )}

        {/* TRANSCRIPT VIEW */}
        {activeTab === 'transcript' && (
            <Card title={text.tabTranscript} className="animate-fade-in">
                <div className="space-y-8">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`text-xs font-semibold mb-1 ${msg.role === 'user' ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {msg.role === 'user' ? text.candidate : text.interviewer} <span className="font-normal text-slate-400">• {msg.timestamp.toLocaleTimeString()}</span>
                            </div>
                            <div className={`p-4 rounded-xl max-w-[90%] ${
                                msg.role === 'user' 
                                ? 'bg-indigo-50 border border-indigo-100 text-slate-800' 
                                : 'bg-white border border-slate-200 text-slate-700'
                            }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        )}

      </div>
    </div>
  );
};