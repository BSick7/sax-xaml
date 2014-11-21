declare module sax.xaml {
    var version: string;
}
declare module sax.xaml {
    interface IMarkupExtension {
        init(val: string): any;
        transmute? (os: any[]): any;
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
        private $$objectStack;
        constructor();
        public setNamespaces(defaultXmlns: string, xXmlns: string): Parser;
        public createExtensionParser(): extensions.ExtensionParser;
        public parse(el: Element): Parser;
        private $$handleElement(el, isContent);
        private $$tryHandleError(el, xmlns, name);
        private $$tryHandlePropertyTag(el, xmlns, name);
        private $$processAttribute(attr);
        private $$shouldSkipAttr(prefix, name);
        private $$tryHandleXAttribute(uri, name, value);
        private $$handleAttribute(uri, name, value, attr);
        private $$getAttrValue(val, attr);
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
    interface INamespacePrefixResolver {
        lookupNamespaceURI(prefix: string): string;
    }
    class ExtensionParser {
        private $$defaultXmlns;
        private $$xXmlns;
        private $$onResolveType;
        private $$onResolveObject;
        private $$onError;
        private $$onEnd;
        public setNamespaces(defaultXmlns: string, xXmlns: string): void;
        public parse(value: string, resolver: INamespacePrefixResolver, os: any[]): any;
        private $$doParse(ctx, os);
        private $$parseName(ctx);
        private $$startExtension(ctx, os);
        private $$parseXExt(ctx, os, name, val);
        private $$parseKeyValue(ctx, os);
        private $$finishKeyValue(acc, key, val, os);
        private $$ensure();
        public onResolveType(cb?: events.IResolveType): ExtensionParser;
        public onResolveObject(cb?: events.IResolveObject): ExtensionParser;
        public onError(cb?: events.IError): ExtensionParser;
        public onEnd(cb: () => any): ExtensionParser;
        private $$destroy();
    }
}
declare module sax.xaml.iterator {
    class IterativeParser {
        private $$listener;
        private $$defaultXmlns;
        private $$xXmlns;
        public extension: extensions.ExtensionParser;
        constructor();
        public setNamespaces(defaultXmlns: string, xXmlns: string): IterativeParser;
        public createExtensionParser(): extensions.ExtensionParser;
        public parse(el: Element): IterativeParser;
        public on(listener: IXamlSax): IterativeParser;
    }
}
declare module sax.xaml.iterator {
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
    interface IXamlSax {
        onResolveType?: events.IResolveType;
        onResolveObject?: events.IResolveObject;
        onObject?: events.IObject;
        onObjectEnd?: events.IObject;
        onContentObject?: events.IObject;
        onContentText?: events.IText;
        onName?: events.IName;
        onKey?: events.IKey;
        onPropertyStart?: events.IPropertyStart;
        onPropertyEnd?: events.IPropertyEnd;
        onError?: events.IError;
        onEnd?: () => any;
    }
    function createListener(xsax: IXamlSax): IXamlSax;
    interface IOpts {
        XmlnsX: string;
    }
    function fullparse(el: Element, listener: IXamlSax, opts: IOpts, extensionParser: extensions.ExtensionParser): void;
}
declare module sax.xaml.iterator {
    interface IXmlSax {
        onElementStart(el: Element): any;
        onElementEnd(el: Element): any;
        onAttribute(attr: Attr): any;
    }
    function parse(el: Element, sax: IXmlSax): void;
}
