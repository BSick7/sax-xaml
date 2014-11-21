module sax.xaml.iterator {
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
    export interface IXamlSax {
        onResolveType?: events.IResolveType;
        onResolveObject?: events.IResolveObject;
        onObject?: events.IObject;
        onObjectEnd?: events.IObject;
        onContentObject?: events.IObject;
        onContentText?: events.IText;
        onName?: events.IName;
        onKey?: events.IKey;
        onPropertyStart?: events.IPropertyStart;
        onPropertyEnd?: events.IPropertyEnd;
        onError?: events.IError;
        onEnd?: () => any;
    }
    export function createListener (xsax: IXamlSax): IXamlSax {
        return {
            onResolveType: xsax.onResolveType || ((uri, name) => Object),
            onResolveObject: xsax.onResolveObject || ((type) => new (type)()),
            onObject: xsax.onObject || ((obj) => {
            }),
            onObjectEnd: xsax.onObjectEnd || ((obj) => {
            }),
            onContentObject: xsax.onContentObject || ((obj) => {
            }),
            onContentText: xsax.onContentText || ((text) => {
            }),
            onName: xsax.onName || ((name) => {
            }),
            onKey: xsax.onKey || ((key) => {
            }),
            onPropertyStart: xsax.onPropertyStart || ((ownerType, propName) => {
            }),
            onPropertyEnd: xsax.onPropertyEnd || ((ownerType, propName) => {
            }),
            onError: xsax.onError || ((e) => true),
            onEnd: xsax.onEnd || (() => {
            })
        };
    }

    export interface IOpts {
        XmlnsX: string;
    }

    interface IExtensionParse {
        (val: string, attr: Attr): any;
    }
    export function fullparse (el: Element, listener: IXamlSax, opts: IOpts, extensionParser: extensions.ExtensionParser) {
        var items: any[] = [];

        function parseExtension (val: string, attr: Attr): any {
            extensionParser.parse(val, attr, items);
        }

        parse(el, {
            onElementStart (el: Element) {
                var uri = el.namespaceURI;
                var name = el.localName;
                var ind = name.indexOf('.');
                var type;
                if (ind > -1) {
                    type = listener.onResolveType(uri, name.substr(0, ind));
                    name = name.substr(ind + 1);
                    items.push({$$prop$$: true, type: type, name: name});
                    listener.onPropertyStart(type, name);
                } else {
                    type = listener.onResolveType(uri, name);
                    var obj = listener.onResolveObject(type);
                    var prev = items[items.length - 1];
                    items.push(obj);
                    (!prev || prev.$$prop$$)
                        ? listener.onContentObject(obj)
                        : listener.onObject(obj);
                }
            },
            onElementEnd (el: Element) {
                var item = items.pop();
                if (item.$$prop$$) {
                    listener.onPropertyEnd(item.type, item.name);
                } else {
                    //TODO: Content Text
                    listener.onObjectEnd(item);
                }
            },
            onAttribute (attr: Attr) {
                var prefix = attr.prefix;
                var name = attr.localName;
                if (skipNsAttr(prefix, name))
                    return;
                var uri = attr.namespaceURI;
                var value = attr.value;
                if (uri === opts.XmlnsX) {
                    handleXAttr(uri, name, value, listener);
                } else {
                    handleAttr(uri, name, value, attr, parseExtension, listener);
                }
            }
        });
        listener.onEnd();
    }

    function skipNsAttr (prefix: string, name: string): boolean {
        if (prefix === "xmlns")
            return true;
        return (!prefix && name === "xmlns");
    }

    function handleXAttr (uri: string, name: string, value: string, listener: IXamlSax) {
        //  ... x:Name="..."
        //  ... x:Key="..."
        if (name === "Name")
            listener.onName(value);
        if (name === "Key")
            listener.onKey(value);
    }

    function handleAttr (uri: string, name: string, value: string, attr: Attr, eparse: IExtensionParse, listener: IXamlSax) {
        //  ... [ns:]Type.Name="..."
        //  ... Name="..."

        var type = null;
        var name = name;
        var ind = name.indexOf('.');
        if (ind > -1) {
            type = listener.onResolveType(uri, name.substr(0, ind));
            name = name.substr(ind + 1);
        }
        listener.onPropertyStart(type, name);
        var val = getAttrValue(value, attr, eparse);
        listener.onObject(val);
        listener.onObjectEnd(val);
        listener.onPropertyEnd(type, name);
    }

    function getAttrValue (val: string, attr: Attr, eparse: IExtensionParse): any {
        if (val[0] !== "{")
            return val;
        return eparse(val, attr);
    }
}