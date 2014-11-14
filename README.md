# sax-xaml

This library is meant to abstract the XML parsing by delivering only XAML specific events.
This library relies on [sax-js](https://github.com/isaacs/sax-js) to parse XML.

## Usage

```
var parser = new sax.xaml.Parser()
    .onResolveType((xmlns, name) => {
        console.log("Resolve Type", xmlns, name);
        var func = new Function("return function " + name + "() { }");
        return func();
    }).onObjectResolve((type) => {
        console.log("Resolve Object", type);
        return new type();
    }).onObject((obj) => {
        console.log("Object", obj);
    }).onContentObject((obj) => {
        console.log("Content Object", obj);
    }).onName((name) => {
        console.log("x:Name", name);
    }).onKey((key) => {
        console.log("x:Key", key);
    }).onPropertyStart((ownerType, propName) => {
        console.log("Property Start", ownerType, propName);
    }).onPropertyEnd((ownerType, propName) => {
        console.log("Property End", ownerType, propName);
    }).onEnd(() => {
        QUnit.start();
        ok(true);
    }).parse(doc);
```