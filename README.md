# Gravity IDE

Gravity is an AI-native coding assistant for Visual Studio Code that brings autonomous software engineering directly into your editor.

## Features

- **Unified Chat & Settings**: A premium, React-based webview UI that runs natively inside your VS Code sidebar.
- **Provider Agnostic**: Seamlessly connect to OpenAI, Anthropic, OpenRouter, Groq, Ollama, LM Studio, and more using an OpenAI-compatible API layer.
- **Persistent Configuration**: Manage your API keys, models, and endpoints securely via the built-in UI or VS Code's native `settings.json`.
- **Autonomous Agents**: Highly configurable security modes (Full Access, Sandboxed, Strict) allow agents to perform complex terminal and file system operations autonomously.

## Getting Started

1. Download the latest `gravity-extension.vsix` package.
2. In VS Code, go to **Extensions**.
3. Click the `...` menu in the top right corner and select **Install from VSIX...**.
4. Select the downloaded `.vsix` file.
5. Open the Gravity sidebar (look for the custom Gravity icon in your activity bar).
6. Go to the **Settings** tab and configure your **API Endpoint**, **API Key**, and **Model**.
7. Switch to the **Chat** tab and start coding!

## Development

To build the extension from source:

1. Clone the repository.
2. Navigate to `extension/webview-ui` and run `npm install` and `npm run build` to compile the React application.
3. Navigate to `extension` and run `npm install` and `npm run compile` to build the TypeScript extension.
4. Run `npm run package` to generate the `.vsix` file.

## License

MIT License
