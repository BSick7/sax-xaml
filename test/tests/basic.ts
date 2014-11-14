module sax.xaml.tests.basic {
    QUnit.module('Basic Tests');

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

    QUnit.asyncTest("No callbacks - Graceful", () => {
        getDoc("docs/test1.xml", (doc) => {
            var parser = new Parser()
                .onEnd(() => {
                    QUnit.start();
                    ok(true);
                })
                .parse(doc);
        });
    });

    QUnit.asyncTest("Basic test", () => {
        getDoc("docs/test1.xml", (doc) => {
            var parser = new Parser()
                .onResolveType((xmlns, name) => {
                    console.log("Resolve Type", xmlns, name);
                    var func = new Function("return function " + name + "() { }");
                    return func();
                }).onObjectResolve((type) => {
                    console.log("Resolve Object", type);
                    return new type();
                }).onObject((obj) => {
                    console.log("Object", obj);
                }).onContentObject((obj) => {
                    console.log("Content Object", obj);
                }).onName((name) => {
                    console.log("x:Name", name);
                }).onKey((key) => {
                    console.log("x:Key", key);
                }).onPropertyStart((ownerType, propName) => {
                    console.log("Property Start", ownerType, propName);
                }).onPropertyEnd((ownerType, propName) => {
                    console.log("Property End", ownerType, propName);
                }).onEnd(() => {
                    QUnit.start();
                    ok(true);
                }).parse(doc);
        });
    });
}