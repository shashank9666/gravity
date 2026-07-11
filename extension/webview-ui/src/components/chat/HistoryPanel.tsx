import React from 'react';
import { Clock, MessageSquare, Trash2, X } from 'lucide-react';

interface HistorySession {
  id: string;
  title: string;
  date: string;
  messages: any[];
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: HistorySession[];
  onSelectSession: (session: HistorySession) => void;
  onDeleteSession: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onClose, 
  sessions, 
  onSelectSession, 
  onDeleteSession 
}) => {
  return (
    <>
      {/* Sliding Drawer Sidebar */}
      <div className={`absolute inset-y-0 right-0 w-72 border-l border-border/40 bg-card shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold">Chat History</h2>
            </div>
            <button 
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare size={32} className="text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No history yet.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Your conversations will appear here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div key={session.id} className="group flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors" onClick={() => onSelectSession(session)}>
                    <div className="flex flex-col flex-1 overflow-hidden pr-2">
                      <span className="text-sm font-medium text-foreground truncate">{session.title}</span>
                      <span className="text-[10px] text-muted-foreground">{session.date}</span>
                    </div>
                    <button 
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-background/20 backdrop-blur-sm z-20" 
          onClick={onClose}
        />
      )}
    </>
  );
};
