
import React, { useState } from 'react';
import { Task, Level, Quadrant, TaskStatus } from '../types';

interface MatrixProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTaskPriority: (id: string, urgency: Level, importance: Level) => void;
  onSelectTask: (task: Task) => void;
}

const EisenhowerMatrix: React.FC<MatrixProps> = ({ tasks, onToggleComplete, onDelete, onUpdateTaskPriority, onSelectTask }) => {
  const [dragOverQuadrant, setDragOverQuadrant] = useState<Quadrant | null>(null);

  const getQuadrant = (task: Task): Quadrant => {
    const isUrgent = task.aiUrgency === Level.HIGH || task.aiUrgency === Level.MEDIUM;
    const isImportant = task.aiImportance === Level.HIGH || task.aiImportance === Level.MEDIUM;

    if (isUrgent && isImportant) return Quadrant.DO;
    if (!isUrgent && isImportant) return Quadrant.SCHEDULE;
    if (isUrgent && !isImportant) return Quadrant.DELEGATE;
    return Quadrant.ELIMINATE;
  };

  const tasksByQuadrant = {
    [Quadrant.DO]: tasks.filter(t => getQuadrant(t) === Quadrant.DO),
    [Quadrant.SCHEDULE]: tasks.filter(t => getQuadrant(t) === Quadrant.SCHEDULE),
    [Quadrant.DELEGATE]: tasks.filter(t => getQuadrant(t) === Quadrant.DELEGATE),
    [Quadrant.ELIMINATE]: tasks.filter(t => getQuadrant(t) === Quadrant.ELIMINATE),
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDragOverQuadrant(null);
  };

  const handleDragOver = (e: React.DragEvent, quadrant: Quadrant) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverQuadrant !== quadrant) {
      setDragOverQuadrant(quadrant);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setDragOverQuadrant(null);
    }
  };

  const handleDrop = (e: React.DragEvent, quadrant: Quadrant) => {
    e.preventDefault();
    setDragOverQuadrant(null);
    const taskId = e.dataTransfer.getData('taskId');
    
    if (!taskId) return;

    let newUrgency: Level;
    let newImportance: Level;

    switch (quadrant) {
      case Quadrant.DO:
        newUrgency = Level.HIGH;
        newImportance = Level.HIGH;
        break;
      case Quadrant.SCHEDULE:
        newUrgency = Level.LOW;
        newImportance = Level.HIGH;
        break;
      case Quadrant.DELEGATE:
        newUrgency = Level.HIGH;
        newImportance = Level.LOW;
        break;
      case Quadrant.ELIMINATE:
      default:
        newUrgency = Level.LOW;
        newImportance = Level.LOW;
        break;
    }

    onUpdateTaskPriority(taskId, newUrgency, newImportance);
  };

  const renderQuadrant = (title: string, quadrant: Quadrant, colorClass: string, icon: React.ReactNode) => {
    const isOver = dragOverQuadrant === quadrant;
    
    return (
      <div 
        onDragOver={(e) => handleDragOver(e, quadrant)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, quadrant)}
        className={`flex flex-col min-h-[350px] rounded-2xl p-6 border-2 transition-all duration-300 ${
          isOver 
            ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.01] bg-white shadow-xl z-10' 
            : `${colorClass} bg-opacity-10 backdrop-blur-sm shadow-sm`
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${colorClass.split(' ')[0].replace('border-', 'bg-')} bg-opacity-20`}>
            {icon}
          </div>
          <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
        </div>
        <div className="flex-1 space-y-3 relative">
          {tasksByQuadrant[quadrant].length === 0 ? (
            <div className={`h-full min-h-[150px] flex items-center justify-center text-slate-400 text-sm italic py-12 border-2 border-dashed rounded-xl transition-colors ${isOver ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-white/30'}`}>
              {isOver ? "Drop to move task here" : "No tasks here"}
            </div>
          ) : (
            tasksByQuadrant[quadrant].map((task) => (
              <div
                key={task.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectTask(task)}
                className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 group relative transition-all duration-200 hover:shadow-md hover:border-indigo-300 cursor-pointer active:cursor-grabbing ${task.status === TaskStatus.COMPLETED ? 'bg-slate-50/50 border-slate-100' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-6 w-6 shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={task.status === TaskStatus.COMPLETED}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all duration-200"
                    />
                  </div>
                  <div className="flex-1 pr-8">
                    <h4 className={`text-sm font-bold transition-all duration-200 ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-400 font-medium' : 'text-slate-800'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className={`text-xs mt-1 line-clamp-2 leading-relaxed transition-all duration-200 ${task.status === TaskStatus.COMPLETED ? 'text-slate-300' : 'text-slate-500'}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        {new Date(task.completeBy).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        task.aiUrgency === Level.HIGH ? 'bg-red-50 text-red-600 border-red-100' : 
                        task.aiUrgency === Level.MEDIUM ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {task.aiUrgency}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(task.id);
                    }}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all p-2 rounded-lg z-30 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {renderQuadrant(
        "Do First (Urgent & Important)",
        Quadrant.DO,
        "border-red-400 bg-red-50",
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      )}
      {renderQuadrant(
        "Schedule (Important & Not Urgent)",
        Quadrant.SCHEDULE,
        "border-blue-400 bg-blue-50",
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      )}
      {renderQuadrant(
        "Delegate (Urgent & Not Important)",
        Quadrant.DELEGATE,
        "border-amber-400 bg-amber-50",
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      )}
      {renderQuadrant(
        "Eliminate (Not Urgent & Not Important)",
        Quadrant.ELIMINATE,
        "border-slate-400 bg-slate-50",
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      )}
    </div>
  );
};

export default EisenhowerMatrix;
