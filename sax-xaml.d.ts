declare module saxxaml {
    var Version: string;
}
declare module saxxaml {
    class Parser {
        public onObjectStart: (xmlns: string, name: string) => any;
        public onObjectEnd: (obj: any) => any;
        public onName: (name: string) => any;
        public onKey: (key: string) => any;
        public onPropertyStart: (propName: string) => any;
        public onPropertyEnd: (propName: string) => any;
        public onAttachedPropertyStart: (ownerXmlns: string, ownerName: string, propName: string) => any;
        public onAttachedPropertyEnd: (ownerXmlns: string, ownerName: string, propName: string) => any;
        private $$parser;
        public parse(xml: string): void;
        private $$destroy();
    }
}
declare module saxxaml {
    var DEFAULT_XMLNS: string;
    var DEFAULT_XMLNS_X: string;
}
