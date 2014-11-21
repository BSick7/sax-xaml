module sax.xaml.extensions.tests.basic {
    QUnit.module('Markup Extension (xmlns:x)');

    var parser = new ExtensionParser()
        .onResolveType((xmlns, name) => {
            var func = new Function("return function " + name + "() { }");
            return func();
        });
    var mock = {
        context: function (): IMarkupContext {
            var mctx = createMarkupContext([]);
            mctx.resolvePrefixUri = function (prefix: string): string {
                if (prefix === null)
                    return sax.xaml.DEFAULT_XMLNS;
                if (prefix === "x")
                    return sax.xaml.DEFAULT_XMLNS_X;
                return "";
            };
            return mctx;
        }
    };

    QUnit.test("x:Type", () => {
        var val = parser.parse("{x:Type Application}", mock.context());
        ok(typeof val === "function");
        strictEqual(val.name, "Application");
    });

    QUnit.test("x:Null", () => {
        var val = parser.parse("{x:Null}", mock.context());
        strictEqual(val, null);
    });

    QUnit.test("x:Static", () => {
        var val = parser.parse("{x:Static window}", mock.context());
        strictEqual(val, window);
    });
}