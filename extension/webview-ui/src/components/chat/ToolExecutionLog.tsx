import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, Terminal, FileEdit, FileSearch } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToolExecutionLogProps {
  toolName: string;
  args: any;
  result?: string;
  duration?: string; // e.g. "1s"
  status: 'running' | 'success' | 'error';
}

export const ToolExecutionLog: React.FC<ToolExecutionLogProps> = ({ 
  toolName, 
  args, 
  result, 
  duration = '1s',
  status 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Map tool names to human readable actions and icons
  let actionText = 'Using tool';
  let Icon = Terminal;

  if (toolName === 'read_file' || toolName.includes('read')) {
    actionText = 'Explored file';
    Icon = FileSearch;
  } else if (toolName === 'write_file' || toolName.includes('replace')) {
    actionText = 'Edited file';
    Icon = FileEdit;
  } else if (toolName === 'run_command') {
    actionText = 'Ran command';
    Icon = Terminal;
  }

  const title = status === 'running' 
    ? `Thought for ${duration} ...` 
    : `${actionText} >`;

  return (
    <div className="flex flex-col my-2 border border-border/40 rounded-md overflow-hidden bg-muted/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 p-2 text-xs hover:bg-muted/50 transition-colors w-full text-left focus:outline-none"
      >
        {status === 'success' ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500/80" />
        ) : status === 'error' ? (
          <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 flex items-center justify-center text-[8px] text-white font-bold">!</div>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
        )}
        
        <span className="font-medium text-muted-foreground flex-1">
          {status === 'running' ? `Thinking for ${duration}...` : actionText}
          {status === 'success' && <span className="ml-2 font-mono text-[10px] bg-background px-1.5 py-0.5 rounded text-foreground/70">{toolName}</span>}
        </span>

        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-background border-t border-border/40 text-xs font-mono">
              <div className="mb-2 text-muted-foreground">Arguments:</div>
              <pre className="bg-muted/30 p-2 rounded overflow-x-auto text-[10px]">
                {JSON.stringify(args, null, 2)}
              </pre>
              
              {result && (
                <>
                  <div className="mt-3 mb-2 text-muted-foreground">Result:</div>
                  <pre className="bg-muted/30 p-2 rounded overflow-x-auto text-[10px] max-h-32 overflow-y-auto">
                    {result}
                  </pre>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
