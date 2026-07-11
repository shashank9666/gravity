"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
require("./index.css");
const Toggle = ({ label, description, checked, onChange }) => (<div className="setting-card">
    <div className="setting-header">
      <div className="setting-title">{label}</div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}/>
        <span className="slider"></span>
      </label>
    </div>
    {description && <div className="setting-description">{description}</div>}
  </div>);
const Select = ({ label, description, value, options, onChange }) => (<div className="setting-card">
    <div className="setting-header">
      <div className="setting-title">{label}</div>
      <div className="select-wrapper">
        <select value={value} onChange={e => onChange(e.target.value)}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
    {description && <div className="setting-description">{description}</div>}
  </div>);
const Input = ({ label, description, value, onChange }) => (<div className="setting-card">
    <div className="setting-header">
      <div className="setting-title">{label}</div>
    </div>
    {description && <div className="setting-description">{description}</div>}
    <input type="text" value={value} onChange={e => onChange(e.target.value)}/>
  </div>);
const StringList = ({ label, description, items, onAdd, onRemove }) => (<div className="setting-card">
    <div className="setting-header">
      <div className="setting-title">{label}</div>
    </div>
    {description && <div className="setting-description">{description}</div>}
    <div className="string-list">
      {items.map((item, i) => (<div key={i} className="string-item">
          <span>{item}</span>
          <button onClick={() => onRemove(i)}>✕</button>
        </div>))}
      <input type="text" placeholder="Add new..." onKeyDown={e => {
        if (e.key === 'Enter') {
            onAdd(e.currentTarget.value);
            e.currentTarget.value = '';
        }
    }}/>
    </div>
  </div>);
