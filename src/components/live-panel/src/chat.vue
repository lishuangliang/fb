<template>
    <div class="chat" v-show="rendered">
        <input type="text" placeholder="说点什么吧..." v-model="message">
        <button v-tap @tap="send()">发送</button>
    </div>
</template>
<style>
</style>
<script>
    export default {
        name: 'chat-panel',
        props: ['room', 'rendered'],
        data() {
            return {
                message: ''
            }
        },
        watch: {
            rendered() {
                if (this.rendered) {
                    this.$nextTick(function () {
                        this.$el.querySelector('input').focus();
                    });
                } else {
                    this.message = '';
                }
            }
        },
        methods: {
            send() {
                let content = this.message.trim();
                if (content === '') return Vue.$toast('聊天内容不能为空！');

                this.$emit('hide');

                if (Vue.$fenbei.user.guest) {
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
                } else {
                    Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/live_BarrageLive.ss`, {
                        u: Vue.$fenbei.user.key,
                        r: this.room.roomid,
                        type: 0,
                        content: content
                    }, {
                        then: () => {
                            //打印聊天信息

                            if(Vue.$fenbei.user.hide){
                                this.dispatch('live-panel', 'message', {
                                    nickname: '神秘人',
                                    level: 0,
                                    content: content
                                });
                            }else{
                                this.dispatch('live-panel', 'message', {
                                    nickname: Vue.$fenbei.formatText(Vue.$fenbei.user.nickname),
                                    level: Vue.$fenbei.user.level,
                                    content: content
                                });
                            }

                        },
                        catch: (res) => Vue.$toast(res.msg)
                    });
                }
            }
        }
    }
</script>
