import css from '../utils/css';

const TRANSITION_EVENT_NAME_MAP = {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'mozTransitionEnd',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd'
};

/**
 * 处理transition动画结束事件
 * @param el 绑定事件目标元素
 * @param callback 回调函数
 */
export default function (el, callback) {
    let transition = css(el, 'transition'),
        event = TRANSITION_EVENT_NAME_MAP[transition];

    function bind(e) {
        if (e.target == el) {
            callback(e);
            el.removeEventListener(event, bind);
        }
    }


    if (event) {
        el.addEventListener(event, bind)
    } else {
        throw '浏览器不支持transitionend事件';
    }
}