import SUPPORT_ONLY_TOUCH from '../utils/support-only-touch';
import assign from '../ployfill/Object.assign';

export default class tap {
    constructor(el, handler, options) {
        this.el = el;
        this.handler = handler;
        this.opts = assign({
            time: 250,
            posThreshold: 10,
            stop: false,
            prevent: false
        }, options);
        this.events = {};
        //绑定事件
        if (SUPPORT_ONLY_TOUCH) {
            this.events.start = this.onTouchStart.bind(this);
            this.events.end = this.onTouchEnd.bind(this);
            el.addEventListener('touchstart', this.events.start, false);
            el.addEventListener('touchend', this.events.end, false);
        } else {
            this.events.click = (e)=> {
                if (!this.isDisabled()) {
                    this.handler(e);
                }
            };
            el.addEventListener('click', this.events.click, false);
        }
    }

    destroy() {
        if (SUPPORT_ONLY_TOUCH) {
            this.el.removeEventListener('touchstart', this.events.start);
            this.el.removeEventListener('touchend', this.events.end);
        } else {
            this.el.removeEventListener('click', this.events.click);
        }
    }

    isDisabled() {
        return this.el.disabled || (this.el.getAttribute && this.el.getAttribute('disabled'));
    }

    onTouchStart(e) {
        if (this.opts.stop) e.stopPropagation();
        if (this.opts.prevent) e.preventDefault();

        let touches = e.touches[0];
        this.pageX = touches.pageX;
        this.pageY = touches.pageY;
        this.time = Date.now();
    }

    onTouchEnd(e) {
        //重写currentTarget
        Object.defineProperties(e, {
            "currentTarget": {
                value: this.el,
                writable: true,
                enumerable: true,
                configurable: true
            },
        });

        //目标没有被禁用
        if (!this.isDisabled()) {
            let touches = e.changedTouches[0];
            if (
                this.pageX >= touches.pageX - this.opts.posThreshold &&
                this.pageX <= touches.pageX + this.opts.posThreshold &&
                this.pageY >= touches.pageY - this.opts.posThreshold &&
                this.pageY <= touches.pageY + this.opts.posThreshold &&
                this.time + this.opts.time - Date.now() >= 0
            ) {
                e.preventDefault();
                this.handler(e); //激活事件
            }
        }
    }
}