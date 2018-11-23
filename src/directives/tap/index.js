import assign from '../../ployfill/Object.assign';
import Tap from '../../modules/tap';

export default function (options) {
    return {
        bind(el, binding) {
            let opts = assign({}, options);
            if (binding.modifiers.stop) opts.stop = true;
            if (binding.modifiers.prevent) opts.prevent = true;

            el.tap = new Tap(el, function () {
                let event = document.createEvent('HTMLEvents');
                event.initEvent('tap', true, true);
                el.dispatchEvent(event);
            }, opts);
        },
        unbind(el) {
            if (el.tap) el.tap.destroy();
        }
    }
}