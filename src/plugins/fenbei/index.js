import assign from '../../ployfill/Object.assign';
import {localStorage, sessionStorage} from '../../ployfill/storage';

export default function (Vue) {
    /**
     * 默认用户信息
     * @type {{
     * guest: boolean, 是否是游客
     * key: null, 用户key 接口调用时使用
     * hide:boolean ,是否是神秘人
     * id: null,  用户id
     * level: number, 用户等级
     * nickname: string, 用户昵称
     * diamond: number 用户砖石余额
     * }}
     */
    const DEFAULT_USER_INFO = {
        guest: true,
        key: null,
        hide : false,
        id: null,
        level: 1,
        nickname: '游客',
        diamond: 0
    };

    Vue.$fenbei = {
        API_HOST: 'http://api.fenbei.com',
        WEB_HOST: 'http://www.fenbei.com',
        deviceid: 'h5', //设备id
        channelid: 0, //渠道id
        pt: 0, //平台
        user: assign({}, DEFAULT_USER_INFO, JSON.parse(localStorage.getItem('fb_user') || '{}')), //用户信息
        /**
         * 调用接口
         * code：200 || data.code: 200 接口请求成功
         * @param {String} url 请求地址
         * @param {Object} formData 请求参数
         * @param {Function|Object} callback 回调函数 {then:function(){},catch:function(){}}
         */
        api(url, formData, callback){
            let xhr = new XMLHttpRequest();

            function getFormData(formData) {
                let data = '';
                for (let key in formData) {
                    data += '&' + key + '=' + encodeURIComponent((formData[key] instanceof Object ? JSON.stringify(formData[key]) : formData[key]));
                }
                return data.substring(1);
            }

            function handler(e) {
                if (e.type === 'load') {
                    let res = JSON.parse(xhr.responseText);

                    //处理www接口返回值 与api接口格式同一
                    if (typeof (res.code) === 'undefined') {
                        res.code = res.data.code;
                        res.msg = res.data.msg;
                    }

                    if (res.code == 200) {
                        if (typeof callback === "function") callback(res);
                        if (typeof callback === "object" && typeof callback.then === "function") callback.then(res);
                    } else {
                        if (typeof callback === "object" && typeof callback.catch === "function") callback.catch(res);
                    }
                } else {
                    if (typeof callback === "object" && typeof callback.catch === "function") callback.catch({
                        code: 500,
                        msg: '服务器开小差了，请稍后再试！'
                    });
                }
            }

            xhr.open('GET', `${url}?${getFormData(formData)}`, true);
            xhr.timeout = 0;
            xhr.onload = handler;
            xhr.onerror = handler;
            xhr.send();
        },
        /**
         * 重置用户信息
         */

        resetUserInfo() {
            this.user = DEFAULT_USER_INFO;
            try {
                //清除掉用户缓存
                localStorage.removeItem('fb_user');
            } catch (e) {
                //无痕模式会引发错误
            }
        },
        /**
         * 刷新用户信息
         * @param {Object} data 数据
         */
        refreshUserInfo(data) {
            this.user = assign({}, this.user, data.user);
            console.log('user');
            console.log(this.user);

            this.user.guest = false;
            if (data.key) this.user.key = data.key;
            try {
                //缓存用户数据
                localStorage.setItem('fb_user', JSON.stringify(this.user));
            } catch (e) {
                //无痕模式会引发错误
            }
        },
        /**
         * 设置分享信息
         * @param title
         * @param summary
         * @param pic
         */
        setShareInfo(title, summary, pic) {
            //qq浏览器或微信 设置分享信息
            if (/micromessenger|qq/i.test(navigator.userAgent)) {
                let shareInfo = {
                    title: title || '分贝直播',
                    summary: summary || '有美女有帅哥，就来这里看直播',
                    pic: pic || `${this.WEB_HOST}/mobile${__uri('/images/icon.png')}`,
                    url: location.href
                };
                require(['http://qzonestyle.gtimg.cn/qzone/qzact/common/share/share.js'], function (setShareInfo) {
                    if (/micromessenger/i.test(navigator.userAgent)) {
                        Vue.$fenbei.api(`${Vue.$fenbei.WEB_HOST}/web/json/Sign_wxSign_j.ss`, {url: location.href}, (res) => {
                            shareInfo.WXconfig = {
                                swapTitleInWX: true,
                                appId: res.data.appId,
                                timestamp: res.data.timestamp,
                                nonceStr: res.data.noncestr,
                                signature: res.data.signature
                            };
                            setShareInfo(shareInfo)
                        });
                    } else {
                        setShareInfo(shareInfo);
                    }
                });
            }
        },
        /**
         * 格式化图片地址
         * @param {String} url 图片原地址
         * @param {Number} size 裁剪图片大小
         * @returns {String}
         */
        formatImageUrl(url, size) {
            if (/.{1,}fenbei\/head/.test(url)) {
                if (/.{1,}oss\.fenbei\.com/.test(url)) {
                    url = url.replace('oss.fenbei.com', 'imgs.163888.net');
                }

                if (!/\!head\d{1,}$/.test(url) && size) {
                    url += `!head${size}`;
                }
            }
            return url;
        },
        /**
         * 格式化文本 提取出emoji给包上span.u-emojo标签
         * @param {String} text 待处理文本
         * @returns {String} 处理好的文本
         */
        formatText(text) {
            if (!text) return text;
            return text.replace(/(?:0\u20E3|1\u20E3|2\u20E3|3\u20E3|4\u20E3|5\u20E3|6\u20E3|7\u20E3|8\u20E3|9\u20E3|#\u20E3|\*\u20E3|\uD83C(?:\uDDE6\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF2|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFD|\uDDFF)|\uDDE7\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFC|\uDDFE|\uDDFF)|\uDDE8\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDE9\uD83C(?:\uDDEA|\uDDEC|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDFF)|\uDDEA\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDED|\uDDF7|\uDDF8|\uDDF9|\uDDFA)|\uDDEB\uD83C(?:\uDDEE|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDF7)|\uDDEC\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF1|\uDDF2|\uDDF3|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFE)|\uDDED\uD83C(?:\uDDF0|\uDDF2|\uDDF3|\uDDF7|\uDDF9|\uDDFA)|\uDDEE\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9)|\uDDEF\uD83C(?:\uDDEA|\uDDF2|\uDDF4|\uDDF5)|\uDDF0\uD83C(?:\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDF2|\uDDF3|\uDDF5|\uDDF7|\uDDFC|\uDDFE|\uDDFF)|\uDDF1\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDEE|\uDDF0|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFE)|\uDDF2\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDF3\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFF)|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C(?:\uDDE6|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF7|\uDDF8|\uDDF9|\uDDFC|\uDDFE)|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C(?:\uDDEA|\uDDF4|\uDDF8|\uDDFA|\uDDFC)|\uDDF8\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDE9|\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFD|\uDDFE|\uDDFF)|\uDDF9\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF9|\uDDFB|\uDDFC|\uDDFF)|\uDDFA\uD83C(?:\uDDE6|\uDDEC|\uDDF2|\uDDF8|\uDDFE|\uDDFF)|\uDDFB\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDEE|\uDDF3|\uDDFA)|\uDDFC\uD83C(?:\uDDEB|\uDDF8)|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C(?:\uDDEA|\uDDF9)|\uDDFF\uD83C(?:\uDDE6|\uDDF2|\uDDFC)))|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2694\u2696\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD79\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED0\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3]|\uD83E[\uDD10-\uDD18\uDD80-\uDD84\uDDC0]/g, function (v) {
                return `<span class="u-emoji">${v}</span>`;
            });
        }
    }
}