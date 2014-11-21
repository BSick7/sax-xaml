module sax.xaml {
    export interface IObjectStackItem {
        type: any;
        name: string;
        prop: boolean;
        obj: any;
        text: string;
    }

    export interface IMarkupContext {
        attr: Attr;
        resolvePrefixUri (prefix: string): string;
        startObject(obj: any);
        endObject(): any;
        getCurrentItem(): IObjectStackItem;
        walkUpObjects(): IObjectWalker;
    }

    export interface IObjectWalker {
        current: any;
        step(): boolean;
    }

    export function createMarkupContext (os: any[]): IMarkupContext {
        return {
            attr: null,
            resolvePrefixUri (prefix: string): string {
                return this.attr.lookupNamespaceURI(prefix);
            },
            startObject (obj: any) {
                var item: IObjectStackItem = {
                    type: null,
                    name: null,
                    prop: false,
                    obj: obj,
                    text: null
                };
                os.push(item);
            },
            endObject (): any {
                return os.pop().obj;
            },
            getCurrentItem (): IObjectStackItem {
                return os[os.length - 1];
            },
            walkUpObjects (): IObjectWalker {
                var i = os.length;
                return {
                    current: undefined,
                    step: function (): boolean {
                        i--;
                        var item: IObjectStackItem;
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
}