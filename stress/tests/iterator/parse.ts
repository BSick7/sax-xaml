import StressTest = require('../../StressTest');

var parser = new DOMParser();

class Parse extends StressTest {
    xmlDoc: Document;

    prepare (ready?: () => any): boolean {
        require(['text!docs/Metro.theme.xml'], (doc: string) => {
            this.xmlDoc = parser.parseFromString(doc, "text/xml");
            ready();
        });
        return true;
    }

    runIteration () {
        sax.xaml.iterator.parse(this.xmlDoc.documentElement, {
            onElementStart(el: Element) {

            },
            onElementEnd(el: Element) {

            },
            onAttribute(attr: Attr) {

            }
        });
    }
}
export = Parse;