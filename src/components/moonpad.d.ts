import * as LSP from 'vscode-languageserver-protocol';

declare type CompileResult = {
    output: Uint8Array | null;
    reports: [string, LSP.Diagnostic][];
    timeCost: number;
};

export declare class Moonpad extends HTMLElement {
    #private;
    constructor();
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(name: string, _oldValue: string, newValue: string): void;
    get _view();
    get _connection();
    get _uri();
    compile(): Promise<CompileResult>;
    run(): Promise<string>;
    format(): Promise<void>;
    reset(): void;
}

export { }
