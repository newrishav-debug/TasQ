
import React, { useState } from 'react';
import { Task, Level, AIAnalysisResponse } from '../types';
import { analyzeTask } from '../services/geminiService';

interface AIReviewProps {
  task: Task;
  onAccept: (updatedTask: Task) => void;
  onReject: () => void;
}

const AIReview: React.FC<AIReviewProps> = ({ task, onAccept, onReject }) => {
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable local state
  const [description, setDescription] = useState(task.description);
  const [userUrgency, setUserUrgency] = useState<Level | undefined>(task.userUrgency);
  const [userImportance, setUserImportance] = useState<Level | undefined>(task.userImportance);
  const [completeBy, setCompleteBy] = useState(task.completeBy.split('T')[0]);

  // AI Results state (initially from props)
  const [aiUrgency, setAiUrgency] = useState<Level | undefined>(task.aiUrgency);
  const [aiImportance, setAiImportance] = useState<Level | undefined>(task.aiImportance);
  const [justification, setJustification] = useState(task.justification);

  const handleRerunAnalysis = async () => {
    setIsReanalyzing(true);
    setError(null);
    try {
      const updatedData: Partial<Task> = {
        title: task.title,
        description,
        userUrgency,
        userImportance,
        completeBy: new Date(completeBy).toISOString(),
      };
      
      const analysis: AIAnalysisResponse = await analyzeTask(updatedData);
      
      setAiUrgency(analysis.urgency);
      setAiImportance(analysis.importance);
      setJustification(analysis.justification);
    } catch (err) {
      setError("AI Rerun failed. Check your connection.");
      console.error(err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleAccept = () => {
    const finalTask: Task = {
      ...task,
      description,
      userUrgency,
      userImportance,
      completeBy: new Date(completeBy).toISOString(),
      aiUrgency,
      aiImportance,
      justification,
    };
    onAccept(finalTask);
  };

  const getLevelColor = (level?: Level) => {
    switch (level) {
      case Level.HIGH: return 'text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100';
      case Level.MEDIUM: return 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100';
      case Level.LOW: return 'text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100';
      default: return 'text-slate-500';
    }
  };

  const inputClasses = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white text-slate-900 text-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-5 bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            <h2 className="text-lg font-bold">Refine Task Strategy</h2>
          </div>
          <button onClick={onReject} className="hover:bg-indigo-500 p-1 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Header Info */}
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">{task.title}</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Internal Review Mode</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Edit Section */}
            <div className="space-y-4 pr-0 lg:pr-6 lg:border-r border-slate-100">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                Adjust Inputs
              </h4>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClasses} resize-none`}
                  placeholder="Task details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Your Urgency</label>
                  <select
                    value={userUrgency || ''}
                    onChange={(e) => setUserUrgency(e.target.value as Level || undefined)}
                    className={inputClasses}
                  >
                    <option value="">None</option>
                    {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Your Importance</label>
                  <select
                    value={userImportance || ''}
                    onChange={(e) => setUserImportance(e.target.value as Level || undefined)}
                    className={inputClasses}
                  >
                    <option value="">None</option>
                    {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Complete By</label>
                <input
                  type="date"
                  value={completeBy}
                  onChange={(e) => setCompleteBy(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <button
                onClick={handleRerunAnalysis}
                disabled={isReanalyzing}
                className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  isReanalyzing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                {isReanalyzing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Updating Analysis...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Rerun AI Analysis
                  </>
                )}
              </button>
              
              {error && <p className="text-[10px] text-red-500 text-center font-bold uppercase">{error}</p>}
            </div>

            {/* AI Result Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                AI Verdict
              </h4>
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative overflow-hidden">
                {isReanalyzing && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center font-bold text-slate-400 text-xs uppercase italic">Refreshing...</div>}
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5">AI Urgency</p>
                  <span className={`text-xs font-black ${getLevelColor(aiUrgency)}`}>{aiUrgency}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5">AI Importance</p>
                  <span className={`text-xs font-black ${getLevelColor(aiImportance)}`}>{aiImportance}</span>
                </div>
              </div>

              <div className="bg-indigo-50/40 p-5 rounded-xl border border-indigo-100 relative min-h-[140px]">
                {isReanalyzing && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10"></div>}
                <h5 className="flex items-center text-indigo-900 font-black text-xs uppercase mb-3 gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                  Strategy Justification
                </h5>
                <p className="text-slate-700 leading-relaxed text-sm italic">
                  "{justification}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={handleAccept}
            disabled={isReanalyzing}
            className={`flex-1 py-3 px-6 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              isReanalyzing ? 'bg-indigo-300 cursor-not-allowed text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            Commit to Matrix
          </button>
          <button
            onClick={onReject}
            className="py-3 px-6 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition"
          >
            Discard Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIReview;
