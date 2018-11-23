<template>
    <section class="u-page">

        <div class="m-from">
            <div class="row phone">
                <input type="tel" v-model="tel" maxlength="11" placeholder="请输入手机号">
                <i class="icon-clear" v-tap @tap="tel = ''" v-show="tel != ''"></i>
            </div>
            <div class="row">
                <input type="text" v-model="pwd" v-show="show" placeholder="请输入密码" maxlength="16">
                <input type="password" v-model="pwd" v-show="!show" placeholder="请输入密码" maxlength="16">
                <i :class="{'icon-pass-show': show, 'icon-pass-hide': !show}" v-tap @tap="show = !show"></i>
            </div>
            <button class="submit" v-tap.prevent @tap="login" :disabled="disabled()">登录</button>
            <ul class="link">
                <router-link :to="{name: 'find'}">忘记密码？</router-link>
                <router-link :to="{name: 'register'}">立即注册！</router-link>
            </ul>
        </div>
        <div class="m-outer-login">
            <h3 class="title"><span>其他登录方式</span></h3>

            <div class="container">
                <a class="sina" :href="authorize('sina')"></a>
                <!--<a class="qq" :href="authorize('qq')"></a>-->
            </div>
        </div>
    </section>
</template>
<style>
</style>
<script>
    export default {
        name: 'login',
        data() {
            return {
                tel: this.$route.query.tel || '', //手机号码
                pwd: '', //密码
                show: false //显示密码
            }
        },
        methods: {
            login() {
                Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/user_PhoneLogin.ss`, {
                    tel: this.tel,
                    pwd: window.md5(this.pwd),
                    c: Vue.$fenbei.channelid,
                    deviceid: Vue.$fenbei.deviceid
                }, {
                    then: (res) => {
                        Vue.$fenbei.refreshUserInfo(res.data); //刷新用户信息
                        if (this.$route.query.path) {
                            this.$router.push({
                                path: decodeURIComponent(this.$route.query.path) //跳转到来源地址
                            });
                        } else {
                            this.$router.push({
                                name: this.$route.query.name || 'list'
                            }); //跳转
                        }
                    },
                    catch: (res) => Vue.$toast(res.msg) //登录失败
                });
            },
            /**
             * 登录按钮状态
             * @returns {boolean}
             */
            disabled() {
                return !(/^1\d{10}$/.test(this.tel) && /\S{6,16}/.test(this.pwd));
            },
            /**
             * 签名页面地址
             * @param {String} type 注册或者找回密码
             */
            sign(type) {
                this.$router.push({
                    name: 'sign',
                    params: {
                        type: type
                    },
                    query: this.$route.query
                });
            },
            /**
             * 第三方授权地址
             * @param {String} type 类型
             */
            authorize(type) {
                let uri;

                /*<remove trigger="@release == 0">*/
                uri = encodeURIComponent(`${Vue.$fenbei.WEB_HOST}/wx/redirectLogin${type}.ss?url=http://${location.host}/mobile/login?origin=${encodeURIComponent(JSON.stringify(this.$route.query || {}))}`);
                /*</remove>*/
                /*<remove trigger="@release == 1">*/
                uri = encodeURIComponent(`${Vue.$fenbei.WEB_HOST}/wx/redirectLogin${type}.ss?url=http://${location.host}/%23/mobile/login?origin=${encodeURIComponent(JSON.stringify(this.$route.query || {}))}`);
                /*</remove>*/

                if (type === 'sina') {
                    return `https://api.weibo.com/oauth2/authorize?client_id=2579951765&display=mobile&redirect_uri=${uri}`;
                } else {
                    return `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101316488&state=authorize&display=mobile&redirect_uri=${uri}`;
                }
            }
        },
        beforeRouteEnter(to, from, next) {
            requirejs([__uri('/js/md5.min.js')], function (md5) {
                window.md5 = md5; //加载依赖
                next();
            });
        }
    }
</script>
