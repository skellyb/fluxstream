module.exports = {
    extend: function () {
        var src = {};
        var target;
        var args = Array.prototype.slice.call(arguments, 0);

        args.forEach(function(arg, i) {
            if (i === 0) return src = arg;
            target = arg;
            Object.keys(target).forEach(function(prop) {
                if (target.hasOwnProperty(prop)) {
                    src[prop] = target[prop];
                }
            });
        })

        return src;
    }
};