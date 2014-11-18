module sax.xaml.extensions {
    // Syntax:
    //      {<Alias|Name> [<DefaultKey>=]<DefaultValue>|<Key>=<Value>}
    // Examples:
    //  {x:Null }
    //  {x:Type }
    //  {x:Static }
    //  {TemplateBinding }
    //  {Binding }
    //  {StaticResource }

    export module events {
        export interface IResolveType {
            (xmlns: string, name: string): any;
        }
        export interface IObjectResolve {
            (type: any): any;
        }
        export interface IObjectStart {
            (obj: any);
        }
        export interface IPropertyStart {
            (propName: string);
        }
        export interface IPropertyEnd {
            (propName: string);
        }
        export interface IError {
            (e: Error);
        }
    }

    interface IParseContext {
        text: string;
        i: number;
        acc: string;
        error: any;
        objs: any[];
        resolver: INamespacePrefixResolver;
    }
    export interface INamespacePrefixResolver {
        lookupNamespaceURI(prefix: string): string;
    }
    export class ExtensionParser {
        private $$defaultXmlns = "http://schemas.wsick.com/fayde";
        private $$xXmlns = "http://schemas.wsick.com/fayde/x";

        private $$onResolveType: events.IResolveType;
        private $$onObjectResolve: events.IObjectResolve;
        private $$onObjectStart: events.IObjectStart;
        private $$onPropertyStart: events.IPropertyStart;
        private $$onPropertyEnd: events.IPropertyEnd;
        private $$onError: events.IError;
        private $$onEnd: () => any = null;

        curObject: any;

        setNamespaces (defaultXmlns: string, xXmlns: string) {
            this.$$defaultXmlns = defaultXmlns;
            this.$$xXmlns = xXmlns;
        }

        parse (value: string, resolver: INamespacePrefixResolver): any {
            this.$$ensure();
            var ctx: IParseContext = {
                text: value,
                i: 1,
                acc: "",
                error: "",
                objs: [],
                resolver: resolver
            };
            var obj = this.$$doParse(ctx);
            if (ctx.error)
                this.$$onError(ctx.error);
            this.$$destroy();
            return obj;
        }

        private $$doParse (ctx: IParseContext): any {
            if (!this.$$parseName(ctx))
                return undefined;
            if (!this.$$startExtension(ctx))
                return undefined;

            while (ctx.i < ctx.text.length) {
                if (!this.$$parseKeyValue(ctx))
                    break;
                if (ctx.text[ctx.i] === "}") {
                    ctx.i++;
                    break;
                }
            }

            var obj = ctx.objs.pop();
            this.curObject = ctx.objs[ctx.objs.length - 1];
            return obj;
        }

        private $$parseName (ctx: IParseContext): boolean {
            var ind = ctx.text.indexOf(" ", ctx.i);
            if (ind > ctx.i) {
                ctx.acc = ctx.text.substr(ctx.i, ind - ctx.i);
                ctx.i = ind + 1;
                return true;
            }
            ind = ctx.text.indexOf("}", ctx.i);
            if (ind > ctx.i) {
                ctx.acc = ctx.text.substr(ctx.i, ind - ctx.i);
                ctx.i = ind;
                return true;
            }
            ctx.error = "Missing closing bracket.";
            return false;
        }

        private $$startExtension (ctx: IParseContext): boolean {
            var full = ctx.acc;
            var ind = full.indexOf(":");
            var prefix = (ind < 0) ? null : full.substr(0, ind);
            var name = (ind < 0) ? full : full.substr(ind + 1);
            var uri = ctx.resolver.lookupNamespaceURI(prefix);

            if (uri === this.$$xXmlns) {
                var val = ctx.text.substr(ctx.i, ctx.text.length - ctx.i - 1);
                ctx.i = ctx.text.length;
                return this.$$parseXExt(ctx, name, val);
            }

            var type = this.$$onResolveType(uri, name);
            var obj = this.curObject = this.$$onObjectResolve(type);
            ctx.objs.push(obj);
            this.$$onObjectStart(obj);
            return true;
        }

        private $$parseXExt (ctx: IParseContext, name: string, val: string): boolean {
            if (name === "Null") {
                this.$$onObjectStart(null);
                return true;
            }
            if (name === "Type") {
                var ind = val.indexOf(":");
                var prefix = (ind < 0) ? null : val.substr(0, ind);
                var name = (ind < 0) ? val : val.substr(ind + 1);
                var uri = ctx.resolver.lookupNamespaceURI(prefix);
                var type = this.$$onResolveType(uri, name);
                this.$$onObjectStart(type);
                return true;
            }
            if (name === "Static") {
                var func = new Function("return (" + val + ");");
                this.$$onObjectStart(func());
                return true;
            }
            return true;
        }

        private $$parseKeyValue (ctx: IParseContext): boolean {
            var text = ctx.text;
            ctx.acc = "";
            var key = "";
            var val: any = undefined;
            for (; ctx.i < text.length; ctx.i++) {
                var cur = text[ctx.i];
                if (cur === "\\") {
                    ctx.i++;
                    ctx.acc += text[ctx.i];
                } else if (cur === "{") {
                    if (!key) {
                        ctx.error = "A sub extension must be set to a key.";
                        return false;
                    }
                    ctx.i++;
                    val = this.$$doParse(ctx);
                    if (ctx.error)
                        return false;
                } else if (cur === "=") {
                    key = ctx.acc;
                    this.$$onPropertyStart(key);
                    ctx.acc = "";
                } else if (cur === "}") {
                    this.$$finishKeyValue(ctx.acc, key, val);
                    return true;
                } else if (cur === ",") {
                    ctx.i++;
                    this.$$finishKeyValue(ctx.acc, key, val);
                    return true;
                } else {
                    ctx.acc += cur;
                }
            }
        }

        private $$finishKeyValue (acc: string, key: string, val: any) {
            if (val === undefined) {
                if (!(val = acc.trim()))
                    return;
                if (!key)
                    this.$$onPropertyStart(key = null);
                this.$$onObjectStart(val);
            }
            this.$$onPropertyEnd(key);
        }

        private $$ensure () {
            this.onResolveType(this.$$onResolveType)
                .onObjectResolve(this.$$onObjectResolve)
                .onObjectStart(this.$$onObjectStart)
                .onPropertyStart(this.$$onPropertyStart)
                .onPropertyEnd(this.$$onPropertyEnd)
                .onError(this.$$onError);
        }

        onResolveType (cb?: events.IResolveType): ExtensionParser {
            this.$$onResolveType = cb || ((xmlns, name) => Object);
            return this;
        }

        onObjectResolve (cb?: events.IObjectResolve): ExtensionParser {
            this.$$onObjectResolve = cb || ((type) => new type());
            return this;
        }

        onObjectStart (cb?: events.IObjectStart): ExtensionParser {
            this.$$onObjectStart = cb || ((obj) => {
            });
            return this;
        }

        onPropertyStart (cb?: events.IPropertyStart): ExtensionParser {
            this.$$onPropertyStart = cb || ((propName) => {
            });
            return this;
        }

        onPropertyEnd (cb?: events.IPropertyEnd): ExtensionParser {
            this.$$onPropertyEnd = cb || ((propName) => {
            });
            return this;
        }

        onError (cb?: events.IError): ExtensionParser {
            this.$$onError = cb || ((e) => true);
            return this;
        }

        onEnd (cb: () => any): ExtensionParser {
            this.$$onEnd = cb;
            return this;
        }

        private $$destroy () {
            this.$$onEnd && this.$$onEnd();
        }
    }
}