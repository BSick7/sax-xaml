module sax.xaml.iterator {
    export class IterativeParser {
        private $$listener: IXamlSax = null;
        private $$defaultXmlns: string;
        private $$xXmlns: string;

        extension: extensions.ExtensionParser;

        constructor () {
            this.extension = this.createExtensionParser();
            this.setNamespaces(DEFAULT_XMLNS, DEFAULT_XMLNS_X);
        }

        setNamespaces (defaultXmlns: string, xXmlns: string): IterativeParser {
            this.$$defaultXmlns = defaultXmlns;
            this.$$xXmlns = xXmlns;
            this.extension.setNamespaces(defaultXmlns, xXmlns);
            return this;
        }

        createExtensionParser (): extensions.ExtensionParser {
            return new extensions.ExtensionParser();
        }

        parse (el: Element): IterativeParser {
            if (!this.$$listener)
                this.on({});
            fullparse(el, this.$$listener, {XmlnsX: this.$$xXmlns}, this.extension);
            return this;
        }

        on (listener: IXamlSax): IterativeParser {
            this.$$listener = createListener(listener);
            return this;
        }
    }
}