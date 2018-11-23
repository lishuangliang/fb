import css from '../utils/css';

const ANIMATION_EVENT_NAME_MAP = {
    'animation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'mozAnimationEnd',
    'OAnimation': 'oAnimationEnd',
    'msAnimation': 'MSAnimationEnd'
};

/**
 * 处理animate动画结束事件
 * @param el 绑定事件目标元素
 * @param callback 回调函数
 */
export default function (el, callback) {
    let animation = css(el, 'animation'),
        event = ANIMATION_EVENT_NAME_MAP[animation];

    function bind(e) {
        if (e.target == el) {
            callback(e);
            el.removeEventListener(event, bind);
        }
    }

    if (event) {
        el.addEventListener(event, bind)
    } else {
        throw '浏览器不支持animationend事件';
    }
}