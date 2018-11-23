<template>
    <transition name="slide-up">
        <div class="gift" v-show="rendered">
            <div class="tip" v-show="selected != -1">{{selected == -1 ? '' : gifts[selected].context}}</div>
            <div class="list" v-if="gifts" id="js_slider">
                <template v-for="i in Math.ceil(gifts.length / 8)">
                    <section class="wrap">
                        <template v-for="n in 8">
                            <section class="item"
                                     :class="{'z-sel': selected == getIndex(i, n), 'z-continued': gifts[getIndex(i, n)].continued == 1}"
                                     v-tap @tap="selected = getIndex(i, n)"
                                     v-if="getIndex(i, n) < gifts.length">
                                <img class="cover" :src="gifts[getIndex(i, n)].img">
                                <div class="count">
                                    {{gifts[getIndex(i, n)].price}}<i class="icon-diamond s-min"></i>
                                </div>
                                <div class="name">{{gifts[getIndex(i, n)].name}}</div>
                            </section>
                        </template>
                    </section>
                </template>
                <ul class="islider-dot f-wsn">
                    <li :class="{'z-sel': index == sliderIndex}"
                        v-for="(obj, index) in Math.ceil(gifts.length / 8)"></li>
                </ul>
            </div>
            <div class="bar">
                <a class="recharge" v-tap @tap="recharge()">
                    充值：<span>{{diamond}}</span><i class="icon-diamond"></i>
                </a>
                <a class="giving-1" v-show="timing != -1 && selected != -1" v-tap
                   @tap="giving()">连发<span>{{timing}}</span></a>
                <a class="giving-2" v-show="timing == -1" :disabled="selected == -1" v-tap @tap="giving()">发送</a>
            </div>
        </div>
    </transition>
</template>
<style>
</style>
<script>
    export default {
        name: 'gift-panel',
        props: ['room', 'rendered'],
        data() {
            return {
                diamond: Vue.$fenbei.user.diamond, //账户余额
                slider: null, //slider 对象
                sliderIndex: 0, //slider index
                selected: -1, //选中的礼物Index
                gifts: null, //礼物列表
                timer: null, //连送计时器
                timing: -1, //连送倒计时
                num: 0, //连击次数
                tag: Date.now(), //赠送礼物时间
                record: {} //赠送礼物记录
            }
        },
        asyncData(resolve) {
            if (!Vue.$fenbei.gifts) {
                Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/gift_GiftList.ss`, {
                    pt: Vue.$fenbei.pt
                }, (res) => {
                    Vue.$fenbei.gifts = res.data.list;
                    resolve({gifts: res.data.list});
                    this.init();
                });
            } else {
                resolve({gifts: Vue.$fenbei.gifts});
                this.init();
            }
        },
        watch: {
            rendered() {
                if (!this.rendered) {
                    this.selected = -1;
                    this.sliderIndex = 0;
                } else {
                    clearInterval(this.timer);
                    this.timing = -1;
                    this.num = 0;
                    this.$nextTick(() => this.slider.reset());
                }
            },
            selected(newVal, oldVal) {
                if (oldVal != -1 && newVal != -1) {
                    clearInterval(this.timer);
                    this.timing = -1;
                    this.num = 0;
                    this.tag = Date.now();
                }
            }
        },
        methods: {
            /**
             * 充值
             */
            recharge() {
                if (Vue.$fenbei.user.guest) { //需要先登录
                    this.$router.push({
                        name: 'login',
                        query: {
                            name: 'pay'
                        }
                    });
                } else { //跳转充值页面
                    this.$router.push({
                        name: 'pay',
                        query: {
                            path: encodeURIComponent(`/mobile${this.$route.path}`)
                        }
                    });
                }
            },
            /**
             * 赠送礼物
             */
            giving() {
                if (Vue.$fenbei.user.guest) { //需要先登录
                    Vue.$alert({
                        text: '您还未登录，是否登录？',
                        buttons: [{
                            'text': '确定',
                            'event': () => {
                                this.$router.push({
                                    name: 'login',
                                    query: {
                                        path: encodeURIComponent(this.$route.path)
                                    }
                                });
                            }
                        }, {
                            'text': '取消',
                            'event': null
                        }]
                    });
                } else if (Vue.$fenbei.user.diamond < this.gifts[this.selected].price) { //跳转充值页面
                    Vue.$alert({
                        text: '你的钻石不足，请充值！',
                        buttons: [{
                            'text': '确定',
                            'event': () => this.recharge()
                        }, {
                            'text': '取消',
                            'event': null
                        }]
                    });
                } else {
                    if (this.gifts[this.selected].continued === 1) {
                        clearInterval(this.timer);
                        ++this.num;
                        this.timing = 30;
                        this.timer = setInterval(() => {
                            if (--this.timing === -1) {
                                this.num = 0;
                                clearInterval(this.timer);
                            }
                        }, 200);
                    } else {
                        this.num = 1;
                        this.$emit('hide'); //关闭赠送框
                    }

                    let gift = this.gifts[this.selected];
                    Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/live_GiveGift.ss`, {
                        u: Vue.$fenbei.user.key,
                        tu: this.room.id,
                        r: this.room.roomid,
                        pt: Vue.$fenbei.pt,
                        c: Vue.$fenbei.channelid,
                        deviceid: Vue.$fenbei.deviceid,
                        g: gift.id,
                        xnum: this.num,
                        tag: this.tag
                    }, {
                        then: (res) => {
                            //刷新用户信息
                            Vue.$fenbei.refreshUserInfo({
                                user: {
                                    level: res.data.level,
                                    diamond: res.data.diamond,
                                    nickname: res.data.nickname
                                }
                            });
                            this.diamond = res.data.diamond;
                            //展示赠送礼物动画
                            this.dispatch('live-panel', 'animate', 'gift', res.data);
                            //打印聊天信息
                            this.dispatch('live-panel', 'message', {
                                nickname: Vue.$fenbei.formatText(Vue.$fenbei.user.nickname),
                                level: Vue.$fenbei.user.level,
                                content: `送了一个${res.data.name}`
                            });
                            //刷新主播的砖石数量
                            this.dispatch('live-panel', 'gold', res.data.gold);
                        },
                        catch: (res) => {
                            if (this.num > 0) --this.num; //赠送失败 num - 1
                            Vue.$toast(res.msg)
                        }
                    })
                }
            },
            /**
             * 初始化banner滑块
             */
            init() {
                this.$nextTick(function () {
                    let el = document.getElementById('js_slider');
                    if (el && this.gifts.length > 0) {
                        //加载依赖插件
                        require([__uri('/js/iSlider.js')], (iSlider) => {
                            this.slider = new iSlider({
                                dom: el,
                                data: Array.prototype.slice.call(el.querySelectorAll('.wrap')).map(function (el) {
                                    return {
                                        content: el
                                    }
                                })
                            });
                            this.slider.on('slideChanged', (index) => this.sliderIndex = index);
                        });
                    }
                });
            },
            /**
             * 获取礼物下标
             * @param {Number} i
             * @param {Number} n
             * @returns {number}
             */
            getIndex(i, n) {
                return (i - 1) * 8 + (n - 1);
            }
        }
    }
</script>