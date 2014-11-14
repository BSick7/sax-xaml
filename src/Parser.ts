module saxxaml {
    export var DEFAULT_XMLNS = "http://schemas.wsick.com/xaml";
    export var DEFAULT_XMLNS_X = "http://schemas.wsick.com/xaml/x";

    export class Parser {
        onObjectStart: (xmlns: string, name: string) => any = null;
        onObjectEnd: (obj: any) => any = null;
        onName: (name: string) => any = null;
        onKey: (key: string) => any = null;
        onPropertyStart: (propName: string) => any = null;
        onPropertyEnd: (propName: string) => any = null;
        onAttachedPropertyStart: (ownerXmlns: string, ownerName: string, propName: string) => any = null;
        onAttachedPropertyEnd: (ownerXmlns: string, ownerName: string, propName: string) => any = null;

        private $$parser: sax.SAXParser;

        parse(xml: string) {
            var parser = this.$$parser = sax.parser(true, {
                xmlns: true,
                position: true
            });
            var objs = [];
            parser.onopentag = (node: sax.INode) => {
                var tagName = node.local;
                var ind = tagName.indexOf('.');
                if (ind > -1) {

                } else {
                    if (this.onObjectStart) {
                        var obj = this.onObjectStart(node.uri, node.local);
                        objs.push(obj);
                    }
                    this.onObjectStart && this.onObjectStart(node.uri, node.local);
                }
            };
            parser.onclosetag = (tagName: string) => {
                this.onObjectEnd && this.onObjectEnd(objs.pop());
            };
            parser.onattribute = (attr) => {
                var tagName = attr.name;
                var ind = tagName.indexOf('.');
                if (ind > -1) {
                    return;
                }
                if (attr.uri === DEFAULT_XMLNS_X) {
                    if (tagName === "Name")
                        return this.onName(attr.value);
                    if (tagName === "Key")
                        return this.onKey(attr.value);
                }
                this.onPropertyStart && this.onPropertyStart(tagName);
                if (this.onObjectStart) {
                    var obj = this.onObjectStart(attr.value);
                    this.onObjectEnd && this.onObjectEnd(obj);
                }
                this.onPropertyEnd && this.onPropertyEnd(tagName);
            };
            parser.ontext = (text) => {

            };
            parser.onend = () => this.$$destroy();
            parser.write(xml).close();
        }

        private $$destroy() {
            this.$$parser = null;
        }
    }
}