import assign from '../../ployfill/Object.assign';
import throttle from '../../utils/throttle';

export default function (options) {
    options = assign({
        offset: 100,
        throttle: 200,
        transform: null
    }, options);

    const offset = {
        t: options.offsetTop || options.offsetVertical || options.offset,
        b: options.offsetBottom || options.offsetVertical || options.offset,
        l: options.offsetLeft || options.offsetHorizontal || options.offset,
        r: options.offsetRight || options.offsetHorizontal || options.offset
    };

    const DEFAULT_URL = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg=='; //占位图

    let listeners = {};

    function inView(el, view) {
        if (el.offsetParent === null) return false;

        let box = el.getBoundingClientRect();
        return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
    }

    function getView(root) {
        return {
            l: 0 - offset.l,
            t: 0 - offset.t,
            b: (root.innerHeight || document.documentElement.clientHeight) + offset.b,
            r: (root.innerWidth || document.documentElement.clientWidth) + offset.r
        }
    }

    function unMount(el, key, parent) {
        if (!el) return;

        let obj = listeners[key];
        for (let i = obj.queue.length - 1; i >= 0; i--) {
            if (obj.queue[i].el === el) {
                obj.queue.splice(i, 1);
            }
        }
        if (obj.queue.length === 0 && obj.bind) {
            obj.bind = false;
            parent.removeEventListener('scroll', obj.handle);
            window.removeEventListener('resize', obj.handle);
        }
    }

    function renderDone(photo) {
        if (photo.type === 'background-image') {
            photo.el.style.backgroundImage = `url('${photo.src}')`;
        } else {
            photo.el.setAttribute('src', photo.src);
        }
        photo.el.setAttribute('lazy', 'loaded');
        if (photo.placeholder) {
            photo.el.style.height = 'auto';
            photo.el.style.paddingTop = 0;
        }
    }

    function render(photo, view) {
        if (!view) view = getView(photo.parent || window);
        if (!inView(photo.el, view)) return;
        if (typeof options.transform === "function") photo = options.transform(photo); //对图片进行处理

        //加载并验证图片
        let img = new Image();
        img.src = photo.src;

        if (img.complete) {
            renderDone(photo);
        } else {
            img.onload = function () {
                renderDone(photo);
            };

            img.onerror = function () {
                photo.el.setAttribute('lazy', 'error');
            };
        }

        unMount(photo.el, photo.key, photo.parent); //卸载元素
    }

    return {
        inserted (el, binding) {
            if (binding.arg !== 'background-image') el.setAttribute('src', DEFAULT_URL); //默认显示
            let src = binding.value || el.getAttribute('data-src'); //读取图片真实地址
            el.setAttribute('lazy', src ? 'loading' : 'error'); //更新状态

            if (src) {
                let modifiers = Object.keys(binding.modifiers);
                Vue.nextTick(() => {
                    let photo = {
                            el: el,
                            src: src,
                            type: binding.arg,
                            parent: modifiers.length > 0 ? document.getElementById(modifiers[0]) : window,
                            key: modifiers.length > 0 ? modifiers[0] : 'window'
                        },
                        obj = listeners[photo.key] || {
                                bind: false,
                                queue: [],
                                handle: throttle(function () {
                                    let view = getView(photo.parent),
                                        queue = listeners[photo.parent === window ? 'window' : photo.parent.getAttribute('id')].queue;

                                    for (let i = queue.length - 1; i >= 0; i--) {
                                        render(queue[i], view);
                                    }
                                }, options.throttle)
                            };

                    if (binding.arg !== 'background-image') {
                        let w = el.getAttribute('data-width'),
                            h = el.getAttribute('data-height');

                        if (/\d/.test(w) && /\d/.test(h)) {
                            el.style.height = 0;
                            el.style.paddingTop = `${(h / w * 100).toFixed(4)}%`;
                            photo.placeholder = true;
                        }
                    }


                    listeners[photo.key] = obj;

                    obj.queue.push(photo);

                    render(photo); //判断是否能加载当前图片

                    if (obj.queue.length === 1 && !obj.bind) {
                        obj.bind = true;
                        photo.parent.addEventListener('scroll', obj.handle);
                        window.addEventListener('resize', obj.handle);
                    }
                });
            }
        },
        unbind(el, binding) {
            let modifiers = Object.keys(binding.modifiers);
            unMount(el, modifiers.length > 0 ? modifiers[0] : 'window', modifiers.length > 0 ? document.getElementById(modifiers[0]) : window);
        }
    }
}