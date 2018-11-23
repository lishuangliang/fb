<template>
    <section class="u-page">
        <div class="m-pay">
            <header class="head">
                <div class="sum">
                    账户余额<i class="icon-diamond"></i><b>{{diamond}}</b>
                </div>
                <div class="type">{{wx ? '微信支付' : '支付宝'}}</div>
            </header>
            <h2 class="title">选择充值金额:<span style="color:red" v-show="wx">(请在手机端微信上选择支付)</span></h2>
            <section class="box">
                <div class="u-loading" v-show="!data"></div>
                <ul class="list" v-if="data">
                    <li v-for="o in data" v-tap @tap="pay(o.id)">
                        <i class="icon-diamond"></i>{{o.diamond}}
                        <span class="money">{{o.money}}元</span>
                        <span class="giving" v-show="o.extra_num != 0">赠送{{o.extra_num}}砖石</span>
                    </li>
                </ul>
            </section>
            <a class="close" v-show="forbid" v-tap @tap="$router.push({name: 'list'})"></a>
            <form id="js_form" style="display: none" method="get">
                <input type="hidden" v-for="(value, key) in orderInfo" :name="key" :value="value">
            </form>
            <footer class="foot">充值问题请关注微信公众号“分贝163888”</footer>
        </div>
    </section>
</template>
<style>
</style>
<script>
    export default {
        name: 'pay',
        data() {
            return {
                forbid: !this.$route.query.forbid, //隐藏返回列表按钮
                diamond: Vue.$fenbei.user.diamond, //砖石余额
                data: null, //支付项
                orderInfo: {}, //支付宝充值订单信息
                wx: /micromessenger/i.test(navigator.userAgent) //是否是微信客户端
            }
        },
        methods: {
            /**
             * 加载数据
             */
            loadData() {
                Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/user_MyDiamondNew.ss`, {
                    u: Vue.$fenbei.user.key,
                    pt: Vue.$fenbei.pt,
                    c: 20241,
                    d: 2,
                    rcid: 1
                }, {
                    then: (res) => {
                        Vue.$fenbei.refreshUserInfo({user: {diamond: res.data.diamond}}); //刷新用户砖石数量

                        this.diamond = res.data.diamond;
                        this.data = this.wx ? res.data.listWX : res.data.listZFB;
                    },
                    catch: (res) => {
                        Vue.$alert({
                            text: res.code == '6358' ? '登录信息已失效，请重新登录！' : res.msg,
                            buttons: [{
                                'text': '确定',
                                'event': () => {
                                    //重置掉用户信息
                                    Vue.$fenbei.resetUserInfo();
                                    //跳转到登录页面
                                    this.$router.push({
                                        name: 'login',
                                        query: {
                                            name: 'recharge'
                                        }
                                    });
                                }
                            }]
                        });
                    }
                })
            },
            /**
             * 支付
             * @param {Number} id 订单项od
             */
            pay(id) {
                Vue.$indicator.open('提交订单');
                if (!this.wx) {
                    //支付宝支付
                    Vue.$fenbei.api(`${Vue.$fenbei.WEB_HOST}/web/json/pay_zfborder_j.ss`, {
                        //url: `http://${location.host}/mobile/pay`,
                        url: `http://${location.host}/mobile/list`,
                        uid: Vue.$fenbei.user.id,
                        cid: id
                    }, {
                        then: (res) => {
                            let formElem = document.getElementById('js_form');
                            formElem.setAttribute('action', res.data.server_url);

                            this.orderInfo = res.data.zfurl;
                            this.$nextTick(() => formElem.submit()); //提交表单
                        },
                        catch: () => {
                            Vue.$indicator.close();
                            Vue.$alert('创建充值订单失败！');
                        }
                    });
                } else {
                    //微信支付
                    Vue.$fenbei.api(`${Vue.$fenbei.WEB_HOST}/web/json/pay_order_j.ss`, {
                        uid: Vue.$fenbei.user.id,
                        openid: Vue.$fenbei.user.openid,
                        cid: id,
                        gtype: 0,
                        ucid: '0'
                    }, {
                        then: (res) => {
                            Vue.$indicator.close();
                            let param = res.data.param;
                            WeixinJSBridge.invoke('getBrandWCPayRequest', {
                                "appId": param.appId, //公众号名称，由商户传入
                                "timeStamp": String(param.timeStamp), //时间戳，自 1970 年以来的秒数
                                "nonceStr": param.nonceStr, //随机串
                                "package": param.package,
                                "signType": param.signType, //微信签名方式
                                "paySign": param.paySign //微信签名
                            }, (res) => {
                                // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg 将在用户支付成功后返回 ok，但并不保证它绝对可靠。
                                if (res.err_msg == "get_brand_wcpay_request:ok") {
                                    //支付成功
                                    //this.loadData(() => Vue.$toast('支付成功', 's-success'));
                                    Vue.$toast('支付成功!!', 's-success');
                                    this.$router.replace({name: 'list'});
                                    //this.loadData(() => this.$router.replace({name: 'list'}));
                                } else {
                                    Vue.$toast('支付失败', 's-failure');
                                }
                            });
                        },
                        catch: () => {
                            Vue.$indicator.close();
                            Vue.$alert('创建充值订单失败！');
                        }
                    })
                }
            }
        },
        beforeRouteEnter(to, from, next) {
            //不允许游客进入该页面
            next(Vue.$fenbei.user.guest ? {
                name: 'login',
                query: {
                    name: 'pay'
                }
            } : true);
        },
        created() {
            this.loadData();
        }
    }
</script>
