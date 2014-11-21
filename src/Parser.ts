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

    interface INextElement {
        count: number;
        next: Element;
    }
    function findNext (curEl: Element): INextElement {
        var count = 0;
        var next = curEl.firstElementChild;
        if (next) {
            return {
                count: count,
                next: next
            };
        } else {
            next = curEl;
            while (!next.nextElementSibling) {
                next = (<any>next).parentElement;
                if (!next)
                    break;
                count++;
            }
            count++;
            return {
                count: count,
                next: next ? next.nextElementSibling : null
            };
        }
    }

    export class Parser {
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

        extension: extensions.ExtensionParser;

        private $$defaultXmlns: string;
        private $$xXmlns: string;

        constructor () {
            this.extension = this.createExtensionParser();
            this.setNamespaces(DEFAULT_XMLNS, DEFAULT_XMLNS_X);
        }

        setNamespaces (defaultXmlns: string, xXmlns: string): Parser {
            this.$$defaultXmlns = defaultXmlns;
            this.$$xXmlns = xXmlns;
            this.extension.setNamespaces(defaultXmlns, xXmlns);
            return this;
        }

        createExtensionParser (): extensions.ExtensionParser {
            return new extensions.ExtensionParser();
        }

        parse (el: Element): Parser {
            this.$$ensure();
            this.$$doParse(el);
            this.$$destroy();
            return this;
        }

        private $$doParse (el: Element) {
            var insideProp = false;
            var os: IObjectStackItem[] = [];
            var mctx = createMarkupContext(os);

            var cur = el;
            while (cur) {
                var uri = cur.namespaceURI;
                var name = cur.localName;
                if (this.$$tryHandleError(cur, uri, name))
                    break;
                var x = this.$$tryStartProperty(uri, name);
                if (x.prop) {
                    os.push(x);
                    insideProp = true;
                } else {
                    if (!insideProp && os.length > 0)
                        os[os.length - 1].text = null;
                    os.push(this.$$startObject(uri, name, !insideProp, cur.textContent));
                    insideProp = false;

                    for (var i = 0, attrs = cur.attributes; i < attrs.length; i++) {
                        this.$$processAttr(attrs[i], mctx);
                    }
                }

                var y = findNext(cur);
                cur = y.next;
                for (var i = y.count; i > 0; i--) {
                    var item = os.pop();
                    insideProp = item.prop;
                    if (insideProp) {
                        this.$$onPropertyEnd(item.type, item.name);
                    } else {
                        var text = item.text;
                        if (text && (text = text.trim()))
                            this.$$onContentText(text);
                        this.$$onObjectEnd(item.obj);
                    }
                }
            }
        }

        private $$tryHandleError (el: Element, xmlns: string, name: string): boolean {
            if (xmlns !== ERROR_XMLNS || name !== ERROR_NAME)
                return false;
            this.$$onError(new Error(el.textContent));
            return true;
        }

        private $$tryStartProperty (uri: string, name: string): IObjectStackItem {
            var ind = name.indexOf('.');
            if (ind < 0) {
                return {
                    prop: false,
                    type: null,
                    name: name,
                    obj: null,
                    text: null
                };
            }

            var type = this.$$onResolveType(uri, name.substr(0, ind));
            name = name.substr(ind + 1);

            this.$$onPropertyStart(type, name);
            return {
                prop: true,
                type: type,
                name: name,
                obj: null,
                text: null
            };
        }

        private $$startObject (uri: string, name: string, isContent: boolean, text: string): IObjectStackItem {
            var type = this.$$onResolveType(uri, name);
            var obj = this.$$onResolveObject(type);
            if (isContent) {
                this.$$onContentObject(obj);
            } else {
                this.$$onObject(obj);
            }
            return {
                type: type,
                name: name,
                prop: false,
                obj: obj,
                text: text
            }
        }

        private $$processAttr (attr: Attr, mctx: IMarkupContext): boolean {
            var prefix = attr.prefix;
            var uri = attr.namespaceURI;
            var name = attr.localName;
            if (this.$$shouldSkipAttr(prefix, uri, name))
                return true;
            var value = attr.value;
            mctx.attr = attr;
            return this.$$tryHandleXAttribute(uri, name, value)
                || this.$$tryHandleAttribute(uri, name, value, mctx);
        }

        private $$shouldSkipAttr (prefix: string, uri: string, name: string): boolean {
            if (prefix === "xmlns")
                return true;
            return (!prefix && name === "xmlns");
        }

        private $$tryHandleXAttribute (uri: string, name: string, value: string): boolean {
            //  ... x:Name="..."
            //  ... x:Key="..."
            if (uri !== this.$$xXmlns)
                return false;
            if (name === "Name")
                this.$$onName(value);
            else if (name === "Key")
                this.$$onName(value);
            return true;
        }

        private $$tryHandleAttribute (uri: string, name: string, value: string, mctx: IMarkupContext): boolean {
            // NOTE:
            //  ... [ns:]Type.Name="..."
            //  ... Name="..."
            var type = null;
            var ind = name.indexOf('.');
            if (ind > -1) {
                type = this.$$onResolveType(uri, name.substr(0, ind));
                name = name.substr(ind + 1);
            }
            this.$$onPropertyStart(type, name);
            if (value[0] === "{") {
                value = this.extension.parse(value, mctx);
            }
            this.$$onObject(value);
            this.$$onObjectEnd(value);
            this.$$onPropertyEnd(type, name);
            return true;
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

        onResolveType (cb?: events.IResolveType): Parser {
            this.$$onResolveType = cb || ((xmlns, name) => Object);
            return this;
        }

        onResolveObject (cb?: events.IResolveObject): Parser {
            this.$$onResolveObject = cb || ((type) => new type());
            return this;
        }

        onObject (cb?: events.IObject): Parser {
            this.$$onObject = cb || ((obj) => {
            });
            return this;
        }

        onObjectEnd (cb?: events.IObject): Parser {
            this.$$onObjectEnd = cb || ((obj) => {
            });
            return this;
        }

        onContentObject (cb?: events.IObject): Parser {
            this.$$onContentObject = cb || ((obj) => {
            });
            return this;
        }

        onContentText (cb?: events.IObject): Parser {
            this.$$onContentText = cb || ((text) => {
            });
            return this;
        }

        onName (cb?: events.IName): Parser {
            this.$$onName = cb || ((name) => {
            });
            return this;
        }

        onKey (cb?: events.IKey): Parser {
            this.$$onKey = cb || ((key) => {
            });
            return this;
        }

        onPropertyStart (cb?: events.IPropertyStart): Parser {
            this.$$onPropertyStart = cb || ((ownerType, propName) => {
            });
            return this;
        }

        onPropertyEnd (cb?: events.IPropertyEnd): Parser {
            this.$$onPropertyEnd = cb || ((ownerType, propName) => {
            });
            return this;
        }

        onError (cb?: events.IError): Parser {
            this.$$onError = cb || ((e) => true);
            return this;
        }

        onEnd (cb: () => any): Parser {
            this.$$onEnd = cb;
            return this;
        }

        private $$destroy () {
            this.$$onEnd && this.$$onEnd();
        }
    }
}