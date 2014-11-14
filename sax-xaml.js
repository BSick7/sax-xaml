var saxxaml;
(function (saxxaml) {
    saxxaml.Version = '0.1.0';
})(saxxaml || (saxxaml = {}));
var saxxaml;
(function (saxxaml) {
    var Parser = (function () {
        function Parser() {
            this.onObjectStart = null;
            this.onObjectEnd = null;
            this.onName = null;
            this.onKey = null;
            this.onPropertyStart = null;
            this.onPropertyEnd = null;
            this.onAttachedPropertyStart = null;
            this.onAttachedPropertyEnd = null;
        }
        Parser.prototype.parse = function (xml) {
            var _this = this;
            var parser = this.$$parser = sax.parser(true, {
                xmlns: true,
                position: true
            });
            var objs = [];
            parser.onopentag = function (node) {
                var tagName = node.local;
                var ind = tagName.indexOf('.');
                if (ind > -1) {
                }
                var obj = _this.onObjectStart(node.uri, node.local);
                objs.push(obj);
            };
            parser.onclosetag = function (tagName) {
                _this.onObjectEnd(objs.pop());
            };
            parser.onattribute = function (attr) {
            };
            parser.ontext = function (text) {
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
var saxxaml;
(function (saxxaml) {
    saxxaml.DEFAULT_XMLNS = "http://schemas.wsick.com/xaml";
    saxxaml.DEFAULT_XMLNS_X = "http://schemas.wsick.com/xaml/x";
})(saxxaml || (saxxaml = {}));
//# sourceMappingURL=sax-xaml.js.map
