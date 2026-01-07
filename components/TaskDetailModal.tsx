
import React from 'react';
import { Task, Level, TaskStatus } from '../types';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const getLevelColor = (level?: Level) => {
    switch (level) {
      case Level.HIGH: return 'text-red-600 bg-red-50 border-red-100';
      case Level.MEDIUM: return 'text-amber-600 bg-amber-50 border-amber-100';
      case Level.LOW: return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="p-6 bg-slate-800 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 className="text-lg font-bold">Task Details</h2>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          <section>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">{task.title}</h3>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${task.status === TaskStatus.COMPLETED ? 'bg-green-50 text-green-600 border-green-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                {task.status}
              </span>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Created {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </section>

          {task.description && (
            <section className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                {task.description}
              </p>
            </section>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">AI Assessment</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm">
                  <span className="text-sm font-bold text-slate-500">Urgency</span>
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md border ${getLevelColor(task.aiUrgency)}`}>
                    {task.aiUrgency}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm">
                  <span className="text-sm font-bold text-slate-500">Importance</span>
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md border ${getLevelColor(task.aiImportance)}`}>
                    {task.aiImportance}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Timeline</h4>
              <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-indigo-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span className="text-sm font-bold uppercase tracking-tight">Complete By</span>
                </div>
                <span className="text-sm font-black text-indigo-900">
                  {new Date(task.completeBy).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </section>

          {task.justification && (
            <section className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                AI Justification
              </h4>
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p className="text-indigo-900 leading-relaxed italic text-sm font-medium">
                  "{task.justification}"
                </p>
              </div>
            </section>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition shadow-lg active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
