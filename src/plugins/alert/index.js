import assign from '../../ployfill/Object.assign';
import alert from '../../components/alert';

export default function (Vue, options) {
    const Alert = Vue.extend(alert);
    const DEFAULT = assign({
        effect: 'bounce',
        dialogClass: 'u-dialog-alert',
        title: '',
        text: '',
        className: '',
        buttons: [{
            'text': '确定',
            'event': null
        }]
    }, options);

    Vue.$alert = function (text, className) {
        let opts = assign({}, DEFAULT, typeof text === "string" ? {
            text: text,
            className: typeof className === "string" ? className : DEFAULT.className
        } : text);

        let instance = new Alert({
            el: document.createElement('div')
        });
        for (let key in opts) {
            instance[key] = opts[key];
        }

        document.body.appendChild(instance.$el);
        Vue.nextTick(function () {
            instance.rendered = true;
        });

        return instance;
    };
}