import { useState, useEffect } from 'react'
import './index.css'
import { ChatView } from './ChatView'

type Category = 'General' | 'Account' | 'Permissions' | 'Appearance' | 'Notifications' | 'Models' | 'Customizations' | 'Browser' | 'Tab' | 'Editor' | 'Workspaces'

import { vscode } from './vscodeApi';

import { ChevronLeft, Eye, EyeOff, Menu, X, ChevronRight } from 'lucide-react';

const Toggle = ({ label, description, checked, onChange }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 my-2 border border-border/40 rounded-lg bg-card shadow-sm gap-4">
    <div className="flex flex-col flex-1">
      <div className="text-sm font-semibold">{label}</div>
      {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer shrink-0 self-start sm:self-auto">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
    </label>
  </div>
)

const Select = ({ label, description, value, options, onChange }: any) => (
  <div className="flex flex-col p-4 my-2 border border-border/40 rounded-lg bg-card shadow-sm">
    <div className="flex flex-col mb-3">
      <div className="text-sm font-semibold">{label}</div>
      {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
    </div>
    <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" value={value} onChange={e => onChange(e.target.value)}>
      {options.map((o: string) => <option key={o} value={o} className="bg-popover text-popover-foreground">{o}</option>)}
    </select>
  </div>
)

const Input = ({ label, description, value, onChange, type = "text", list }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col p-4 my-2 border border-border/40 rounded-lg bg-card shadow-sm">
      <div className="flex flex-col mb-3">
        <div className="text-sm font-semibold">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
      </div>
      <div className="relative">
        <input 
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
          type={inputType} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          list={list} 
        />
        {isPassword && (
          <button 
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide" : "Show"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const categories: Category[] = ['General', 'Models', 'Permissions', 'Appearance', 'Notifications', 'Customizations', 'Browser', 'Tab', 'Editor']
  const [activeTab, setActiveTab] = useState<'Chat' | 'Settings'>('Chat')
  const [activeCategory, setActiveCategory] = useState<Category>('Permissions')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Settings State
  const [provider, setProvider] = useState('OpenAI')
  const [apiEndpoint, setApiEndpoint] = useState('https://api.openai.com/v1')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-4o')
  const [securityMode, setSecurityMode] = useState('Sandboxed')
  const [terminalAutoExecute, setTerminalAutoExecute] = useState('Request Review')
  const [enableShellIntegration, setEnableShellIntegration] = useState(true)
  const [nonWorkspaceFileAccess, setNonWorkspaceFileAccess] = useState(false)
  const [autoOpenEditedFiles, setAutoOpenEditedFiles] = useState(true)

  useEffect(() => {
    if (vscode) {
      vscode.postMessage({ type: 'getSettings' });
    }

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'settingsSync') {
        const s = message.settings;
        if (s.provider !== undefined) setProvider(s.provider);
        if (s.apiEndpoint !== undefined) setApiEndpoint(s.apiEndpoint);
        if (s.apiKey !== undefined) setApiKey(s.apiKey);
        if (s.model !== undefined) setModel(s.model);
        if (s.securityMode !== undefined) setSecurityMode(s.securityMode);
        if (s.terminalAutoExecute !== undefined) setTerminalAutoExecute(s.terminalAutoExecute);
        if (s.enableShellIntegration !== undefined) setEnableShellIntegration(s.enableShellIntegration);
        if (s.nonWorkspaceFileAccess !== undefined) setNonWorkspaceFileAccess(s.nonWorkspaceFileAccess);
        if (s.autoOpenEditedFiles !== undefined) setAutoOpenEditedFiles(s.autoOpenEditedFiles);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const updateSetting = (key: string, value: any, setter: any) => {
    setter(value);
    if (vscode) {
      vscode.postMessage({ type: 'updateSetting', key, value });
    }
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'Models':
        const PROVIDERS: Record<string, { endpoint: string, models: string[] }> = {
          'OpenAI': { endpoint: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
          'Anthropic': { endpoint: 'https://api.anthropic.com/v1', models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
          'OpenRouter': { endpoint: 'https://openrouter.ai/api/v1', models: ['anthropic/claude-3.5-sonnet', 'meta-llama/llama-3-8b-instruct', 'google/gemini-pro'] },
          'OpenCode': { endpoint: 'https://api.opencode.com/v1', models: ['opencode-v1', 'opencode-coder'] },
          'Nvidia': { endpoint: 'https://api.nvcf.nvidia.com/v2/nvcf', models: ['meta/llama3-70b-instruct', 'nvidia/nemotron-4-340b-instruct'] },
          'Ollama': { endpoint: 'http://localhost:11434/v1', models: ['llama3', 'mistral', 'codellama'] },
          'Custom': { endpoint: '', models: [] }
        };

        const handleProviderChange = (newProvider: string) => {
          updateSetting('provider', newProvider, setProvider);
          if (newProvider !== 'Custom') {
            const config = PROVIDERS[newProvider];
            updateSetting('apiEndpoint', config.endpoint, setApiEndpoint);
            updateSetting('model', config.models[0], setModel);
          }
        };

        const currentModels = PROVIDERS[provider]?.models || [];

        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI Provider Configuration</h2>
              <p className="text-sm text-muted-foreground mt-1">Configure your OpenAI-compatible endpoint, API key, and model choice.</p>
            </div>
            
            <Select 
              label="Provider" 
              description="Select the AI provider to power Gravity." 
              value={provider} 
              options={Object.keys(PROVIDERS)} 
              onChange={handleProviderChange} 
            />

            <Input 
              label="API Base URL" 
              description="Base URL for the provider's API (e.g. https://api.openai.com/v1)" 
              value={apiEndpoint} 
              onChange={(val: string) => updateSetting('apiEndpoint', val, setApiEndpoint)} 
            />
            
            <Input 
              label="API Key" 
              description="Your API key for the selected provider" 
              type="password"
              value={apiKey} 
              onChange={(val: string) => updateSetting('apiKey', val, setApiKey)} 
            />

            <Input 
              label="Model" 
              description="The exact model ID to use. Select from the dropdown or type a custom model ID." 
              value={model} 
              list="model-list"
              onChange={(val: string) => updateSetting('model', val, setModel)} 
            />
            {currentModels.length > 0 && (
              <datalist id="model-list">
                {currentModels.map((m: string) => <option key={m} value={m} />)}
              </datalist>
            )}
          </div>
        )
      case 'Permissions':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Agent security mode</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Select one of the three options. Agent settings and permissions can be further customized below.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${securityMode === 'Full access' ? 'border-primary bg-primary/5' : 'border-border/40 bg-card hover:border-primary/50'}`} 
                onClick={() => updateSetting('securityMode', 'Full access', setSecurityMode)}
              >
                <div className="font-semibold mb-1">Full access</div>
                <div className="text-xs text-muted-foreground">Agents have full access to your machine and external resources.</div>
              </div>
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${securityMode === 'Sandboxed' ? 'border-primary bg-primary/5' : 'border-border/40 bg-card hover:border-primary/50'}`} 
                onClick={() => updateSetting('securityMode', 'Sandboxed', setSecurityMode)}
              >
                <div className="font-semibold mb-1">Sandboxed</div>
                <div className="text-xs text-muted-foreground">Agents run in a secure sandbox that restricts access to external resources outside of your trusted folders.</div>
              </div>
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${securityMode === 'Strict' ? 'border-primary bg-primary/5' : 'border-border/40 bg-card hover:border-primary/50'}`} 
                onClick={() => updateSetting('securityMode', 'Strict', setSecurityMode)}
              >
                <div className="font-semibold mb-1">Strict</div>
                <div className="text-xs text-muted-foreground">Terminal commands always require review and the agent cannot access files outside of its given workspaces.</div>
              </div>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-8">Terminal</div>
            
            <Select 
              label="Terminal Command Auto Execution" 
              description="Controls whether terminal commands require your approval before running." 
              value={terminalAutoExecute} 
              options={['Request Review', 'Auto Execute']} 
              onChange={(val: string) => updateSetting('terminalAutoExecute', val, setTerminalAutoExecute)} 
            />
            
            <Toggle 
              label="Enable Shell Integration" 
              description="When enabled, Agent will use IDE's shell integration to detect and report terminal command execution." 
              checked={enableShellIntegration} 
              onChange={(val: boolean) => updateSetting('enableShellIntegration', val, setEnableShellIntegration)} 
            />

            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-8">File Access</div>
            
            <Toggle 
              label="Agent Non-Workspace File Access" 
              description="Allows the agent to access files outside of your current workspace." 
              checked={nonWorkspaceFileAccess} 
              onChange={(val: boolean) => updateSetting('nonWorkspaceFileAccess', val, setNonWorkspaceFileAccess)} 
            />
            
            <Toggle 
              label="Auto-Open Edited Files" 
              description="Open files in the background if Agent creates or edits them" 
              checked={autoOpenEditedFiles} 
              onChange={(val: boolean) => updateSetting('autoOpenEditedFiles', val, setAutoOpenEditedFiles)} 
            />
          </div>
        )
      default:
        return <div className="p-8 text-center text-muted-foreground">{activeCategory} settings coming soon...</div>
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {activeTab === 'Chat' ? (
        <ChatView 
          model={model} 
          onOpenSettings={() => setActiveTab('Settings')} 
        />
      ) : (
        <div className="flex flex-col h-full overflow-hidden relative">
          <div className="flex items-center justify-between p-3 border-b border-border/40 bg-muted/20 shrink-0">
            <div className="flex items-center gap-2">
              <button 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="text-xs font-semibold tracking-wider text-muted-foreground flex items-center gap-1">
                <span>Settings</span>
                <ChevronRight size={12} />
                <span className="text-foreground">{activeCategory}</span>
              </div>
            </div>
            
            <button 
              className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              onClick={() => setActiveTab('Chat')}
            >
              <ChevronLeft size={14} />
              BACK
            </button>
          </div>
          
          <div className="flex flex-1 overflow-hidden relative">
            {/* Sliding Drawer Sidebar */}
            <div className={`absolute inset-y-0 left-0 w-64 border-r border-border/40 bg-card shadow-lg z-20 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="flex flex-col h-full overflow-y-auto py-4">
                <div className="space-y-1 px-3">
                  {categories.map(c => (
                    <button 
                      key={c} 
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors ${activeCategory === c ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      onClick={() => {
                        setActiveCategory(c)
                        setIsSidebarOpen(false)
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 px-6 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspaces</div>
                <div className="space-y-1 px-3">
                  <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">gravity</button>
                  <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">docs</button>
                  <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">opencode-ide</button>
                </div>
              </div>
            </div>
            
            {/* Overlay */}
            {isSidebarOpen && (
              <div 
                className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10" 
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
