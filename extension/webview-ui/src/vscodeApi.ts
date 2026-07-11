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

    public getState(): any {
        if (this.vsCodeApi) {
            return this.vsCodeApi.getState();
        }
        return undefined;
    }

    public setState(state: any) {
        if (this.vsCodeApi) {
            this.vsCodeApi.setState(state);
        }
    }
}

export const vscode = new VSCodeAPIWrapper();
