
import React, { useState } from 'react';
import { Level, Task } from '../types';

interface TaskFormProps {
  onAdd: (task: Partial<Task>, useAI: boolean) => void;
  isLoading: boolean;
  error?: string | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, isLoading, error }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Level | ''>('');
  const [importance, setImportance] = useState<Level | ''>('');
  const [dueDateType, setDueDateType] = useState<'date' | 'days'>('date');
  const [dueDateValue, setDueDateValue] = useState('');

  const getFinalDate = () => {
    if (!dueDateValue) return null;
    if (dueDateType === 'days') {
      const days = parseInt(dueDateValue, 10);
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString();
    } else {
      return new Date(dueDateValue).toISOString();
    }
  };

  const handleSubmit = (useAI: boolean) => {
    const finalDate = getFinalDate();
    if (!title || !finalDate) return;

    onAdd({
      title,
      description,
      userUrgency: urgency || undefined,
      userImportance: importance || undefined,
      completeBy: finalDate,
    }, useAI);

    // Reset form
    setTitle('');
    setDescription('');
    setUrgency('');
    setImportance('');
    setDueDateValue('');
  };

  const inputClasses = "w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50/50 text-slate-900 placeholder:text-slate-400";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 space-y-5 h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        Add New Task
      </h2>
      
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task Title *</label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className={inputClasses}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any extra details?"
            className={`${inputClasses} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Level)}
              className={inputClasses}
            >
              <option value="">Not Specified (Default Low)</option>
              {Object.values(Level).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Importance</label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value as Level)}
              className={inputClasses}
            >
              <option value="">Not Specified (Default Low)</option>
              {Object.values(Level).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-slate-700">Complete By *</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => { setDueDateType('date'); setDueDateValue(''); }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${dueDateType === 'date' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                Date
              </button>
              <button
                type="button"
                onClick={() => { setDueDateType('days'); setDueDateValue(''); }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${dueDateType === 'days' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                In Days
              </button>
            </div>
          </div>
          <input
            required
            type={dueDateType === 'date' ? 'date' : 'number'}
            min={dueDateType === 'days' ? "1" : ""}
            value={dueDateValue}
            onChange={(e) => setDueDateValue(e.target.value)}
            placeholder={dueDateType === 'days' ? "Number of days from now" : ""}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="pt-2 space-y-3">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
            {error}
          </div>
        )}
        
        <button
          disabled={isLoading || !title || !dueDateValue}
          onClick={() => handleSubmit(true)}
          type="button"
          className={`w-full py-4 px-4 rounded-xl font-black text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg flex items-center justify-center gap-2 ${
            isLoading 
              ? 'bg-indigo-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-200 disabled:opacity-50 disabled:hover:translate-y-0'
          }`}
        >
          {isLoading ? (
             <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          )}
          {isLoading ? 'Analyzing...' : 'Create & Analyze with AI'}
        </button>

        <button
          disabled={isLoading || !title || !dueDateValue}
          onClick={() => handleSubmit(false)}
          type="button"
          className="w-full py-3 px-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          Quick Create (Skip AI)
        </button>
      </div>
    </div>
  );
};

export default TaskForm;
