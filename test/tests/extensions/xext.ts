module sax.xaml.extensions.tests.basic {
    QUnit.module('Markup Extension (xmlns:x)');

    var parser = new ExtensionParser()
        .onResolveType((xmlns, name) => {
            var func = new Function("return function " + name + "() { }");
            return func();
        });
    var mock = {
        resolver: function (): INamespacePrefixResolver {
            return {
                lookupNamespaceURI: function (prefix: string): string {
                    if (prefix === null)
                        return sax.xaml.DEFAULT_XMLNS;
                    if (prefix === "x")
                        return sax.xaml.DEFAULT_XMLNS_X;
                    return "";
                }
            };
        }
    };

    QUnit.test("x:Type", () => {
        var val = parser.parse("{x:Type Application}", mock.resolver(), []);
        ok(typeof val === "function");
        strictEqual(val.name, "Application");
    });

    QUnit.test("x:Null", () => {
        var val = parser.parse("{x:Null}", mock.resolver(), []);
        strictEqual(val, null);
    });

    QUnit.test("x:Static", () => {
        var val = parser.parse("{x:Static window}", mock.resolver(), []);
        strictEqual(val, window);
    });
}