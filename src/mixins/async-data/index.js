export default {
    created() {
        if (this.$options.asyncData) {
            var resolve = (data) => {
                if (data) {
                    for (let key in this.$data) {
                        if (typeof data[key] !== "undefined") this.$set(this.$data, key, data[key]);
                    }
                }
            };

            let reject = function (error) {
                console.error(error);
            };

            var res = this.$options.asyncData.call(this, resolve, reject);
            if (res && typeof res.then === 'function') {
                res.then(resolve, reject)
            }
        }
    }
}