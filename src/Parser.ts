module sax.xaml {
    export var DEFAULT_XMLNS = "http://schemas.wsick.com/fayde";
    export var DEFAULT_XMLNS_X = "http://schemas.wsick.com/fayde/x";
    var ERROR_XMLNS = "http://www.w3.org/1999/xhtml";
    var ERROR_NAME = "parsererror";

    export module events {
        export interface IResolveType {
            (xmlns: string, name: string): any;
        }
        export interface IResolveObject {
            (type: any): any;
        }
        export interface IObject {
            (obj: any);
        }
        export interface IText {
            (text: string);
        }
        export interface IName {
            (name: string);
        }
        export interface IKey {
            (key: string);
        }
        export interface IPropertyStart {
            (ownerType: any, propName: string);
        }
        export interface IPropertyEnd {
            (ownerType: any, propName: string);
        }
        export interface IError {
            (e: Error): boolean;
        }
    }

    export interface IDocumentContext {
        curObject: any;
        objectStack: any[];
    }

    export class Parser<T extends IDocumentContext> {
        private $$onResolveType: events.IResolveType;
        private $$onResolveObject: events.IResolveObject;
        private $$onObject: events.IObject;
        private $$onObjectEnd: events.IObject;
        private $$onContentObject: events.IObject;
        private $$onContentText: events.IText;
        private $$onName: events.IName;
        private $$onKey: events.IKey;
        private $$onPropertyStart: events.IPropertyStart;
        private $$onPropertyEnd: events.IPropertyEnd;
        private $$onError: events.IError;
        private $$onEnd: () => any = null;

        extension: extensions.ExtensionParser<T>;

        private $$defaultXmlns: string;
        private $$xXmlns: string;

        constructor () {
            this.extension = this.createExtensionParser();
            this.setNamespaces(DEFAULT_XMLNS, DEFAULT_XMLNS_X);
        }

        setNamespaces (defaultXmlns: string, xXmlns: string): Parser<T> {
            this.$$defaultXmlns = defaultXmlns;
            this.$$xXmlns = xXmlns;
            this.extension.setNamespaces(defaultXmlns, xXmlns);
            return this;
        }

        createExtensionParser (): extensions.ExtensionParser<T> {
            return new extensions.ExtensionParser<T>();
        }

        createContext (): T {
            return <T>{
                curObject: undefined,
                objectStack: []
            };
        }

        parse (el: Element): Parser<T> {
            this.$$ensure();
            var ctx = this.createContext();
            this.$$handleElement(el, ctx, true);
            this.$$destroy();
            return this;
        }

        private $$handleElement (el: Element, ctx: T, isContent: boolean) {
            // NOTE: Handle tag open
            //  <[ns:]Type.Name>
            //  <[ns:]Type>
            var name = el.localName;
            var xmlns = el.namespaceURI;
            if (this.$$tryHandleError(el, xmlns, name))
                return;
            if (this.$$tryHandlePropertyTag(el, ctx, xmlns, name))
                return;

            var type = this.$$onResolveType(xmlns, name);
            var obj = ctx.curObject = this.$$onResolveObject(type);
            ctx.objectStack.push(obj);

            if (isContent) {
                this.$$onContentObject(obj);
            } else {
                this.$$onObject(obj);
            }

            // NOTE: Walk attributes
            for (var i = 0, attrs = el.attributes, len = attrs.length; i < len; i++) {
                this.$$handleAttribute(attrs[i], ctx);
            }

            // NOTE: Walk Children
            var child = el.firstElementChild;
            var hasChildren = !!child;
            while (child) {
                this.$$handleElement(child, ctx, true);
                child = child.nextElementSibling;
            }

            // NOTE: If we did not hit a child tag, use text content
            if (!hasChildren) {
                var text = el.textContent;
                if (text)
                    this.$$onContentText(text.trim());
            }

            // NOTE: Handle tag close
            //  </[ns:]Type.Name>
            //  </[ns:]Type>
            ctx.objectStack.pop();
            this.$$onObjectEnd(obj);
            ctx.curObject = ctx.objectStack[ctx.objectStack.length - 1];
        }

        private $$tryHandleError (el: Element, xmlns: string, name: string): boolean {
            if (xmlns !== ERROR_XMLNS || name !== ERROR_NAME)
                return false;
            this.$$onError(new Error(el.textContent));
            return true;
        }

        private $$tryHandlePropertyTag (el: Element, ctx: T, xmlns: string, name: string): boolean {
            var ind = name.indexOf('.');
            if (ind < 0)
                return false;

            var type = this.$$onResolveType(xmlns, name.substr(0, ind));
            name = name.substr(ind + 1);

            this.$$onPropertyStart(type, name);

            var child = el.firstElementChild;
            while (child) {
                this.$$handleElement(child, ctx, false);
                child = child.nextElementSibling;
            }

            this.$$onPropertyEnd(type, name);

            return true;
        }

        private $$handleAttribute (attr: Attr, ctx: T) {
            // NOTE:
            //  ... [ns:]Type.Name="..."
            //  ... x:Name="..."
            //  ... x:Key="..."
            //  ... Name="..."
            if (attr.prefix === "xmlns")
                return;
            var name = attr.localName;
            if (!attr.prefix && name === "xmlns")
                return;
            var xmlns = attr.namespaceURI;
            if (xmlns === this.$$xXmlns) {
                if (name === "Name")
                    return this.$$onName(this.$$getAttrValue(attr, ctx));
                if (name === "Key")
                    return this.$$onKey(this.$$getAttrValue(attr, ctx));
            }
            var type = null;
            var name = name;
            var ind = name.indexOf('.');
            if (ind > -1) {
                type = this.$$onResolveType(xmlns, name.substr(0, ind));
                name = name.substr(ind + 1);
            }
            this.$$onPropertyStart(type, name);
            var val = this.$$getAttrValue(attr, ctx);
            this.$$onObject(val);
            this.$$onObjectEnd(val);
            this.$$onPropertyEnd(type, name);
        }

        private $$getAttrValue (attr: Attr, ctx: T): any {
            var val = attr.value;
            if (val[0] !== "{")
                return val;
            return this.extension.parse(val, attr, ctx);
        }

        private $$ensure () {
            this.onResolveType(this.$$onResolveType)
                .onResolveObject(this.$$onResolveObject)
                .onObject(this.$$onObject)
                .onObjectEnd(this.$$onObjectEnd)
                .onContentObject(this.$$onContentObject)
                .onContentText(this.$$onContentText)
                .onName(this.$$onName)
                .onKey(this.$$onKey)
                .onPropertyStart(this.$$onPropertyStart)
                .onPropertyEnd(this.$$onPropertyEnd)
                .onError(this.$$onError);
            this.extension
                .onResolveType(this.$$onResolveType)
                .onResolveObject(this.$$onResolveObject);
        }

        onResolveType (cb?: events.IResolveType): Parser<T> {
            this.$$onResolveType = cb || ((xmlns, name) => Object);
            return this;
        }

        onResolveObject (cb?: events.IResolveObject): Parser<T> {
            this.$$onResolveObject = cb || ((type) => new type());
            return this;
        }

        onObject (cb?: events.IObject): Parser<T> {
            this.$$onObject = cb || ((obj) => {
            });
            return this;
        }

        onObjectEnd (cb?: events.IObject): Parser<T> {
            this.$$onObjectEnd = cb || ((obj) => {
            });
            return this;
        }

        onContentObject (cb?: events.IObject): Parser<T> {
            this.$$onContentObject = cb || ((obj) => {
            });
            return this;
        }

        onContentText (cb?: events.IObject): Parser<T> {
            this.$$onContentText = cb || ((text) => {
            });
            return this;
        }

        onName (cb?: events.IName): Parser<T> {
            this.$$onName = cb || ((name) => {
            });
            return this;
        }

        onKey (cb?: events.IKey): Parser<T> {
            this.$$onKey = cb || ((key) => {
            });
            return this;
        }

        onPropertyStart (cb?: events.IPropertyStart): Parser<T> {
            this.$$onPropertyStart = cb || ((ownerType, propName) => {
            });
            return this;
        }

        onPropertyEnd (cb?: events.IPropertyEnd): Parser<T> {
            this.$$onPropertyEnd = cb || ((ownerType, propName) => {
            });
            return this;
        }

        onError (cb?: events.IError): Parser<T> {
            this.$$onError = cb || ((e) => true);
            return this;
        }

        onEnd (cb: () => any): Parser<T> {
            this.$$onEnd = cb;
            return this;
        }

        private $$destroy () {
            this.$$onEnd && this.$$onEnd();
        }
    }
}