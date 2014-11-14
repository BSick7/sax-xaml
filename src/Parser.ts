module saxxaml {
    export interface IObjectStartCallback {
        (xmlns: string, name: string): any;
    }
    export interface IObjectEndCallback {
        (obj: any): any;
    }
    export class Parser {
        onObjectStart: IObjectStartCallback = null;
        onObjectEnd: IObjectEndCallback = null;
        onName;
        onKey;
        onPropertyStart;
        onPropertyEnd;
        onAttachedPropertyStart;
        onAttachedPropertyEnd;

        private $$parser: sax.SAXParser;

        init () {
            var parser = this.$$parser = sax.parser(true, {
                xmlns: true,
                position: true
            });
            var objs = [];
            parser.onopentag = (node: sax.INode) => {
                var obj = this.onObjectStart(node.uri, node.local);
                objs.push(obj);
            };
            parser.onclosetag = () => {
                this.onObjectEnd(objs.pop());
            };
        }

        parse (xml: string) {
        }

        private $$destroy () {

        }
    }
}