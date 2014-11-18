module sax.xaml.extensions.tests.basic {
    QUnit.module('Markup Extension');

    QUnit.test("Empty Extension", () => {
        helpers.parse("{Empty }", cmds => {
            var i = 0;
            deepEqual(cmds[i], {
                cmd: 'rt',
                xmlns: sax.xaml.DEFAULT_XMLNS,
                name: 'Empty',
                type: cmds[i].type
            }, 'rt Empty');
            i++;
            var em = cmds[i].obj;
            deepEqual(cmds[i], {
                cmd: 'or',
                type: cmds[i - 1].type,
                obj: em
            }, 'or Empty');
            i++;
            deepEqual(cmds[i], {
                cmd: 'os',
                obj: em
            }, 'os Empty');
            strictEqual(cmds.length, i + 1);
        });
    });

    QUnit.test("StaticResource", () => {
        helpers.parse("{StaticResource SomeStyle}", cmds => {
            var i = 0;
            deepEqual(cmds[i], {
                cmd: 'rt',
                xmlns: sax.xaml.DEFAULT_XMLNS,
                name: 'StaticResource',
                type: cmds[i].type
            }, 'rt StaticResource');
            i++;
            var sr = cmds[i].obj;
            deepEqual(cmds[i], {
                cmd: 'or',
                type: cmds[i - 1].type,
                obj: sr
            }, 'or StaticResource');
            i++;
            deepEqual(cmds[i], {
                cmd: 'os',
                obj: sr
            }, 'os StaticResource');
            i++;
            deepEqual(cmds[i], {
                cmd: 'ps',
                propName: null
            }, 'ps [Implicit]');
            i++;
            deepEqual(cmds[i], {
                cmd: 'os',
                obj: "SomeStyle"
            }, 'os \'SomeStyle\'');
            i++;
            deepEqual(cmds[i], {
                cmd: 'pe',
                propName: null
            }, 'pe [Implicit]');
            strictEqual(cmds.length, i + 1);
        });
    });

    QUnit.test("StaticResource with Property", () => {
        helpers.parse("{StaticResource ResourceKey=Some\\{Style}", cmds => {
            var i = 0;
            deepEqual(cmds[i], {
                cmd: 'rt',
                xmlns: sax.xaml.DEFAULT_XMLNS,
                name: 'StaticResource',
                type: cmds[i].type
            }, 'rt StaticResource');
            i++;
            var sr = cmds[i].obj;
            deepEqual(cmds[i], {
                cmd: 'or',
                type: cmds[i - 1].type,
                obj: sr
            }, 'or StaticResource');
            i++;
            deepEqual(cmds[i], {
                cmd: 'os',
                obj: sr
            }, 'os StaticResource');
            i++;
            deepEqual(cmds[i], {
                cmd: 'ps',
                propName: "ResourceKey"
            }, 'ps ResourceKey');
            i++;
            deepEqual(cmds[i], {
                cmd: 'os',
                obj: "Some{Style"
            }, 'os \'Some{Style\'');
            i++;
            deepEqual(cmds[i], {
                cmd: 'pe',
                propName: "ResourceKey"
            }, 'ps ResourceKey');
            strictEqual(cmds.length, i + 1);
        });
    });
}