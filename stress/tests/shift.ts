import StressTest = require('../StressTest');

class Shift extends StressTest {
    arr: any[] = [];

    prepare (ready?: () => any): boolean {
        this.arr = [];
        return false;
    }

    runIteration () {
        var arr = this.arr;
        for (var i = 0; i < 1000; i++) {
            arr.unshift(null);
        }
        var cur;
        while ((cur = arr.shift()) !== undefined) {

        }
    }
}
export = Shift;