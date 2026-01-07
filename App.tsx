
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, Level } from './types';
import TaskForm from './components/TaskForm';
import AIReview from './components/AIReview';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import TaskDetailModal from './components/TaskDetailModal';
import { analyzeTask } from './services/geminiService';

// Robust ID generator fallback
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'task-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('eisenhower-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('eisenhower-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const activeTasksCount = useMemo(() => 
    tasks.filter(t => t.status === TaskStatus.ACCEPTED).length, 
  [tasks]);

  const completedTasksCount = useMemo(() => 
    tasks.filter(t => t.status === TaskStatus.COMPLETED).length, 
  [tasks]);

  const handleAddTask = async (taskData: Partial<Task>, useAI: boolean) => {
    if (useAI) {
      setIsAnalyzing(true);
      setError(null);
      try {
        const analysis = await analyzeTask(taskData);
        
        const newTask: Task = {
          id: generateId(),
          title: taskData.title!,
          description: taskData.description || '',
          userUrgency: taskData.userUrgency,
          userImportance: taskData.userImportance,
          aiUrgency: analysis.urgency,
          aiImportance: analysis.importance,
          justification: analysis.justification,
          completeBy: taskData.completeBy!,
          status: TaskStatus.PENDING_REVIEW,
          createdAt: new Date().toISOString(),
        };
        
        setPendingTask(newTask);
      } catch (err) {
        setError("AI Analysis failed. Please try again or use Quick Create.");
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Direct Create
      const newTask: Task = {
        id: generateId(),
        title: taskData.title!,
        description: taskData.description || '',
        userUrgency: taskData.userUrgency,
        userImportance: taskData.userImportance,
        aiUrgency: taskData.userUrgency || Level.LOW,
        aiImportance: taskData.userImportance || Level.LOW,
        justification: "Directly added by user without AI assessment.",
        completeBy: taskData.completeBy!,
        status: TaskStatus.ACCEPTED,
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const handleAcceptTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, { ...task, status: TaskStatus.ACCEPTED }]);
    setPendingTask(null);
  }, []);

  const handleToggleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === TaskStatus.COMPLETED ? TaskStatus.ACCEPTED : TaskStatus.COMPLETED }
        : t
    ));
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    if (window.confirm(`Are you sure you want to delete the task "${taskToDelete.title}"?`)) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  }, [tasks]);

  const handleUpdateTaskPriority = useCallback((id: string, urgency: Level, importance: Level) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, aiUrgency: urgency, aiImportance: importance } : t
    ));
  }, []);

  const clearCompleted = useCallback(() => {
    if (completedTasksCount === 0) return;
    
    if (window.confirm(`Are you sure you want to clear all ${completedTasksCount} completed tasks?`)) {
      setTasks(prev => prev.filter(t => t.status !== TaskStatus.COMPLETED));
    }
  }, [completedTasksCount]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">TasQ</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
                {activeTasksCount} Active
              </span>
              {completedTasksCount > 0 && (
                <span className="flex items-center gap-1.5 font-bold text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  {completedTasksCount} Completed
                </span>
              )}
            </div>
            {completedTasksCount > 0 && (
              <button 
                type="button"
                onClick={clearCompleted}
                className="px-4 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-all font-bold text-red-600 hover:text-red-700 border border-red-100 flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Clear All Completed
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Top Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <TaskForm onAdd={handleAddTask} isLoading={isAnalyzing} error={error} />
          
          <div className="bg-slate-800 rounded-2xl p-8 text-white shadow-xl shadow-slate-200 flex flex-col justify-between border border-slate-700/50">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                The Matrix Principle
              </h3>
              <p className="text-slate-300 text-base leading-relaxed mb-8 italic border-l-2 border-indigo-500 pl-4">
                "What is important is seldom urgent and what is urgent is seldom important."
              </p>
              <div className="space-y-4 text-sm font-medium text-slate-400">
                <div className="flex justify-between border-b border-slate-700/50 pb-3">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Urgent & Important
                  </span>
                  <span className="text-red-400 font-bold uppercase tracking-wider">Do First</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/50 pb-3">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Not Urgent & Important
                  </span>
                  <span className="text-blue-400 font-bold uppercase tracking-wider">Schedule</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/50 pb-3">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Urgent & Not Important
                  </span>
                  <span className="text-amber-400 font-bold uppercase tracking-wider">Delegate</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    Not Urgent & Not Important
                  </span>
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Eliminate</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between items-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Priority Logic Engine</p>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Powered by Gemini AI</p>
            </div>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Matrix Tracker</h2>
            <div className="h-px flex-1 bg-slate-200 mx-6 hidden sm:block"></div>
            <p className="text-sm text-slate-500 font-medium whitespace-nowrap">Visualizing your productivity strategy</p>
          </div>
          
          <div className="w-full">
            <EisenhowerMatrix 
              tasks={tasks.filter(t => t.status === TaskStatus.ACCEPTED || t.status === TaskStatus.COMPLETED)} 
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onUpdateTaskPriority={handleUpdateTaskPriority}
              onSelectTask={setSelectedTask}
            />
          </div>
        </section>
      </main>

      {/* Modal for Review */}
      {pendingTask && (
        <AIReview 
          task={pendingTask} 
          onAccept={handleAcceptTask} 
          onReject={() => setPendingTask(null)} 
        />
      )}

      {/* Modal for Task Detail */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing with Gemini AI</h3>
            <p className="text-slate-500 text-sm">Our AI is currently assessing urgency and importance to help you prioritize effectively.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
