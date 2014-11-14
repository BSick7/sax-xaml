var saxxaml;
(function (saxxaml) {
    saxxaml.Version = '0.1.0';
})(saxxaml || (saxxaml = {}));
var saxxaml;
(function (saxxaml) {
    saxxaml.DEFAULT_XMLNS = "http://schemas.wsick.com/fayde";
    saxxaml.DEFAULT_XMLNS_X = "http://schemas.wsick.com/fayde/x";

    var Parser = (function () {
        function Parser() {
            this.$$immediateProp = false;
            this.$$lastText = null;
        }
        Parser.prototype.listen = function (onResolveType, onObjectResolve, onObject, onContentObject, onName, onKey, onPropertyStart, onPropertyEnd) {
            this.onResolveType = onResolveType;
            this.onObjectResolve = onObjectResolve;
            this.onObject = onObject;
            this.onContentObject = onContentObject;
            this.onName = onName;
            this.onKey = onKey;
            this.onPropertyStart = onPropertyStart;
            this.onPropertyEnd = onPropertyEnd;
        };

        Parser.prototype.parse = function (xml) {
            var _this = this;
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
                    var type = _this.onResolveType(node.uri, tagName.substr(0, ind));
                    var name = tagName.substr(ind + 1);
                    tags.push({
                        prop: true,
                        type: type,
                        name: name
                    });
                    _this.onPropertyStart(type, name);
                    _this.$$immediateProp = true;
                } else {
                    var type = _this.onResolveType(node.uri, tagName);
                    tags.push({
                        prop: false,
                        type: type,
                        name: tagName
                    });
                    _this.curObject = _this.onObjectResolve(type);
                    objs.push(_this.curObject);
                    if (_this.$$immediateProp)
                        _this.onObject(_this.curObject);
                    else
                        _this.onContentObject(_this.curObject);
                }
            };
            parser.onclosetag = function (tagName) {
                if (_this.$$lastText) {
                    _this.onContentObject(_this.$$lastText);
                    _this.$$lastText = null;
                }
                var tag = tags.pop();
                if (tag.prop) {
                    _this.$$immediateProp = false;
                    _this.onPropertyEnd(tag.type, tag.name);
                } else {
                    var obj = objs.pop();
                    _this.curObject = objs[objs.length - 1];
                }
            };
            parser.onattribute = function (attr) {
                if (attr.prefix === "xmlns")
                    return;
                var tagName = attr.local;
                if (attr.uri === saxxaml.DEFAULT_XMLNS_X) {
                    if (tagName === "Name")
                        return _this.onName(attr.value);
                    if (tagName === "Key")
                        return _this.onKey(attr.value);
                }
                var ind = tagName.indexOf('.');
                if (ind > -1) {
                    var type = _this.onResolveType(attr.uri, tagName.substr(0, ind));
                    var name = tagName.substr(ind + 1);
                    _this.onPropertyStart(type, name);
                    _this.onObject(attr.value);
                    _this.onPropertyEnd(type, name);
                } else {
                    _this.onPropertyStart(null, tagName);
                    _this.onObject(attr.value);
                    _this.onPropertyEnd(null, tagName);
                }
            };
            parser.ontext = function (text) {
                _this.$$lastText = text;
            };
            parser.onend = function () {
                return _this.$$destroy();
            };
            parser.write(xml).close();
        };

        Parser.prototype.$$destroy = function () {
            this.$$parser = null;
        };
        return Parser;
    })();
    saxxaml.Parser = Parser;
})(saxxaml || (saxxaml = {}));
//# sourceMappingURL=sax-xaml.js.map
