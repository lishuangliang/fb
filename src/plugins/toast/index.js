import assign from '../../ployfill/Object.assign';
import toast from '../../components/toast';

export default function (Vue, options) {
    const Toast = Vue.extend(toast);
    const DEFAULT = assign({
        duration: 2400,
        effect: 'fade',
        dialogClass: 'u-dialog-toast',
        message: '',
        className: '',
        position: 'middle'
    }, options);

    Vue.$toast = function (message, className) {
        let opts = assign({}, DEFAULT, typeof message === "string" ? {
            message: message,
            className: typeof className === "string" ? className : DEFAULT.className
        } : message);

        let instance = new Toast({
            el: document.createElement('div')
        });
        for (let key in opts) {
            instance[key] = opts[key];
        }

        document.body.appendChild(instance.$el);
        Vue.nextTick(function () {
            instance.rendered = true;
            setTimeout(function () {
                instance.rendered = false;
            }, opts.duration);
        });

        return instance;
    };
}