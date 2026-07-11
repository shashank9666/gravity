import { useState, useEffect } from 'react'
import './index.css'
import { ChatView } from './ChatView'

type Category = 'General' | 'Account' | 'Permissions' | 'Appearance' | 'Notifications' | 'Models' | 'Customizations' | 'Browser' | 'Tab' | 'Editor' | 'Workspaces'

import { vscode } from './vscodeApi';

const Toggle = ({ label, description, checked, onChange }: any) => (
  <div className="setting-card">
    <div className="setting-info">
      <div className="setting-title">{label}</div>
      {description && <div className="setting-description">{description}</div>}
    </div>
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="slider"></span>
    </label>
  </div>
)

const Select = ({ label, description, value, options, onChange }: any) => (
  <div className="setting-card">
    <div className="setting-info">
      <div className="setting-title">{label}</div>
      {description && <div className="setting-description">{description}</div>}
    </div>
    <div className="select-wrapper">
      <select className="setting-input" value={value} onChange={e => onChange(e.target.value)}>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
)

const Input = ({ label, description, value, onChange, type = "text", list }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="setting-card" style={{ display: 'block' }}>
      <div className="setting-info" style={{ marginBottom: '8px' }}>
        <div className="setting-title">{label}</div>
        {description && <div className="setting-description">{description}</div>}
      </div>
      <div style={{ position: 'relative' }}>
        <input 
          className="setting-input" 
          type={inputType} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          list={list} 
        />
        {isPassword && (
          <button 
            type="button"
            className="icon-btn"
            style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)' }}
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide API Key" : "Show API Key"}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3C3.5 3 0 8 0 8s3.5 5 8 5 8-5 8-5-3.5-5-8-5zm0 8.5C6.07 11.5 4.5 9.93 4.5 8S6.07 4.5 8 4.5 11.5 6.07 11.5 8 9.93 11.5 8 11.5zM8 6C6.9 6 6 6.9 6 8s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8.1 4.5c1.9 0 3.4 1.6 3.4 3.5 0 .6-.1 1.1-.4 1.5l2.4 2.4c1.3-1 2.5-2.2 2.5-3.9 0 0-3.5-5-8-5-1.5 0-2.8.4-4 1l1.8 1.8c.7-.8 1.5-1.3 2.3-1.3zM1 2.3l1.8 1.8c-.8.8-1.5 1.7-1.9 2.1 0 0 3.5 5 8 5 1.4 0 2.6-.3 3.7-.9l1.1 1.1 1.4-1.4-12.7-12.7L1 2.3zm3.7 3.7l1.5 1.5c-.4.5-.7 1.1-.7 1.7 0 1.9 1.6 3.5 3.5 3.5.6 0 1.1-.3 1.5-.6l1.7 1.7c-1 .6-2.2 1-3.5 1-2.9 0-5.3-2.3-5.3-5.3 0-1.1.4-2.1 1.3-2.5z"/></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const categories: Category[] = ['General', 'Models', 'Permissions', 'Appearance', 'Notifications', 'Customizations', 'Browser', 'Tab', 'Editor']
  const [activeTab, setActiveTab] = useState<'Chat' | 'Settings'>('Chat')
  const [activeCategory, setActiveCategory] = useState<Category>('Models')
  
  // Settings State
  const [provider, setProvider] = useState('OpenAI')
  const [apiEndpoint, setApiEndpoint] = useState('https://api.openai.com/v1')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-4o')
  const [securityMode, setSecurityMode] = useState('Full access')
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
          <>
            <div className="section-title">AI Provider Configuration</div>
            <div className="section-subtitle">Configure your OpenAI-compatible endpoint, API key, and model choice.</div>
            
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
          </>
        )
      case 'Permissions':
        return (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--vscode-descriptionForeground)' }}>
              Settings - Permissions
            </div>
            
            <div className="setting-title" style={{ fontSize: '15px' }}>Agent security mode</div>
            <div className="setting-description" style={{ marginBottom: '1rem' }}>Select one of the three options. Agent settings and permissions can be further customized below.</div>
            
            <div className="security-cards">
              <div className={`security-card ${securityMode === 'Full access' ? 'active' : ''}`} onClick={() => updateSetting('securityMode', 'Full access', setSecurityMode)}>
                <div className="security-card-title">Full access</div>
                <div className="security-card-description">Agents have full access to your machine and external resources.</div>
              </div>
              <div className={`security-card ${securityMode === 'Sandboxed' ? 'active' : ''}`} onClick={() => updateSetting('securityMode', 'Sandboxed', setSecurityMode)}>
                <div className="security-card-title">Sandboxed</div>
                <div className="security-card-description">Agents run in a secure sandbox that restricts access to external resources outside of your trusted folders.</div>
              </div>
              <div className={`security-card ${securityMode === 'Strict' ? 'active' : ''}`} onClick={() => updateSetting('securityMode', 'Strict', setSecurityMode)}>
                <div className="security-card-title">Strict</div>
                <div className="security-card-description">Terminal commands always require review and the agent cannot access files outside of its given workspaces.</div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '1rem' }}>Terminal</div>
            
            <Select 
              label="Terminal Command Auto Execution" 
              description="Controls whether terminal commands require your approval before running. Note: A change to this setting will only apply to new messages sent to Agent." 
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

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2rem', marginBottom: '1rem' }}>File Access</div>
            
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
          </>
        )
      default:
        return <div style={{ padding: '2rem' }}>{activeCategory} settings coming soon...</div>
    }
  }

  return (
    <div className="settings-container" style={{ flexDirection: 'column' }}>
      {activeTab === 'Chat' ? (
        <ChatView 
          model={model} 
          onOpenSettings={() => setActiveTab('Settings')} 
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="chat-header">
            <div className="chat-header-title" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setActiveTab('Chat')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M10 14L3 8l7-6v12z"/></svg>
              BACK TO CHAT
            </div>
          </div>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div className="sidebar">
              {categories.map(c => (
                <div key={c} className={`nav-item ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)}>
                  {c}
                </div>
              ))}
              
              <div style={{ padding: '1.5rem 1.5rem 0.5rem', fontSize: '11px', color: 'var(--text-muted)' }}>Workspaces</div>
              <div className="nav-item">gravity</div>
              <div className="nav-item">docs</div>
              <div className="nav-item">opencode-ide</div>
            </div>
            <div className="content">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
