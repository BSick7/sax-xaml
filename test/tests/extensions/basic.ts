module sax.xaml.extensions.tests.basic {
    QUnit.module('Markup Extension (basic)');

    class StaticResource implements IMarkupExtension {
        ResourceKey: string;

        init (val: string) {
            this.ResourceKey = val;
        }

        transmute (ctx: IMarkupContext): any {
            if (this.ResourceKey === "Two")
                return 2;
            return this;
        }
    }

    class Random implements IMarkupExtension {
        Foo: number;

        init (val: string) {
        }
    }

    var parser = new ExtensionParser()
        .onResolveType((xmlns, name) => {
            if (xmlns === sax.xaml.DEFAULT_XMLNS && name === "StaticResource")
                return StaticResource;
            if (xmlns === sax.xaml.DEFAULT_XMLNS && name === "Random")
                return Random;
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

    QUnit.test("StaticResource (implicit)", () => {
        var val = parser.parse("{StaticResource SomeStyle}", mock.context());
        var expected = new StaticResource();
        expected.ResourceKey = "SomeStyle";
        deepEqual(val, expected);
    });

    QUnit.test("StaticResource (Property)", () => {
        var val = parser.parse("{StaticResource ResourceKey=Some\\{Style}", mock.context());
        var expected = new StaticResource();
        expected.ResourceKey = "Some{Style";
        deepEqual(val, expected);
    });

    QUnit.test("Subextension", () => {
        var val = parser.parse("{Random Foo={StaticResource Two}}", mock.context());
        var expected = new Random();
        expected.Foo = 2;
        deepEqual(val, expected);
    });
}