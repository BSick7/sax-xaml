module sax.xaml.tests.extensions.withext {
    QUnit.module('Parser+Extension Tests');

    QUnit.asyncTest("With Extension", () => {
        getDoc("docs/withext.xml", (doc) => {
            mock.parse(doc.documentElement, (cmds) => {
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
                    cmd: 'rt',
                    xmlns: sax.xaml.DEFAULT_XMLNS,
                    name: 'Application',
                    type: cmds[i].type
                }, 'rt Application');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'ps',
                    ownerType: cmds[i - 1].type,
                    propName: 'Resources'
                }, 'ps Resources');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'rt',
                    xmlns: sax.xaml.DEFAULT_XMLNS,
                    name: 'Style',
                    type: cmds[i].type
                }, 'rt Style');
                i++;
                var style = cmds[i].obj;
                deepEqual(cmds[i], {
                    cmd: 'or',
                    type: cmds[i - 1].type,
                    obj: style
                }, 'or Style');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'o',
                    obj: style
                }, 'o Style');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'ps',
                    ownerType: null,
                    propName: 'TargetType'
                }, 'ps TargetType');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'rt',
                    xmlns: sax.xaml.DEFAULT_XMLNS,
                    name: 'Grid',
                    type: cmds[i].type
                }, 'rt Grid');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'o',
                    obj: cmds[i - 1].type
                }, 'o Grid');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'oe',
                    obj: cmds[i - 2].type
                }, 'oe Grid');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'pe',
                    ownerType: null,
                    propName: 'TargetType'
                }, 'pe TargetType');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'oe',
                    obj: style
                }, 'oe Style');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'pe',
                    ownerType: cmds[i - 11].type,
                    propName: 'Resources'
                }, 'pe Resources');
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