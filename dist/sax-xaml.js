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

        var Parser = (function () {
            function Parser() {
                this.$$onEnd = null;
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
                var immediateProp = false;
                var curTag;
                parser.onopentag = function (node) {
                    var tagName = node.local;
                    var ind = tagName.indexOf('.');
                    if (ind > -1) {
                        var type = _this.$$onResolveType(node.uri, tagName.substr(0, ind));
                        var name = tagName.substr(ind + 1);
                        tags.push(curTag = {
                            prop: true,
                            type: type,
                            name: name,
                            ignoreText: false,
                            lastText: null
                        });
                        _this.$$onPropertyStart(type, name);
                        immediateProp = true;
                    } else {
                        if (!immediateProp && curTag)
                            curTag.ignoreText = true;

                        var type = _this.$$onResolveType(node.uri, tagName);
                        tags.push(curTag = {
                            prop: false,
                            type: type,
                            name: tagName,
                            ignoreText: false,
                            lastText: null
                        });
                        _this.curObject = _this.$$onObjectResolve(type);
                        objs.push(_this.curObject);
                        if (immediateProp) {
                            _this.$$onObject(_this.curObject);
                        } else {
                            _this.$$onContentObject(_this.curObject);
                        }
                    }
                };
                parser.onclosetag = function (tagName) {
                    if (curTag.lastText && !curTag.ignoreText) {
                        _this.$$onContentText(curTag.lastText);
                    }
                    var tag = tags.pop();
                    if (tag.prop) {
                        immediateProp = false;
                        _this.$$onPropertyEnd(tag.type, tag.name);
                    } else {
                        var obj = objs.pop();
                        _this.$$onObjectEnd(obj);
                        _this.curObject = objs[objs.length - 1];
                    }
                    curTag = tags[tags.length - 1];
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
                    var type = null;
                    var name = tagName;
                    var ind = tagName.indexOf('.');
                    if (ind > -1) {
                        type = _this.$$onResolveType(attr.uri, name.substr(0, ind));
                        name = name.substr(ind + 1);
                    }
                    _this.$$onPropertyStart(type, name);
                    _this.$$onObject(attr.value);
                    _this.$$onObjectEnd(attr.value);
                    _this.$$onPropertyEnd(type, name);
                };
                parser.ontext = function (text) {
                    if (curTag)
                        curTag.lastText = text;
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
                this.$$parser = null;
            };
            return Parser;
        })();
        xaml.Parser = Parser;
    })(sax.xaml || (sax.xaml = {}));
    var xaml = sax.xaml;
})(sax || (sax = {}));
//# sourceMappingURL=sax-xaml.js.map
