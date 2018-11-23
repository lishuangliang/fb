import css from './css';

var helperElem = document.createElement('div'),
    transformProperty = css(helperElem, 'transform'),
    transitionProperty = css(helperElem, 'transition'),
    perspective = css(helperElem, 'perspective');

export default {
    transformProperty: transformProperty,
    transitionProperty: transitionProperty,
    /**
     * 设置translate
     * @param el
     * @param x
     * @param y
     */
    translate(el, x, y) {
        if (!el || el.style === null) return;
        if (!el.style[transformProperty] && x === 0 && y === 0) return;

        if (x === null || y === null) {
            var translate = this.getTranslateValue(el);
            x = x || translate.left || 0;
            y = y || translate.top || 0;
        }

        this.cancelTranslateValue(el);

        el.style[transformProperty] += ` translate(${x}px, ${y}px)${!!perspective ? ' translateZ(0px)' : ''}`;
    },
    /**
     * 获取元素translate的值
     * @param el
     * @returns {{left: number, top: number}}
     */
    getTranslateValue(el) {
        var result = {left: 0, top: 0};
        if (!el || el.style === null) return result;

        var transform = el.style[transformProperty];
        var matches = /translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/g.exec(transform);
        if (matches) {
            result.left = +matches[1];
            result.top = +matches[3];
        }

        return result;
    },
    /**
     * 清除translate的值
     * @param el
     * @returns {*}
     */
    cancelTranslateValue(el) {
        if (!el || el.style === null) return result;
        var transformValue = el.style[transformProperty];
        if (transformValue) {
            transformValue = transformValue.replace(/translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/g, '');
            el.style[transformProperty] = transformValue;
        }
    }
}
