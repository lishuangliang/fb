import assign from '../ployfill/Object.assign';
import animationend from '../ployfill/animationend';

class Bubble {
    constructor(parentNode) {
        this.parentNode = parentNode;
    }

    add(index) {
        let el = document.createElement('i');
        //气泡类型(7) 气泡动画速度(5) 气泡动画
        el.className = `u-bubble icon-bubble bubble-${index} fx-speed-${Math.floor(Math.random() * 5 + 1)} fx--${(Math.floor(Math.random() * 7 + 1))}`;
        this.parentNode.appendChild(el); //添加进dom

        animationend(el, () => {
            this.parentNode.removeChild(el); //从dom中移除
        });
    }
}

class OrdinaryGift {
    constructor(parentNode, data, callback) {
        this.key = `${data.id}-${data.gid}`; //key ~ 赠送人id-礼物id
        this.data = data;
        this.max = data.xnum;
        this.number = data.number || data.xnum;
        this.parentNode = parentNode;
        this.callback = callback;

        this.create();
        this.counter(true);
    }

    create() {
        let el = document.createElement('div'),
            html = '';

        html += `<img class="avatar" src="${this.data.headimg}"/>`;
        html += `<div class="name f-toe">${this.data.nickname}</div>`;
        html += `<div class="content">送了一个${this.data.name}</div>`;
        html += `<img class="figure" src="${this.data.img}">`;

        el.className = `u-gift-toast fx-in`;
        el.innerHTML = html;

        this.parentNode.appendChild(el);

        this.el = el;
    }

    counter(first) {
        if (!first) this.el.removeChild(this.el.querySelector('.number'));
        let elem = document.createElement('ul');
        elem.className = `number f-wsn ${!first ? 'z-timely' : ''}`;
        elem.innerHTML = `<li class="s-num-x"></li>${String(this.number).split('').map((v) => `<li class="s-num-${v}"></li>`).join('')}`;
        this.el.appendChild(elem);
        animationend(elem, () => {
            if (this.number < this.max) {
                this.number++;
                this.counter(false); //继续计数
            } else {
                this.timer = setTimeout(() => this.remove(), 1200); //展示1.2s
            }
        })
    }

    remove() {
        this.timer = -1;
        this.el.classList.remove('fx-in');
        this.el.classList.add('fx-out');
        animationend(this.el, () => {
            this.parentNode.removeChild(this.el);
            this.callback();
        });
    }

    set(num) {
        this.max = num;
        if (this.timer > 0) {
            clearTimeout(this.timer);
            this.timer = null;
            this.number++;
            this.counter(false);
        }
    }
}

class SpecialGift {
    constructor(parentNode, data, callback) {
        let el = document.createElement('div'),
            html = '';

        if (data.gid == 20) {
            //么么哒
            el.className = 'u-gift-kiss u-gift-effect';
            html += [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => `<div class="kiss s-small s-site-${v}"></div>`).join('');
            html += '<div class="kiss s-big"></div>';
        } else if (data.gid == 23) {
            //日出东方
            el.className = 'u-gift-sun u-gift-effect';
            html += '<div class="sun"><div class="ball"></div><div class="halo"></div></div>';
            html += '<div class="sea"></div>';
            html += '<div class="tree"></div>';
            html += `<div class="boat"><div class="info f-wsn"><img class="avatar" src="${data.headimg}"/><span class="text">${data.nickname}送出${data.name}</span></div></div>`;
            html += '<div class="cloud cloud-1"></div>';
            html += '<div class="cloud cloud-2"></div>';
            html += '<div class="bird bird-1"></div>';
            html += '<div class="bird bird-2"></div>';
        } else if (data.gid == 10) {
            el.className = 'u-gift-plane u-gift-effect';
            html += '<div class="wrap">';
            html += `<div class="text f-wsn">${data.nickname}送出${data.name}</div>`;
            html += '<div class="plane"></div>';
            html += '<div class="shadow"></div>';
            html += '</div>';
        } else if (/9|37/.test(data.gid)) {
            el.className = 'gift_ship' + (data.gid === 37 ? ' gift_ship2' : '');
            html = '<div class="wave"></div><div class="waveReverse"></div><div class="ship"><div class="info"></div><div class="ship_shadow"></div></div><div class="fireworks_bg"><div class="fireworks"></div></div><div class="arrow"></div>';
        } else if (/8|25|36/.test(data.gid)) {
            if (data.gid === 8) {
                el.className = 'caradd2 carModel';
            } else if (data.gid === 25) {
                el.className = 'car2 car2Reverse carModel';
            } else if (data.gid === 36) {
                el.className = 'car_lanbo2 car2Reverse carModel';
            }
            html = '<div class="tire tire1"></div><div class="tire tire2"></div><div class="light light1"></div><div class="light light2"></div><div class="tail_gas tail_gas1"></div><div class="tail_gas tail_gas2"></div><div class="info"></div>';
        }

        el.innerHTML = html;
        parentNode.appendChild(el);
        animationend(el, () => {
            parentNode.removeChild(el); //移除节点
            callback();
        });
    }
}

