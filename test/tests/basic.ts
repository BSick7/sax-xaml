module sax.xaml.tests.basic {
    QUnit.module('Basic Tests');

    QUnit.asyncTest("No callbacks - Graceful", () => {
        getDoc("docs/basic.xml", (doc) => {
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

    QUnit.asyncTest("Basic", () => {
        getDoc("docs/basic.xml", (doc) => {
            mock.parse(doc, (cmds) => {
                QUnit.start();

                //Application
                var i = 0;
                deepEqual(cmds[i], {
                    cmd: 'rt',
                    xmlns: sax.xaml.DEFAULT_XMLNS,
                    name: 'Application',
                    type: cmds[i].type
                }, 'rt Application');
                i++;
                var app = cmds[i].obj;
                deepEqual(cmds[i], {
                    cmd: 'or',
                    type: cmds[i - 1].type,
                    obj: app
                }, 'or Application');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'co',
                    obj: app
                }, 'co Application');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'name',
                    name: 'LayoutRoot'
                }, 'name Application');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'rt',
                    xmlns: sax.xaml.DEFAULT_XMLNS,
                    name: 'Button',
                    type: cmds[i].type
                }, 'rt Button');
                i++;
                var btn = cmds[i].obj;
                deepEqual(cmds[i], {
                    cmd: 'or',
                    type: cmds[i - 1].type,
                    obj: btn
                }, 'or Button');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'co',
                    obj: btn
                }, 'co Button');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'ct',
                    text: 'Content'
                }, 'ct Content');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'oe',
                    obj: btn
                }, 'oe Button');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'oe',
                    obj: app
                }, 'oe Application');
                strictEqual(cmds.length, i + 1);
            });
        }, (err) => {
            QUnit.start();
            ok(false, err.message);
        });
    });
}