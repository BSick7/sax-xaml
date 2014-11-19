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

    interface IParseContext<TDoc extends IDocumentContext> {
        text: string;
        i: number;
        acc: string;
        error: any;
        resolver: INamespacePrefixResolver;
        docCtx: TDoc;
    }
    export interface INamespacePrefixResolver {
        lookupNamespaceURI(prefix: string): string;
    }
    export class ExtensionParser<TDoc extends IDocumentContext> {
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

        parse (value: string, resolver: INamespacePrefixResolver, docCtx: TDoc): any {
            this.$$ensure();
            var ctx: IParseContext<TDoc> = {
                text: value,
                i: 1,
                acc: "",
                error: "",
                resolver: resolver,
                docCtx: docCtx
            };
            var obj = this.$$doParse(ctx);
            if (ctx.error)
                this.$$onError(ctx.error);
            this.$$destroy();
            return obj;
        }

        private $$doParse (ctx: IParseContext<TDoc>): any {
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

            var dc = ctx.docCtx;
            var obj = dc.objectStack.pop();
            dc.curObject = dc.objectStack[dc.objectStack.length - 1];
            return obj;
        }

        private $$parseName (ctx: IParseContext<TDoc>): boolean {
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

        private $$startExtension (ctx: IParseContext<TDoc>): boolean {
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
            var obj = ctx.docCtx.curObject = this.$$onResolveObject(type);
            ctx.docCtx.objectStack.push(obj);
            return true;
        }

        private $$parseXExt (ctx: IParseContext<TDoc>, name: string, val: string): boolean {
            if (name === "Null") {
                ctx.docCtx.objectStack.push(null);
                return true;
            }
            if (name === "Type") {
                var ind = val.indexOf(":");
                var prefix = (ind < 0) ? null : val.substr(0, ind);
                var name = (ind < 0) ? val : val.substr(ind + 1);
                var uri = ctx.resolver.lookupNamespaceURI(prefix);
                var type = this.$$onResolveType(uri, name);
                ctx.docCtx.objectStack.push(type);
                return true;
            }
            if (name === "Static") {
                var func = new Function("return (" + val + ");");
                ctx.docCtx.objectStack.push(func());
                return true;
            }
            return true;
        }

        private $$parseKeyValue (ctx: IParseContext<TDoc>): boolean {
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
                    ctx.acc = "";
                } else if (cur === "}") {
                    this.$$finishKeyValue(ctx.acc, key, val, ctx.docCtx);
                    return true;
                } else if (cur === ",") {
                    ctx.i++;
                    this.$$finishKeyValue(ctx.acc, key, val, ctx.docCtx);
                    return true;
                } else {
                    ctx.acc += cur;
                }
            }
        }

        private $$finishKeyValue (acc: string, key: string, val: any, docCtx: TDoc) {
            if (val === undefined) {
                if (!(val = acc.trim()))
                    return;
            }
            if (!key) {
                docCtx.curObject.init(val);
            } else {
                docCtx.curObject[key] = val;
            }
        }

        private $$ensure () {
            this.onResolveType(this.$$onResolveType)
                .onResolveObject(this.$$onResolveObject)
                .onError(this.$$onError);
        }

        onResolveType (cb?: events.IResolveType): ExtensionParser<TDoc> {
            this.$$onResolveType = cb || ((xmlns, name) => Object);
            return this;
        }

        onResolveObject (cb?: events.IResolveObject): ExtensionParser<TDoc> {
            this.$$onResolveObject = cb || ((type) => new type());
            return this;
        }

        onError (cb?: events.IError): ExtensionParser<TDoc> {
            this.$$onError = cb || ((e) => true);
            return this;
        }

        onEnd (cb: () => any): ExtensionParser<TDoc> {
            this.$$onEnd = cb;
            return this;
        }

        private $$destroy () {
            this.$$onEnd && this.$$onEnd();
        }
    }
}