module sax.xaml.extensions.tests {
    export module helpers {
        var mock = {
            resolver: function (): INamespacePrefixResolver {
                return {
                    lookupNamespaceURI: function (prefix: string): string {
                        if (prefix == null)
                            return sax.xaml.DEFAULT_XMLNS;
                        if (prefix === "x")
                            return sax.xaml.DEFAULT_XMLNS_X;
                        return "";
                    }
                };
            }
        };

        export function parse (val: string, cb: (cmds: any[]) => any) {
            var cmds = [];
            var parser = new ExtensionParser()
                .onResolveType((xmlns, name) => {
                    var func = new Function("return function " + name + "() { }");
                    var type = func();
                    cmds.push({
                        cmd: 'rt',
                        xmlns: xmlns,
                        name: name,
                        type: type
                    });
                    return type;
                }).onObjectResolve((type) => {
                    var obj = new type();
                    cmds.push({
                        cmd: 'or',
                        type: type,
                        obj: obj
                    });
                    return obj;
                }).onObjectStart((obj) => {
                    cmds.push({
                        cmd: 'os',
                        obj: obj
                    });
                }).onPropertyStart((propName) => {
                    cmds.push({
                        cmd: 'ps',
                        propName: propName
                    });
                }).onPropertyEnd((propName) => {
                    cmds.push({
                        cmd: 'pe',
                        propName: propName
                    });
                }).onEnd(() => {
                    cb(cmds);
                }).parse(val, mock.resolver());
        }
    }
}