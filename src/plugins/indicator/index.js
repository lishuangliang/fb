import indicator from '../../components/indicator';

export default function (Vue, options) {
    const Indicator = Vue.extend(indicator);
    let instance;

    Vue.$indicator = {
        open(text) {
            if (!instance) {
                instance = new Indicator({
                    el: document.createElement('div')
                });

                document.body.appendChild(instance.$el);
            }

            Vue.nextTick(() => {
                instance.text = text || '';
                instance.visible = true;
            });
        },
        close() {
            if (instance) {
                Vue.nextTick(() => {
                    instance.visible = false;
                });
            }
        }
    };
}