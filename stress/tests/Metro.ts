import StressTest = require('../StressTest');

class Metro extends StressTest {
    xmlDoc: string;

    prepare (ready?: () => any): boolean {
        require(['text!docs/Metro.theme.xml'], (doc: string) => {
            this.xmlDoc = doc;
            ready();
        });
        return true;
    }

    runIteration () {
        var parser = new sax.xaml.Parser()
            .parse(this.xmlDoc);
    }
}
export = Metro;