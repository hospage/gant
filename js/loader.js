function load(){
    let l = new Loader();
    l.require(
        [
            "js/datePicker.js",
            "js/tasksObj.js",
            "js/tests.js"
        ],
        function() {
            // Callback
            console.log('All Scripts Loaded');
        });
    return this;
}

let Loader = function () { };
Loader.prototype = {
    require: function (scripts, callback) {
        this.loadCount      = 0;
        this.totalRequired  = scripts.length;
        this.callback       = callback;

        for (let i = 0; i < scripts.length-1; i++) {
            this.writeScript(scripts[i]);
            console.log('-->'+scripts[i]);
        }

        this.writeScript(scripts[scripts.length - 1]);
    },
    loaded: function () {
        this.loadCount++;

        if (this.loadCount === this.totalRequired && typeof this.callback == 'function') this.callback.call();
    },
    writeScript: function (src) {
        let self = this;
        let s = document.createElement('script');
        s.type = "text/javascript";
        s.async = false;
        s.src = src;
        s.addEventListener('load', function (e) { self.loaded(e); }, false);
        let head = document.getElementsByTagName('head')[0];
        head.appendChild(s);
    }
};


document.onload = load();