module sax.xaml {
    export var DEFAULT_XMLNS = "http://schemas.wsick.com/fayde";
    export var DEFAULT_XMLNS_X = "http://schemas.wsick.com/fayde/x";

    export module events {
        export interface IResolveType {
            (xmlns: string, name: string): any;
        }
        export interface IObjectResolve {
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

    export interface IParseInfo {
        line: number;
        column: number;
        position: number;
    }

    interface ITag {
        prop: boolean;
        type: any;
        name: string;
        ignoreText: boolean;
        lastText: string;
    }

    export class Parser {
        private $$parser: sax.SAXParser;

        curObject: any;

        private $$onResolveType: events.IResolveType;
        private $$onObjectResolve: events.IObjectResolve;
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

        get info (): IParseInfo {
            var p = this.$$parser;
            return {
                line: p.line,
                column: p.column,
                position: p.position
            };
        }

        parse (xml: string): Parser {
            this.$$ensure();

            var parser = this.$$parser = sax.parser(true, {
                xmlns: true,
                position: true
            });
            var objs = [];
            var tags: ITag[] = [];
            var immediateProp = false;
            var curTag: ITag;
            parser.onopentag = (node: sax.INode) => {
                // NOTE:
                //  <[ns:]Type.Name>
                //  <[ns:]Type>
                var tagName = node.local;
                var ind = tagName.indexOf('.');
                if (ind > -1) {
                    var type = this.$$onResolveType(node.uri, tagName.substr(0, ind));
                    var name = tagName.substr(ind + 1);
                    tags.push(curTag = {
                        prop: true,
                        type: type,
                        name: name,
                        ignoreText: false,
                        lastText: null
                    });
                    this.$$onPropertyStart(type, name);
                    immediateProp = true;
                } else {
                    if (!immediateProp && curTag)
                        curTag.ignoreText = true;

                    var type = this.$$onResolveType(node.uri, tagName);
                    tags.push(curTag = {
                        prop: false,
                        type: type,
                        name: tagName,
                        ignoreText: false,
                        lastText: null
                    });
                    this.curObject = this.$$onObjectResolve(type);
                    objs.push(this.curObject);
                    if (immediateProp) {
                        this.$$onObject(this.curObject);
                    } else {
                        this.$$onContentObject(this.curObject);
                    }
                }
            };
            parser.onclosetag = (tagName: string) => {
                // NOTE:
                //  </[ns:]Type.Name>
                //  </[ns:]Type>
                if (curTag.lastText && !curTag.ignoreText) {
                    this.$$onContentText(curTag.lastText);
                }
                var tag = tags.pop();
                if (tag.prop) {
                    immediateProp = false;
                    this.$$onPropertyEnd(tag.type, tag.name);
                } else {
                    var obj = objs.pop();
                    this.$$onObjectEnd(obj);
                    this.curObject = objs[objs.length - 1];
                }
                curTag = tags[tags.length - 1];
            };
            parser.onattribute = (attr: sax.IAttribute) => {
                // NOTE:
                //  ... [ns:]Type.Name="..."
                //  ... x:Name="..."
                //  ... x:Key="..."
                //  ... Name="..."
                if (attr.prefix === "xmlns")
                    return;
                var tagName = attr.local;
                if (attr.uri === DEFAULT_XMLNS_X) {
                    if (tagName === "Name")
                        return this.$$onName(attr.value);
                    if (tagName === "Key")
                        return this.$$onKey(attr.value);
                }
                var type = null;
                var name = tagName;
                var ind = tagName.indexOf('.');
                if (ind > -1) {
                    type = this.$$onResolveType(attr.uri, name.substr(0, ind));
                    name = name.substr(ind + 1);
                }
                this.$$onPropertyStart(type, name);
                this.$$onObject(attr.value);
                this.$$onObjectEnd(attr.value);
                this.$$onPropertyEnd(type, name);
            };
            parser.ontext = (text) => {
                if (curTag)
                    curTag.lastText = text;
            };
            parser.onerror = (e) => {
                if (this.$$onError(e))
                    parser.resume();
            };
            parser.onend = () => this.$$destroy();
            parser.write(xml).close();
            return this;
        }

        private $$ensure () {
            this.onResolveType(this.$$onResolveType)
                .onObjectResolve(this.$$onObjectResolve)
                .onObject(this.$$onObject)
                .onObjectEnd(this.$$onObjectEnd)
                .onContentObject(this.$$onContentObject)
                .onContentText(this.$$onContentText)
                .onName(this.$$onName)
                .onKey(this.$$onKey)
                .onPropertyStart(this.$$onPropertyStart)
                .onPropertyEnd(this.$$onPropertyEnd)
                .onError(this.$$onError);
        }

        onResolveType (cb?: events.IResolveType): Parser {
            this.$$onResolveType = cb || ((xmlns, name) => Object);
            return this;
        }

        onObjectResolve (cb?: events.IObjectResolve): Parser {
            this.$$onObjectResolve = cb || ((type) => new type());
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
            this.$$parser = null;
        }
    }
}