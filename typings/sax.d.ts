declare module sax {
    export interface ISaxOpts {
        trim?: boolean;
        normalize?: boolean;
        lowercase?: boolean;
        xmlns?: boolean;
        position?: boolean;
    }

    export function parser (strict: boolean = true, opt?: ISaxOpts): SAXParser;

    export interface IProcessingInstruction {
        name: string;
        body: string;
    }
    export interface INode {
        name: string;
        prefix: string;
        local: string;
        uri: string;
        attributes: IAttribute[];
    }
    export interface IAttribute {
        name: string;
        value: string;
        prefix: string;
        local: string;
        uri: string;
    }
    export interface INamespace {
        prefix: string;
        uri: string;
    }

    export class SAXParser {
        constructor (strict: boolean = true, opt?: ISaxOpts);
        write (chunk: string): SAXParser;
        close (): SAXParser;
        resume ();

        line: number;
        column: number;
        position: number;
        startTagPosition: number;
        closed: boolean;
        strict: boolean;
        opt: ISaxOpts;
        tag: INode;

        onerror: (e: Error) => any;
        ontext: (text: string) => any;
        ondoctype: (doctype: string) => any;
        onprocessinginstruction: (ins: IProcessingInstruction) => any;
        onsgmldeclaration: () => any;
        onopentag: (node: INode) => any;
        onclosetag: (tagName: string) => any;
        onattribute: (attr: IAttribute) => any;
        oncomment: (comment: string) => any;
        onopencdata: () => any;
        oncdata: (text: string) => any;
        onclosecdata: () => any;
        onopennamespace: (ns: INamespace) => any;
        onclosenamespace: (ns: INamespace) => any;
        onend: () => any;
        onready: () => any;
        onscript: (script: string) => any;
    }
}