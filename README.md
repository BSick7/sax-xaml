# sax-xaml

This library is meant to abstract XML parsing by delivering only XAML specific events.
This library relies on browser built-in [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) to parse XML documents.

### Usage

```
var parser = new Parser()
    .onResolveType((xmlns, name) => {
        // Resolve and return type
    }).onObjectResolve((type) => {
        // Create object from type
    }).onObject((obj) => {
        // Handle object
    }).onObjectEnd((obj) => {
        // Handle object tag finishing
    }).onContentObject((obj) => {
        // Handle content object
    }).onContentText((text) => {
        // Handle content text
    }).onName((name) => {
        // Handle x:Name
    }).onKey((key) => {
        // Handle x:Key
    }).onPropertyStart((ownerType, propName) => {
        // Handle property start (tag or attribute)
    }).onPropertyEnd((ownerType, propName) => {
        // Handle property end (tag or attribute)
    }).onEnd(() => {
        // Document finished parsing
    }).parse(doc);
```