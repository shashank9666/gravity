declare const acquireVsCodeApi: any;

class VSCodeAPIWrapper {
    private readonly vsCodeApi: any;

    constructor() {
        if (typeof acquireVsCodeApi === 'function') {
            this.vsCodeApi = acquireVsCodeApi();
        }
    }

    public postMessage(message: any) {
        if (this.vsCodeApi) {
            this.vsCodeApi.postMessage(message);
        }
    }
}

export const vscode = new VSCodeAPIWrapper();
