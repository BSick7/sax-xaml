var sax;
(function (sax) {
    (function (xaml) {
        xaml.version = '0.1.0';
    })(sax.xaml || (sax.xaml = {}));
    var xaml = sax.xaml;
})(sax || (sax = {}));
var sax;
(function (sax) {
    (function (xaml) {
        (function (extensions) {
            

            var ExtensionParser = (function () {
                function ExtensionParser() {
                    this.$$defaultXmlns = "http://schemas.wsick.com/fayde";
                    this.$$xXmlns = "http://schemas.wsick.com/fayde/x";
                    this.$$onEnd = null;
                }
                ExtensionParser.prototype.setNamespaces = function (defaultXmlns, xXmlns) {
                    this.$$defaultXmlns = defaultXmlns;
                    this.$$xXmlns = xXmlns;
                };

                ExtensionParser.prototype.parse = function (value, resolver, docCtx) {
                    this.$$ensure();
                    var ctx = {
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
                };

                ExtensionParser.prototype.$$doParse = function (ctx) {
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
                };

                ExtensionParser.prototype.$$parseName = function (ctx) {
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
                };

                ExtensionParser.prototype.$$startExtension = function (ctx) {
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
                };

                ExtensionParser.prototype.$$parseXExt = function (ctx, name, val) {
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
                };

                ExtensionParser.prototype.$$parseKeyValue = function (ctx) {
                    var text = ctx.text;
                    ctx.acc = "";
                    var key = "";
                    var val = undefined;
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
                };

                ExtensionParser.prototype.$$finishKeyValue = function (acc, key, val, docCtx) {
                    if (val === undefined) {
                        if (!(val = acc.trim()))
                            return;
                    }
                    if (!key) {
                        docCtx.curObject.init(val);
                    } else {
                        docCtx.curObject[key] = val;
                    }
                };

                ExtensionParser.prototype.$$ensure = function () {
                    this.onResolveType(this.$$onResolveType).onResolveObject(this.$$onResolveObject).onError(this.$$onError);
                };

                ExtensionParser.prototype.onResolveType = function (cb) {
                    this.$$onResolveType = cb || (function (xmlns, name) {
                        return Object;
                    });
                    return this;
                };

                ExtensionParser.prototype.onResolveObject = function (cb) {
                    this.$$onResolveObject = cb || (function (type) {
                        return new type();
                    });
                    return this;
                };

                ExtensionParser.prototype.onError = function (cb) {
                    this.$$onError = cb || (function (e) {
                    });
                    return this;
                };

                ExtensionParser.prototype.onEnd = function (cb) {
                    this.$$onEnd = cb;
                    return this;
                };

                ExtensionParser.prototype.$$destroy = function () {
                    this.$$onEnd && this.$$onEnd();
                };
                return ExtensionParser;
            })();
            extensions.ExtensionParser = ExtensionParser;
        })(xaml.extensions || (xaml.extensions = {}));
        var extensions = xaml.extensions;
    })(sax.xaml || (sax.xaml = {}));
    var xaml = sax.xaml;
})(sax || (sax = {}));
var sax;
(function (sax) {
    (function (xaml) {
        xaml.DEFAULT_XMLNS = "http://schemas.wsick.com/fayde";
        xaml.DEFAULT_XMLNS_X = "http://schemas.wsick.com/fayde/x";
        var ERROR_XMLNS = "http://www.w3.org/1999/xhtml";
        var ERROR_NAME = "parsererror";

        var Parser = (function () {
            function Parser() {
                this.$$onEnd = null;
                this.extension = this.createExtensionParser();
                this.setNamespaces(xaml.DEFAULT_XMLNS, xaml.DEFAULT_XMLNS_X);
            }
            Parser.prototype.setNamespaces = function (defaultXmlns, xXmlns) {
                this.$$defaultXmlns = defaultXmlns;
                this.$$xXmlns = xXmlns;
                this.extension.setNamespaces(defaultXmlns, xXmlns);
                return this;
            };

            Parser.prototype.createExtensionParser = function () {
                return new xaml.extensions.ExtensionParser();
            };

            Parser.prototype.createContext = function () {
                return {
                    curObject: undefined,
                    objectStack: []
                };
            };

            Parser.prototype.parse = function (el) {
                this.$$ensure();
                var ctx = this.createContext();
                this.$$handleElement(el, ctx, true);
                this.$$destroy();
                return this;
            };

            Parser.prototype.$$handleElement = function (el, ctx, isContent) {
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

                for (var i = 0, attrs = el.attributes, len = attrs.length; i < len; i++) {
                    this.$$handleAttribute(attrs[i], ctx);
                }

                var child = el.firstElementChild;
                var hasChildren = !!child;
                while (child) {
                    this.$$handleElement(child, ctx, true);
                    child = child.nextElementSibling;
                }

                if (!hasChildren) {
                    var text = el.textContent;
                    if (text)
                        this.$$onContentText(text.trim());
                }

                ctx.objectStack.pop();
                this.$$onObjectEnd(obj);
                ctx.curObject = ctx.objectStack[ctx.objectStack.length - 1];
            };

            Parser.prototype.$$tryHandleError = function (el, xmlns, name) {
                if (xmlns !== ERROR_XMLNS || name !== ERROR_NAME)
                    return false;
                this.$$onError(new Error(el.textContent));
                return true;
            };

            Parser.prototype.$$tryHandlePropertyTag = function (el, ctx, xmlns, name) {
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
            };

            Parser.prototype.$$handleAttribute = function (attr, ctx) {
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
            };

            Parser.prototype.$$getAttrValue = function (attr, ctx) {
                var val = attr.value;
                if (val[0] !== "{")
                    return val;
                return this.extension.parse(val, attr, ctx);
            };

            Parser.prototype.$$ensure = function () {
                this.onResolveType(this.$$onResolveType).onResolveObject(this.$$onResolveObject).onObject(this.$$onObject).onObjectEnd(this.$$onObjectEnd).onContentObject(this.$$onContentObject).onContentText(this.$$onContentText).onName(this.$$onName).onKey(this.$$onKey).onPropertyStart(this.$$onPropertyStart).onPropertyEnd(this.$$onPropertyEnd).onError(this.$$onError);
                this.extension.onResolveType(this.$$onResolveType).onResolveObject(this.$$onResolveObject);
            };

            Parser.prototype.onResolveType = function (cb) {
                this.$$onResolveType = cb || (function (xmlns, name) {
                    return Object;
                });
                return this;
            };

            Parser.prototype.onResolveObject = function (cb) {
                this.$$onResolveObject = cb || (function (type) {
                    return new type();
                });
                return this;
            };

            Parser.prototype.onObject = function (cb) {
                this.$$onObject = cb || (function (obj) {
                });
                return this;
            };

            Parser.prototype.onObjectEnd = function (cb) {
                this.$$onObjectEnd = cb || (function (obj) {
                });
                return this;
            };

            Parser.prototype.onContentObject = function (cb) {
                this.$$onContentObject = cb || (function (obj) {
                });
                return this;
            };

            Parser.prototype.onContentText = function (cb) {
                this.$$onContentText = cb || (function (text) {
                });
                return this;
            };

            Parser.prototype.onName = function (cb) {
                this.$$onName = cb || (function (name) {
                });
                return this;
            };

            Parser.prototype.onKey = function (cb) {
                this.$$onKey = cb || (function (key) {
                });
                return this;
            };

            Parser.prototype.onPropertyStart = function (cb) {
                this.$$onPropertyStart = cb || (function (ownerType, propName) {
                });
                return this;
            };

            Parser.prototype.onPropertyEnd = function (cb) {
                this.$$onPropertyEnd = cb || (function (ownerType, propName) {
                });
                return this;
            };

            Parser.prototype.onError = function (cb) {
                this.$$onError = cb || (function (e) {
                    return true;
                });
                return this;
            };

            Parser.prototype.onEnd = function (cb) {
                this.$$onEnd = cb;
                return this;
            };

            Parser.prototype.$$destroy = function () {
                this.$$onEnd && this.$$onEnd();
            };
            return Parser;
        })();
        xaml.Parser = Parser;
    })(sax.xaml || (sax.xaml = {}));
    var xaml = sax.xaml;
})(sax || (sax = {}));
//# sourceMappingURL=sax-xaml.js.map
