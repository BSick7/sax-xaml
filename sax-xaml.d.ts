declare module saxxaml {
    var Version: string;
}
declare module saxxaml {
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
    }
    class Parser {
        public onResolveType: events.IResolveType;
        public onObjectResolve: events.IObjectResolve;
        public onObject: events.IObject;
        public onContentObject: events.IObject;
        public onName: events.IName;
        public onKey: events.IKey;
        public onPropertyStart: events.IPropertyStart;
        public onPropertyEnd: events.IPropertyEnd;
        private $$parser;
        public curObject: any;
        private $$immediateProp;
        private $$lastText;
        public listen(onResolveType: events.IResolveType, onObjectResolve: events.IObjectResolve, onObject: events.IObject, onContentObject: events.IObject, onName: events.IName, onKey: events.IKey, onPropertyStart: events.IPropertyStart, onPropertyEnd: events.IPropertyEnd): void;
        public parse(xml: string): void;
        private $$destroy();
    }
}
