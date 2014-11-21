module sax.xaml {
    export interface IMarkupExtension {
        init(val: string);
        transmute?(os: any[]): any;
    }
}