function App() {
    const [activeCategory, setActiveCategory] = (0, react_1.useState)('General');
    const renderContent = () => {
        switch (activeCategory) {
            case 'General':
                return (<>
            <div className="section-title">General Settings</div>
            <Toggle label="Explain and Fix in Current Conversation" description="Continue in current conversation instead of starting new." checked={true} onChange={() => { }}/>
            <Toggle label="Open Agent on Reload" description="Open Agent panel on window reload" checked={false} onChange={() => { }}/>
            <Toggle label="Enable Sounds for Agent" description="Play a sound when Agent finishes generating a response" checked={true} onChange={() => { }}/>
            <Toggle label="Auto-Expand Changes Overview" description="Automatically expand changes overview on response" checked={true} onChange={() => { }}/>
            <Toggle label="Verbose agent chat" description="Display intermediate thinking steps" checked={false} onChange={() => { }}/>
            <Toggle label="Enable Demo Mode (Beta)" description="Modify UI for consistent demos" checked={false} onChange={() => { }}/>
            <Input label="[Dev] GCP Project ID" description="GCP Project ID for enterprise features" value="my-gcp-project-id" onChange={() => { }}/>
          </>);
            case 'Security':
                return (<>
            <div className="section-title">Security & Permissions</div>
            <Select label="Agent security mode" description="Select one of the three options." value="Full access" options={['Full access', 'Sandboxed', 'Strict']} onChange={() => { }}/>
            <Toggle label="Agent Non-Workspace File Access" description="Allow agent to access files outside workspace" checked={true} onChange={() => { }}/>
            <Toggle label="Auto-Open Edited Files" description="Open files in the background if Agent creates or edits them" checked={true} onChange={() => { }}/>
          </>);
            case 'AI & Models':
                return (<>
            <div className="section-title">AI & Models</div>
            <Select label="Provider" description="Select the AI provider." value="Google" options={['Google', 'OpenAI', 'Anthropic', 'Local']} onChange={() => { }}/>
            <Select label="Models" description="Select the specific model to use." value="Gemini 3.1 Pro (Low)" options={['Gemini 3.1 Pro (Low)', 'Gemini 3.1 Pro', 'Gemini 3.1 Flash']} onChange={() => { }}/>
            <Select label="Review Policy" description="Specifies behavior when asking for review on artifacts." value="Always Ask" options={['Always Ask', 'Never Ask']} onChange={() => { }}/>
            <Toggle label="Agent Auto-Fix Lints" description="Agent may fix lints without prompt" checked={true} onChange={() => { }}/>
            <Toggle label="Conversation History" description="Agent can access past conversations" checked={true} onChange={() => { }}/>
            <Toggle label="Knowledge" description="Agent can access its knowledge base" checked={true} onChange={() => { }}/>
          </>);
            case 'Terminal':
                return (<>
            <div className="section-title">Terminal</div>
            <Select label="Terminal Command Auto Execution" description="Controls whether terminal commands require your approval." value="Request Review" options={['Request Review', 'Auto Execute']} onChange={() => { }}/>
            <Toggle label="Enable Shell Integration" description="Agent will use IDE's shell integration." checked={true} onChange={() => { }}/>
          </>);
            case 'Advanced':
                return (<>
            <div className="section-title">Advanced Configuration</div>
            <StringList label="Allow List Terminal Commands" description="Commands matched by allow list entry" items={['npm install', 'npm run', 'Select-String']} onAdd={() => { }} onRemove={() => { }}/>
            <StringList label="Deny List Terminal Commands" items={[]} onAdd={() => { }} onRemove={() => { }}/>
            <StringList label="Read Files" description="Paths the agent can read" items={[]} onAdd={() => { }} onRemove={() => { }}/>
            <StringList label="Write Files" description="Paths the agent can modify" items={[]} onAdd={() => { }} onRemove={() => { }}/>
            <StringList label="Terminal Commands" items={['allow npm install']} onAdd={() => { }} onRemove={() => { }}/>
          </>);
            case 'Editor':
                return (<>
            <div className="section-title">Editor & Suggestions</div>
            <Toggle label="Suggestions in Editor" description="Show suggestions when typing" checked={true} onChange={() => { }}/>
            <Select label="Tab Speed" description="Set the speed of tab suggestions" value="Fast" options={['Fast', 'Normal', 'Slow']} onChange={() => { }}/>
            <Toggle label="Highlight After Accept" description="Highlight newly inserted text" checked={true} onChange={() => { }}/>
            <Toggle label="Tab to Import" description="Add and update imports with tab" checked={true} onChange={() => { }}/>
            <Toggle label="Tab to Jump" description="Predict location of next edit" checked={true} onChange={() => { }}/>
            <Toggle label="Tab Gitignore Access" description="Allow Tab to view and edit .gitignore" checked={true} onChange={() => { }}/>
            <Toggle label="Show Selection Actions" description="Show Edit and Chat buttons on selection" checked={true} onChange={() => { }}/>
          </>);
            case 'Browser':
                return (<>
            <div className="section-title">Browser Settings</div>
            <Toggle label="Enable Browser Tools" description="Agent can use browser tools" checked={true} onChange={() => { }}/>
            <Select label="Browser Javascript Execution Policy" value="Request Review" options={['Request Review', 'Allow']} onChange={() => { }}/>
            <Toggle label="Enable Notifications for Agent" checked={true} onChange={() => { }}/>
            <StringList label="Execute URLs" description="URLs the agent can actuate on" items={['127.0.0.1', 'localhost', 'www.google.com']} onAdd={() => { }} onRemove={() => { }}/>
          </>);
            case 'Marketplace':
                return (<>
            <div className="section-title">Marketplace</div>
            <Input label="Marketplace Item URL" value="https://open-vsx.org/vscode/item" onChange={() => { }}/>
            <Input label="Marketplace Gallery URL" value="https://open-vsx.org/vscode/gallery" onChange={() => { }}/>
          </>);
            default:
                return null;
        }
    };
    const categories = ['General', 'Security', 'AI & Models', 'Terminal', 'Advanced', 'Editor', 'Browser', 'Marketplace'];
    return (<div className="settings-container">
      <div className="sidebar">
        <div className="sidebar-title">Settings</div>
        {categories.map(c => (<div key={c} className={`nav-item ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)}>
            {c}
          </div>))}
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>);
}
exports.default = App;
//# sourceMappingURL=App.js.map