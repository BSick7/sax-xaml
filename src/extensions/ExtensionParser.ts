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
        export interface IResolveObject {
            (type: any): any;
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
    }
    export class ExtensionParser {
        private $$defaultXmlns = "http://schemas.wsick.com/fayde";
        private $$xXmlns = "http://schemas.wsick.com/fayde/x";

        private $$onResolveType: events.IResolveType;
        private $$onResolveObject: events.IResolveObject;
        private $$onError: events.IError;
        private $$onEnd: () => any = null;

        setNamespaces (defaultXmlns: string, xXmlns: string) {
            this.$$defaultXmlns = defaultXmlns;
            this.$$xXmlns = xXmlns;
        }

        parse (value: string, mctx: IMarkupContext): any {
            this.$$ensure();
            var ctx: IParseContext = {
                text: value,
                i: 1,
                acc: "",
                error: ""
            };
            var obj = this.$$doParse(ctx, mctx);
            if (ctx.error)
                this.$$onError(ctx.error);
            this.$$destroy();
            return obj;
        }

        private $$doParse (ctx: IParseContext, mctx: IMarkupContext): any {
            if (!this.$$parseName(ctx))
                return undefined;
            if (!this.$$startExtension(ctx, mctx))
                return undefined;

            while (ctx.i < ctx.text.length) {
                if (!this.$$parseKeyValue(ctx, mctx))
                    break;
                if (ctx.text[ctx.i] === "}") {
                    break;
                }
            }

            return mctx.endObject();
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

        private $$startExtension (ctx: IParseContext, mctx: IMarkupContext): boolean {
            var full = ctx.acc;
            var ind = full.indexOf(":");
            var prefix = (ind < 0) ? null : full.substr(0, ind);
            var name = (ind < 0) ? full : full.substr(ind + 1);
            var uri = mctx.resolvePrefixUri(prefix);

            if (uri === this.$$xXmlns) {
                var val = ctx.text.substr(ctx.i, ctx.text.length - ctx.i - 1);
                ctx.i = ctx.text.length;
                return this.$$parseXExt(ctx, mctx, name, val);
            }

            var type = this.$$onResolveType(uri, name);
            var obj = this.$$onResolveObject(type);
            mctx.startObject(obj);
            return true;
        }

        private $$parseXExt (ctx: IParseContext, mctx: IMarkupContext, name: string, val: string): boolean {
            if (name === "Null") {
                mctx.startObject(null);
                return true;
            }
            if (name === "Type") {
                var ind = val.indexOf(":");
                var prefix = (ind < 0) ? null : val.substr(0, ind);
                var name = (ind < 0) ? val : val.substr(ind + 1);
                var uri = mctx.resolvePrefixUri(prefix);
                var type = this.$$onResolveType(uri, name);
                mctx.startObject(type);
                return true;
            }
            if (name === "Static") {
                var func = new Function("return (" + val + ");");
                mctx.startObject(func());
                return true;
            }
            return true;
        }

        private $$parseKeyValue (ctx: IParseContext, mctx: IMarkupContext): boolean {
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
                    val = this.$$doParse(ctx, mctx);
                    if (ctx.error)
                        return false;
                } else if (cur === "=") {
                    key = ctx.acc;
                    ctx.acc = "";
                } else if (cur === "}") {
                    this.$$finishKeyValue(ctx.acc, mctx, key, val);
                    return true;
                } else if (cur === ",") {
                    ctx.i++;
                    this.$$finishKeyValue(ctx.acc, mctx, key, val);
                    return true;
                } else {
                    ctx.acc += cur;
                }
            }
        }

        private $$finishKeyValue (acc: string, mctx: IMarkupContext, key: string, val: any) {
            if (val === undefined) {
                if (!(val = acc.trim()))
                    return;
            }
            if (typeof val.transmute === "function") {
                val = (<IMarkupExtension>val).transmute(mctx);
            }
            var item = mctx.getCurrentItem();
            if (!key) {
                item.obj.init(val);
            } else {
                item.obj[key] = val;
            }
        }

        private $$ensure () {
            this.onResolveType(this.$$onResolveType)
                .onResolveObject(this.$$onResolveObject)
                .onError(this.$$onError);
        }

        onResolveType (cb?: events.IResolveType): ExtensionParser {
            this.$$onResolveType = cb || ((xmlns, name) => Object);
            return this;
        }

        onResolveObject (cb?: events.IResolveObject): ExtensionParser {
            this.$$onResolveObject = cb || ((type) => new type());
            return this;
        }

        onError (cb?: events.IError): ExtensionParser {
            this.$$onError = cb || ((e) => {
            });
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