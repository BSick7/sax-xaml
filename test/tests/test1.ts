module saxxaml.tests {
    QUnit.module('Test 1');

    function getDoc (url: string, cb: (doc: string) => any) {
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
        getDoc("docs/test1.xml", (doc) => {
            QUnit.start();
            var parser = new saxxaml.Parser();
            parser.listen((xmlns, name) => {
                console.log("Resolve Type", xmlns, name);
                var func = new Function("return function " + name + "() { }");
                return func();
            }, (type) => {
                console.log("Resolve Object", type);
                return new type();
            }, (obj) => {
                console.log("Object", obj);
            }, (obj) => {
                console.log("Content Object", obj);
            }, (name) => {
                console.log("x:Name", name);
            }, (key) => {
                console.log("x:Key", key);
            }, (ownerType, propName) => {
                console.log("Property Start", ownerType, propName);
            }, (ownerType, propName) => {
                console.log("Property End", ownerType, propName);
            });
            parser.parse(doc);
            ok(true);
        });
    });
}