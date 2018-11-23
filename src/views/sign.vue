<template>
    <section class="u-page">
        <div class="m-from">
            <section v-show="step == 1">
                <div class="row phone">
                    <input type="tel" v-model="tel" maxlength="11" placeholder="请输入手机号">
                    <i class="icon-clear" v-tap @tap="tel = ''" v-show="tel != ''"></i>
                </div>
                <div class="row code">
                    <input type="number" v-model="code" maxlength="4" placeholder="请输入验证码">
                    <i class="icon-clear" v-tap @tap="code = ''" v-show="code != ''"></i>
                    <button class="send" v-tap.prevent @tap="send()" :disabled="disabled('code')">
                        {{waiting == 0 ? '发送' : '重试('+waiting+')'}}
                    </button>
                </div>
                <button class="submit" v-tap.prevent @tap="validation()" :disabled="disabled('step1')">下一步</button>
            </section>
            <section v-show="step == 2">
                <div class="row">
                    <input type="password" v-model="pwd" maxlength="16" placeholder="请输入密码">
                    <i class="icon-clear" v-tap @tap="pwd = ''" v-show="pwd != ''"></i>
                </div>
                <div class="row">
                    <input type="password" v-model="pwd2" maxlength="16" placeholder="请再次输入密码">
                    <i class="icon-clear" v-tap @tap="pwd2 = ''" v-show="pwd2 != ''"></i>
                </div>
                <div class="tip">
                    密码长度为6到16个字符组成，可以由数字，英文字母大写及符号组成。
                </div>
                <button class="submit" v-tap.prevent @tap="submit()" :disabled="disabled('step2')">确定</button>
            </section>
        </div>
    </section>
</template>
<style>
</style>
<script>
    export default {
        name: 'sign',
        beforeRouteLeave(to, from, next) {
            clearInterval(this.timer); //停掉计时器
            next();
        },
        data() {
            return {
                tel: '', //手机号码
                pwd: '', //密码
                pwd2: '', //确认密码
                code: '', //验证码
                waiting: 0, //发送验证码 等待时间
                timer: null, //验证码计时器
                step: 1 //当前步骤
            }
        },
        methods: {
            /**
             * 手机号 + 验证码验证
             */
            validation() {
                Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/user_VaildateCode.ss`, {
                    tel: this.tel,
                    code: this.code,
                    c: Vue.$fenbei.channelid,
                    deviceid: Vue.$fenbei.deviceid
                }, {
                    then: () => this.step = 2,
                    catch: (res) => Vue.$toast(res.msg)
                });
            },
            /**
             * 提交 注册帐号或重置密码
             */
            submit() {
                Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/${this.$route.name === 'register' ? 'user_PhoneReg.ss' : 'user_ResetPwd.ss'}`, {
                    tel: this.tel,
                    pwd: window.md5(this.pwd),
                    code: this.code,
                    c: Vue.$fenbei.channelid,
                    deviceid: Vue.$fenbei.deviceid,
                    fbtoken: sessionStorage.getItem('fb_token')
                }, {
                    then: (res) => {
                        if (this.$route.name == 'register') {
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
                        } else {
                            Vue.$toast('修改成功', 's-success');
                            this.$router.push({
                                name: 'login',
                                query: Object.assign({tel: this.tel}, this.$route.query)
                            });
                        }

                    },
                    catch: (res) => Vue.$toast(res.msg)
                })
            },
            /**
             * 发送手机验证码
             */
            send() {
                //验证码发送计时器
                this.waiting = 60;
                this.timer = setInterval(() => {
                    this.waiting -= 1;
                    if (this.waiting == 0) clearInterval(this.timer);
                }, 1000);

                //发送验证码
                Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/user_SendSMS.ss`, {
                    tel: this.tel,
                    type: this.$route.name === 'register' ? 1 : 2
                }, {
                    catch: (res) => {
                        clearInterval(this.timer);
                        this.waiting = 0;
                        Vue.$toast(res.msg);
                    }
                });
            },
            /**
             * 按钮禁用
             * @returns {boolean}
             */
            disabled(type) {
                if (type === 'code') {
                    return !(/^1\d{10}$/.test(this.tel) && this.waiting == 0)
                } else if (type === 'step1') {
                    return !(/^1\d{10}$/.test(this.tel) && /\d{4}/.test(this.code))
                } else if (type === 'step2') {
                    return !(/\S{6,16}/.test(this.pwd) && this.pwd === this.pwd2);
                }
                return true;
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