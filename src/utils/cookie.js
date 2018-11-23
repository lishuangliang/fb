export default {
    get(name) {
        let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        return arr = document.cookie.match(reg) ? arr[2] : null;
    },
    set(name, value, days) {
        let date, expires;

        if (days) {
            date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    del(name) {
        let exp = new Date();
        exp.setTime(exp.getTime() - 1);
        let val = this.get(name);
        if (val != null) document.cookie = name + "=" + val + ";expires=" + exp.toGMTString();
    }
}