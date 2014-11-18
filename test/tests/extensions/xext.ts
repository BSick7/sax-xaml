module sax.xaml.extensions.tests.basic {
    QUnit.module('Markup Extension');

    QUnit.test("x:Type", () => {
        helpers.parse("{x:Type Application}", cmds => {
            var i = 0;
            var appType = cmds[i].type;
            deepEqual(cmds[i], {
                cmd: 'rt',
                xmlns: sax.xaml.DEFAULT_XMLNS,
                name: 'Application',
                type: appType
            }, 'rt Application');
            i++;
            deepEqual(cmds[i], {
                cmd: 'os',
                obj: appType
            }, 'os ApplicationType');
            strictEqual(cmds.length, i + 1);
        });
    });

    QUnit.test("x:Null", () => {
        helpers.parse("{x:Null}", cmds => {
            var i = 0;
            deepEqual(cmds[i], {
                cmd: 'os',
                obj: null
            }, 'os Null');
            strictEqual(cmds.length, i + 1);
        });
    });

    QUnit.test("x:Static", () => {
        helpers.parse("{x:Static window}", cmds => {
            var i = 0;
            deepEqual(cmds[i], {
                cmd: 'os',
                obj: window
            }, 'os window');
            strictEqual(cmds.length, i + 1);
        });
    });
}