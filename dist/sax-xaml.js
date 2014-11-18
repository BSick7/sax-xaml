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
        xaml.DEFAULT_XMLNS = "http://schemas.wsick.com/fayde";
        xaml.DEFAULT_XMLNS_X = "http://schemas.wsick.com/fayde/x";
        var ERROR_XMLNS = "http://www.w3.org/1999/xhtml";
        var ERROR_NAME = "parsererror";
        var NS_XMLNS = "";

        var Parser = (function () {
            function Parser() {
                this.$$onEnd = null;
                this.$$objs = [];
            }
            Parser.prototype.parse = function (el) {
                this.$$ensure();
                this.$$handleElement(el, true);
                this.$$destroy();
                return this;
            };

            Parser.prototype.$$handleElement = function (el, isContent) {
                var name = el.localName;
                var xmlns = el.namespaceURI;
                if (this.$$tryHandleError(el, xmlns, name))
                    return;
                if (this.$$tryHandlePropertyTag(el, xmlns, name))
                    return;

                var type = this.$$onResolveType(xmlns, name);
                var obj = this.curObject = this.$$onObjectResolve(type);
                this.$$objs.push(obj);

                if (isContent) {
                    this.$$onContentObject(obj);
                } else {
                    this.$$onObject(obj);
                }

                for (var i = 0, attrs = el.attributes, len = attrs.length; i < len; i++) {
                    this.$$handleAttribute(attrs[i]);
                }

                var child = el.firstElementChild;
                var hasChildren = !!child;
                while (child) {
                    this.$$handleElement(child, true);
                    child = child.nextElementSibling;
                }

                if (!hasChildren) {
                    var text = el.textContent;
                    if (text)
                        this.$$onContentText(text.trim());
                }

                this.$$objs.pop();
                this.$$onObjectEnd(obj);
                this.curObject = this.$$objs[this.$$objs.length - 1];
            };

            Parser.prototype.$$tryHandleError = function (el, xmlns, name) {
                if (xmlns !== ERROR_XMLNS || name !== ERROR_NAME)
                    return false;
                this.$$onError(new Error(el.textContent));
                return true;
            };

            Parser.prototype.$$tryHandlePropertyTag = function (el, xmlns, name) {
                var ind = name.indexOf('.');
                if (ind < 0)
                    return false;

                var type = this.$$onResolveType(xmlns, name.substr(0, ind));
                name = name.substr(ind + 1);

                this.$$onPropertyStart(type, name);

                var child = el.firstElementChild;
                while (child) {
                    this.$$handleElement(child, false);
                    child = child.nextElementSibling;
                }

                this.$$onPropertyEnd(type, name);

                return true;
            };

            Parser.prototype.$$handleAttribute = function (attr) {
                if (attr.prefix === "xmlns")
                    return;
                var name = attr.localName;
                if (!attr.prefix && name === "xmlns")
                    return;
                var xmlns = attr.namespaceURI;
                if (xmlns === xaml.DEFAULT_XMLNS_X) {
                    if (name === "Name")
                        return this.$$onName(attr.value);
                    if (name === "Key")
                        return this.$$onKey(attr.value);
                }
                var type = null;
                var name = name;
                var ind = name.indexOf('.');
                if (ind > -1) {
                    type = this.$$onResolveType(xmlns, name.substr(0, ind));
                    name = name.substr(ind + 1);
                }
                this.$$onPropertyStart(type, name);
                this.$$onObject(attr.value);
                this.$$onObjectEnd(attr.value);
                this.$$onPropertyEnd(type, name);
            };

            Parser.prototype.$$ensure = function () {
                this.onResolveType(this.$$onResolveType).onObjectResolve(this.$$onObjectResolve).onObject(this.$$onObject).onObjectEnd(this.$$onObjectEnd).onContentObject(this.$$onContentObject).onContentText(this.$$onContentText).onName(this.$$onName).onKey(this.$$onKey).onPropertyStart(this.$$onPropertyStart).onPropertyEnd(this.$$onPropertyEnd).onError(this.$$onError);
            };

            Parser.prototype.onResolveType = function (cb) {
                this.$$onResolveType = cb || (function (xmlns, name) {
                    return Object;
                });
                return this;
            };

            Parser.prototype.onObjectResolve = function (cb) {
                this.$$onObjectResolve = cb || (function (type) {
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
