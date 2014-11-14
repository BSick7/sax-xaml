module sax.xaml.tests.basic {
    QUnit.module('Basic Tests');

    QUnit.asyncTest("No callbacks - Graceful", () => {
        getDoc("docs/test1.xml", (doc) => {
            var parser = new Parser()
                .onEnd(() => {
                    QUnit.start();
                    ok(true);
                })
                .parse(doc);
        }, (err) => {
            QUnit.start();
            ok(false, err.message);
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
        }, (err) => {
            QUnit.start();
            ok(false, err.message);
        });
    });
}