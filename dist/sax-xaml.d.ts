declare module sax.xaml {
    var version: string;
}
declare module sax.xaml {
    interface IMarkupExtension {
        init(val: string): any;
        transmute? (ctx: IDocumentContext): any;
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
    interface IDocumentContext {
        curObject: any;
        objectStack: any[];
    }
    class Parser<T extends IDocumentContext> {
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
        public extension: extensions.ExtensionParser<T>;
        private $$defaultXmlns;
        private $$xXmlns;
        constructor();
        public setNamespaces(defaultXmlns: string, xXmlns: string): Parser<T>;
        public createExtensionParser(): extensions.ExtensionParser<T>;
        public createContext(): T;
        public parse(el: Element): Parser<T>;
        private $$handleElement(el, ctx, isContent);
        private $$tryHandleError(el, xmlns, name);
        private $$tryHandlePropertyTag(el, ctx, xmlns, name);
        private $$handleAttribute(attr, ctx);
        private $$getAttrValue(attr, ctx);
        private $$ensure();
        public onResolveType(cb?: events.IResolveType): Parser<T>;
        public onResolveObject(cb?: events.IResolveObject): Parser<T>;
        public onObject(cb?: events.IObject): Parser<T>;
        public onObjectEnd(cb?: events.IObject): Parser<T>;
        public onContentObject(cb?: events.IObject): Parser<T>;
        public onContentText(cb?: events.IObject): Parser<T>;
        public onName(cb?: events.IName): Parser<T>;
        public onKey(cb?: events.IKey): Parser<T>;
        public onPropertyStart(cb?: events.IPropertyStart): Parser<T>;
        public onPropertyEnd(cb?: events.IPropertyEnd): Parser<T>;
        public onError(cb?: events.IError): Parser<T>;
        public onEnd(cb: () => any): Parser<T>;
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
    interface INamespacePrefixResolver {
        lookupNamespaceURI(prefix: string): string;
    }
    class ExtensionParser<TDoc extends IDocumentContext> {
        private $$defaultXmlns;
        private $$xXmlns;
        private $$onResolveType;
        private $$onResolveObject;
        private $$onError;
        private $$onEnd;
        public setNamespaces(defaultXmlns: string, xXmlns: string): void;
        public parse(value: string, resolver: INamespacePrefixResolver, docCtx: TDoc): any;
        private $$doParse(ctx);
        private $$parseName(ctx);
        private $$startExtension(ctx);
        private $$parseXExt(ctx, name, val);
        private $$parseKeyValue(ctx);
        private $$finishKeyValue(acc, key, val, docCtx);
        private $$ensure();
        public onResolveType(cb?: events.IResolveType): ExtensionParser<TDoc>;
        public onResolveObject(cb?: events.IResolveObject): ExtensionParser<TDoc>;
        public onError(cb?: events.IError): ExtensionParser<TDoc>;
        public onEnd(cb: () => any): ExtensionParser<TDoc>;
        private $$destroy();
    }
}
