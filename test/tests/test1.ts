module saxxaml.tests {
    QUnit.module('Test 1');

    function getDoc(url: string, cb: (doc: string) => any) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = (ev) => {
            if (xhr.readyState === 4) {
                if (xhr.status !== 200)
                    return cb("");
                return cb(xhr.responseText)
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    }

    QUnit.asyncTest("Basic test", () => {
        getDoc("docs/Theme.xml", (doc) => {
            QUnit.start();
            var parser = new saxxaml.Parser();
            parser.parse(doc);
            parser.onObjectStart = (xmlns, name) => {

            };
            parser.onObjectEnd = (obj) => {

            };

            ok(true);
        });
    });
}