export default class Animator {
    constructor(parentNode) {
        this.parentNode = parentNode;

        this.specialGiftQueue = []; //特殊礼物队列
        this.ordinaryGiftQueue = []; //普通礼物队列
        this.ordinaryGiftChannel = [null, null, null]; //普通礼物展示通道
        this.bubbleInstance = new Bubble(parentNode);
    }

    bubble(index) {
        this.bubbleInstance.add(index);
    }

    gift(data) {
        if (/^(8|9|10|20|23|25|36|37)$/.test(data.gid)) {
            this.specialGiftQueue.push(data);
            if (this.specialGiftQueue.length === 1) this.createSpecialGift();
        } else {
            let index = this.getChannelIndex(`${data.id}-${data.gid}`);

            if (~index) {
                let gift = this.ordinaryGiftChannel[index];

                if (gift) {
                    //已经存在实例
                    gift.set(data.xnum);
                } else {
                    //创建实例
                    this.ordinaryGiftChannel[index] = this.createOrdinaryGift(index, data); //添加进通道
                }
            } else {
                //没有可用的展示通道 暂时放进队列中
                //验证是否有重复数据
                let notInQueue = this.ordinaryGiftQueue.every((o, i) => {
                    if (o.id == data.id && o.gid === data.gid) {
                        o.xnum = data.xnum;
                        return false;
                    }
                    return true;
                });

                if (notInQueue) {
                    data.number = data.xnum;
                    this.ordinaryGiftQueue.push(data);
                }
            }
        }
    }

    /**
     * 创建特殊礼物实例
     */
    createSpecialGift() {
        if (this.specialGiftQueue.length > 0) {
            new SpecialGift(this.parentNode, this.specialGiftQueue[0], () => {
                this.specialGiftQueue.shift(0, 1); //从队列中移除
                this.createSpecialGift(); //继续展示下一个特殊礼物
            });
        }
    }

    /**
     * 创建普通礼物实例
     * @param {Number} index 通道下标
     * @param {Object} data 数据
     * @returns {OrdinaryGift}
     */
    createOrdinaryGift(index, data) {
        let gift = new OrdinaryGift(this.parentNode, data, () => {
            if (this.ordinaryGiftQueue.length > 1) {
                data = this.ordinaryGiftQueue[0];
                this.ordinaryGiftQueue.splice(0, 1);
                this.ordinaryGiftChannel[index] = this.createOrdinaryGift(index, data);
            } else {
                this.ordinaryGiftChannel[index] = null;
            }
        });
        gift.el.classList.add(`s-index-${index + 1}`); //添加class

        return gift;
    }

    /**
     * 获取可用的通道下标
     * @param key
     * @returns {number}
     */
    getChannelIndex(key) {
        let index = -1,
            freeIndex = -1;

        this.ordinaryGiftChannel.every((o, i) => {
            //已经占据的通道
            if (o && (key === o.key && o.timer != -1)) {
                index = i;
                return false;
            }
            //空闲的通道
            if (!o && freeIndex == -1) freeIndex = i;
            return true;
        });

        return Math.max(index, freeIndex);
    }
}