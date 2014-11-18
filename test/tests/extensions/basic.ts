module sax.xaml.extensions.tests.basic {
    QUnit.module('Markup Extension (basic)');

    class StaticResource implements IMarkupExtension {
        ResourceKey: string;

        init (val: string) {
            this.ResourceKey = val;
        }
    }

    var parser = new ExtensionParser()
        .onResolveType((xmlns, name) => {
            if (xmlns === sax.xaml.DEFAULT_XMLNS && name === "StaticResource")
                return StaticResource;
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

    QUnit.test("StaticResource (implicit)", () => {
        var val = parser.parse("{StaticResource SomeStyle}", mock.resolver());
        var expected = new StaticResource();
        expected.ResourceKey = "SomeStyle";
        deepEqual(val, expected);
    });

    QUnit.test("StaticResource (Property)", () => {
        var val = parser.parse("{StaticResource ResourceKey=Some\\{Style}", mock.resolver());
        var expected = new StaticResource();
        expected.ResourceKey = "Some{Style";
        deepEqual(val, expected);
    });
}