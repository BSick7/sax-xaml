var sax;
(function (sax) {
    (function (xaml) {
        xaml.Version = '0.1.0';
    })(sax.xaml || (sax.xaml = {}));
    var xaml = sax.xaml;
})(sax || (sax = {}));
var sax;
(function (sax) {
    (function (xaml) {
        xaml.DEFAULT_XMLNS = "http://schemas.wsick.com/fayde";
        xaml.DEFAULT_XMLNS_X = "http://schemas.wsick.com/fayde/x";

        var Parser = (function () {
            function Parser() {
                this.$$onEnd = null;
                this.$$immediateProp = false;
                this.$$lastText = null;
            }
            Object.defineProperty(Parser.prototype, "info", {
                get: function () {
                    var p = this.$$parser;
                    return {
                        line: p.line,
                        column: p.column,
                        position: p.position
                    };
                },
                enumerable: true,
                configurable: true
            });

            Parser.prototype.parse = function (xml) {
                var _this = this;
                this.$$ensure();

                var parser = this.$$parser = sax.parser(true, {
                    xmlns: true,
                    position: true
                });
                var objs = [];
                var tags = [];
                parser.onopentag = function (node) {
                    var tagName = node.local;
                    var ind = tagName.indexOf('.');
                    if (ind > -1) {
                        var type = _this.$$onResolveType(node.uri, tagName.substr(0, ind));
                        var name = tagName.substr(ind + 1);
                        tags.push({
                            prop: true,
                            type: type,
                            name: name
                        });
                        _this.$$onPropertyStart(type, name);
                        _this.$$immediateProp = true;
                    } else {
                        var type = _this.$$onResolveType(node.uri, tagName);
                        tags.push({
                            prop: false,
                            type: type,
                            name: tagName
                        });
                        _this.curObject = _this.$$onObjectResolve(type);
                        objs.push(_this.curObject);
                        if (_this.$$immediateProp)
                            _this.$$onObject(_this.curObject);
                        else
                            _this.$$onContentObject(_this.curObject);
                    }
                };
                parser.onclosetag = function (tagName) {
                    if (_this.$$lastText) {
                        _this.$$onContentText(_this.$$lastText);
                        _this.$$lastText = null;
                    }
                    var tag = tags.pop();
                    if (tag.prop) {
                        _this.$$immediateProp = false;
                        _this.$$onPropertyEnd(tag.type, tag.name);
                    } else {
                        var obj = objs.pop();
                        _this.curObject = objs[objs.length - 1];
                    }
                };
                parser.onattribute = function (attr) {
                    if (attr.prefix === "xmlns")
                        return;
                    var tagName = attr.local;
                    if (attr.uri === xaml.DEFAULT_XMLNS_X) {
                        if (tagName === "Name")
                            return _this.$$onName(attr.value);
                        if (tagName === "Key")
                            return _this.$$onKey(attr.value);
                    }
                    var ind = tagName.indexOf('.');
                    if (ind > -1) {
                        var type = _this.$$onResolveType(attr.uri, tagName.substr(0, ind));
                        var name = tagName.substr(ind + 1);
                        _this.$$onPropertyStart(type, name);
                        _this.$$onObject(attr.value);
                        _this.$$onPropertyEnd(type, name);
                    } else {
                        _this.$$onPropertyStart(null, tagName);
                        _this.$$onObject(attr.value);
                        _this.$$onPropertyEnd(null, tagName);
                    }
                };
                parser.ontext = function (text) {
                    _this.$$lastText = text;
                };
                parser.onerror = function (e) {
                    if (_this.$$onError(e))
                        parser.resume();
                };
                parser.onend = function () {
                    return _this.$$destroy();
                };
                parser.write(xml).close();
                return this;
            };

            Parser.prototype.$$ensure = function () {
                this.onResolveType(this.$$onResolveType).onObjectResolve(this.$$onObjectResolve).onObject(this.$$onObject).onContentObject(this.$$onContentObject).onContentText(this.$$onContentText).onName(this.$$onName).onKey(this.$$onKey).onPropertyStart(this.$$onPropertyStart).onPropertyEnd(this.$$onPropertyEnd).onError(this.$$onError);
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
                this.$$parser = null;
            };
            return Parser;
        })();
        xaml.Parser = Parser;
    })(sax.xaml || (sax.xaml = {}));
    var xaml = sax.xaml;
})(sax || (sax = {}));
//# sourceMappingURL=sax-xaml.js.map
