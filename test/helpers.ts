module sax.xaml.tests {
    export function getDoc (url: string, cb: (doc: string) => any, error?: (error: any) => any) {
        function handleError (err) {
            if (!error)
                throw err;
            error(err);
        }

        var xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 0)
                return cb(xhr.responseText);
            handleError(new Error("Status: " + xhr.status));
        };
        xhr.onerror = () => {
            handleError(new Error("Could not load file."));
        };
        xhr.open("GET", url, true);
        xhr.send();
    }
}