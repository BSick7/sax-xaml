module sax.xaml.iterator {
    export interface IXmlSax {
        onElementStart(el: Element);
        onElementEnd(el: Element);
        onAttribute(attr: Attr);
    }

    export function parse (el: Element, sax: IXmlSax) {
        var cur = el;
        var stack: Element[] = [];
        while (cur) {
            sax.onElementEnd(cur);
            stack.push(cur);

            for (var i = 0, attrs = cur.attributes, len = attrs.length; i < len; i++) {
                sax.onAttribute(attrs[i]);
            }

            var y = findNext(cur);
            cur = y.next;
            for (var i = y.count; i > 0; i--) {
                sax.onElementEnd(stack.pop());
            }
        }
    }

    interface INextElement {
        count: number;
        next: Element;
    }
    function findNext (curEl: Element): INextElement {
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
                next = (<any>next).parentElement;
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
}