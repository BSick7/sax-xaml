module sax.xaml.tests.invalid {
    QUnit.module('Invalid Tests');

    QUnit.asyncTest("Invalid XML", () => {
        getDoc("docs/invalid.xml", (doc) => {
            QUnit.start();
            var errored = false;
            var parser = new Parser<IDocumentContext>()
                .onError((e) => {
                    errored = true;
                    return true;
                })
                .onEnd(() => {
                    ok(errored);
                })
                .parse(doc.documentElement);
        }, (err) => {
            QUnit.start();
            ok(false, err.message);
        });
    });
}