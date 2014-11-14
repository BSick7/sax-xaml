module sax.xaml.tests.invalid {
    QUnit.module('Invalid Tests');

    QUnit.asyncTest("Invalid XML", () => {
        getDoc("docs/invalid.xml", (doc) => {
            QUnit.start();
            var errored = false;
            var parser = new Parser()
                .onError((e) => {
                    errored = true;
                    return true;
                })
                .onEnd(() => {
                    ok(errored);
                })
                .parse(doc);
        }, (err) => {
            QUnit.start();
            ok(false, err.message);
        });
    });
}