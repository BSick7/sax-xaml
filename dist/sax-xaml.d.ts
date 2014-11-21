declare module sax.xaml {
    var version: string;
}
declare module sax.xaml {
    interface IObjectStackItem {
        type: any;
        name: string;
        prop: boolean;
        obj: any;
        text: string;
    }
    interface IMarkupContext {
        attr: Attr;
        resolvePrefixUri(prefix: string): string;
        startObject(obj: any): any;
        endObject(): any;
        getCurrentItem(): IObjectStackItem;
        walkUpObjects(): IObjectWalker;
    }
    interface IObjectWalker {
        current: any;
        step(): boolean;
    }
    function createMarkupContext(os: any[]): IMarkupContext;
}
declare module sax.xaml {
    interface IMarkupExtension {
        init(val: string): any;
        transmute? (ctx: IMarkupContext): any;
    }
}
declare module sax.xaml {
    var DEFAULT_XMLNS: string;
    var DEFAULT_XMLNS_X: string;
    module events {
        interface IResolveType {
            (xmlns: string, name: string): any;
        }
        interface IResolveObject {
            (type: any): any;
        }
        interface IObject {
            (obj: any): any;
        }
        interface IText {
            (text: string): any;
        }
        interface IName {
            (name: string): any;
        }
        interface IKey {
            (key: string): any;
        }
        interface IPropertyStart {
            (ownerType: any, propName: string): any;
        }
        interface IPropertyEnd {
            (ownerType: any, propName: string): any;
        }
        interface IError {
            (e: Error): boolean;
        }
    }
    class Parser {
        private $$onResolveType;
        private $$onResolveObject;
        private $$onObject;
        private $$onObjectEnd;
        private $$onContentObject;
        private $$onContentText;
        private $$onName;
        private $$onKey;
        private $$onPropertyStart;
        private $$onPropertyEnd;
        private $$onError;
        private $$onEnd;
        public extension: extensions.ExtensionParser;
        private $$defaultXmlns;
        private $$xXmlns;
        constructor();
        public setNamespaces(defaultXmlns: string, xXmlns: string): Parser;
        public createExtensionParser(): extensions.ExtensionParser;
        public parse(el: Element): Parser;
        private $$doParse(el);
        private $$tryHandleError(el, xmlns, name);
        private $$tryStartProperty(uri, name);
        private $$startObject(uri, name, isContent, text);
        private $$processAttr(attr, mctx);
        private $$shouldSkipAttr(prefix, uri, name);
        private $$tryHandleXAttribute(uri, name, value);
        private $$tryHandleAttribute(uri, name, value, mctx);
        private $$ensure();
        public onResolveType(cb?: events.IResolveType): Parser;
        public onResolveObject(cb?: events.IResolveObject): Parser;
        public onObject(cb?: events.IObject): Parser;
        public onObjectEnd(cb?: events.IObject): Parser;
        public onContentObject(cb?: events.IObject): Parser;
        public onContentText(cb?: events.IObject): Parser;
        public onName(cb?: events.IName): Parser;
        public onKey(cb?: events.IKey): Parser;
        public onPropertyStart(cb?: events.IPropertyStart): Parser;
        public onPropertyEnd(cb?: events.IPropertyEnd): Parser;
        public onError(cb?: events.IError): Parser;
        public onEnd(cb: () => any): Parser;
        private $$destroy();
    }
}
declare module sax.xaml.extensions {
    module events {
        interface IResolveType {
            (xmlns: string, name: string): any;
        }
        interface IResolveObject {
            (type: any): any;
        }
        interface IError {
            (e: Error): any;
        }
    }
    class ExtensionParser {
        private $$defaultXmlns;
        private $$xXmlns;
        private $$onResolveType;
        private $$onResolveObject;
        private $$onError;
        private $$onEnd;
        public setNamespaces(defaultXmlns: string, xXmlns: string): void;
        public parse(value: string, mctx: IMarkupContext): any;
        private $$doParse(ctx, mctx);
        private $$parseName(ctx);
        private $$startExtension(ctx, mctx);
        private $$parseXExt(ctx, mctx, name, val);
        private $$parseKeyValue(ctx, mctx);
        private $$finishKeyValue(acc, mctx, key, val);
        private $$ensure();
        public onResolveType(cb?: events.IResolveType): ExtensionParser;
        public onResolveObject(cb?: events.IResolveObject): ExtensionParser;
        public onError(cb?: events.IError): ExtensionParser;
        public onEnd(cb: () => any): ExtensionParser;
        private $$destroy();
    }
}
