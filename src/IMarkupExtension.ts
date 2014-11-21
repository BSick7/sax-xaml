module sax.xaml {
    export interface IMarkupExtension {
        init(val: string);
        transmute?(ctx: IMarkupContext): any;
    }
}