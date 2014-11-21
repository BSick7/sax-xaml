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
        function createMarkupContext(os) {
            return {
                attr: null,
                resolvePrefixUri: function (prefix) {
                    return this.attr.lookupNamespaceURI(prefix);
                },
                startObject: function (obj) {
                    var item = {
                        type: null,
                        name: null,
                        prop: false,
                        obj: obj,
                        text: null
                    };
                    os.push(item);
                },
                endObject: function () {
                    return os.pop().obj;
                },
                getCurrentItem: function () {
                    return os[os.length - 1];
                },
                walkUpObjects: function () {
                    var i = os.length;
                    return {
                        current: undefined,
                        step: function () {
                            i--;
                            var item;
                            while ((item = os[i]) && item.prop) {
                                i--;
                            }
                            if (!item)
                                return false;
                            this.current = item.obj;
                            return true;
                        }
                    };
                }
            };
        }
        xaml.createMarkupContext = createMarkupContext;
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

        function findNext(curEl) {
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
                    next = next.parentElement;
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

            Parser.prototype.parse = function (el) {
                this.$$ensure();
                this.$$doParse(el);
                this.$$destroy();
                return this;
            };

            Parser.prototype.$$doParse = function (el) {
                var insideProp = false;
                var os = [];
                var mctx = xaml.createMarkupContext(os);

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
            };

            Parser.prototype.$$tryHandleError = function (el, xmlns, name) {
                if (xmlns !== ERROR_XMLNS || name !== ERROR_NAME)
                    return false;
                this.$$onError(new Error(el.textContent));
                return true;
            };

            Parser.prototype.$$tryStartProperty = function (uri, name) {
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
            };

            Parser.prototype.$$startObject = function (uri, name, isContent, text) {
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
                };
            };

            Parser.prototype.$$processAttr = function (attr, mctx) {
                var prefix = attr.prefix;
                var uri = attr.namespaceURI;
                var name = attr.localName;
                if (this.$$shouldSkipAttr(prefix, uri, name))
                    return true;
                var value = attr.value;
                mctx.attr = attr;
                return this.$$tryHandleXAttribute(uri, name, value) || this.$$tryHandleAttribute(uri, name, value, mctx);
            };

            Parser.prototype.$$shouldSkipAttr = function (prefix, uri, name) {
                if (prefix === "xmlns")
                    return true;
                return (!prefix && name === "xmlns");
            };

            Parser.prototype.$$tryHandleXAttribute = function (uri, name, value) {
                if (uri !== this.$$xXmlns)
                    return false;
                if (name === "Name")
                    this.$$onName(value);
                else if (name === "Key")
                    this.$$onName(value);
                return true;
            };

            Parser.prototype.$$tryHandleAttribute = function (uri, name, value, mctx) {
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

                ExtensionParser.prototype.parse = function (value, mctx) {
                    this.$$ensure();
                    var ctx = {
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
                };

                ExtensionParser.prototype.$$doParse = function (ctx, mctx) {
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

                ExtensionParser.prototype.$$startExtension = function (ctx, mctx) {
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
                };

                ExtensionParser.prototype.$$parseXExt = function (ctx, mctx, name, val) {
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
                };

                ExtensionParser.prototype.$$parseKeyValue = function (ctx, mctx) {
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
                };

                ExtensionParser.prototype.$$finishKeyValue = function (acc, mctx, key, val) {
                    if (val === undefined) {
                        if (!(val = acc.trim()))
                            return;
                    }
                    if (typeof val.transmute === "function") {
                        val = val.transmute(mctx);
                    }
                    var item = mctx.getCurrentItem();
                    if (!key) {
                        item.obj.init(val);
                    } else {
                        item.obj[key] = val;
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
//# sourceMappingURL=sax-xaml.js.map
