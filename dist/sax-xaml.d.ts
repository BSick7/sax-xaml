declare module sax.xaml {
    var version: string;
}
declare module sax.xaml {
    var DEFAULT_XMLNS: string;
    var DEFAULT_XMLNS_X: string;
    module events {
        interface IResolveType {
            (xmlns: string, name: string): any;
        }
        interface IObjectResolve {
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
    interface IParseInfo {
        line: number;
        column: number;
        position: number;
    }
    class Parser {
        public curObject: any;
        private $$onResolveType;
        private $$onObjectResolve;
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
        private $$objs;
        public parse(el: Element): Parser;
        private $$handleElement(el, isContent);
        private $$tryHandleError(el, xmlns, name);
        private $$tryHandlePropertyTag(el, xmlns, name);
        private $$handleAttribute(attr);
        private $$ensure();
        public onResolveType(cb?: events.IResolveType): Parser;
        public onObjectResolve(cb?: events.IObjectResolve): Parser;
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
