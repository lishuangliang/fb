<template>
    <transition name="fade-in">
        <section class="m-live-panel">
            <chat-panel :rendered="renderedChat" :room="room" @hide="renderedChat = false" ref="chat"></chat-panel>
            <gift-panel :rendered="renderedGift" :room="room" @hide="renderedGift = false" ref="gift"></gift-panel>
            <div class="ceiling" v-show="renderedChat || renderedGift" v-tap.stop @tap="hideComponent()"></div>
            <nav class="nav">
                <div class="anchor f-wsn">
                    <img class="avatar" :src="formatImageUrl(room.headimg, 72)">
                    <section class="number">
                        直播Live<br/>{{playNumber === 0 ? '...' : playNumber}}
                    </section>
                </div>
                <div class="audience" v-show="users.length > 0">
                    <div class="list f-wsn" :style="listWidth">
                        <div class="img-con" v-for="u of users"><img :src="formatImageUrl(u.headimg, 72)" ></div>
                    </div>
                </div>
                <div class="info">
                    <div class="gold"><span class="tag">贝壳</span>{{room.gold}}</div>
                    <div class="rank" v-show="rank > 0">热{{rank}}</div>
                    <div class="uid">分贝ID: {{room.id}}</div>
                </div>
            </nav>
            <div class="message">
                <ul class="list f-wwb">
                    <li class="item" v-for="msg of messages">
                        <i class="icon-level" :class="'level-' + msg.level"></i>
                        <span class="name" v-html="msg.nickname + ':'"></span>
                        <span class="content f-cb" v-html="msg.content"></span>
                    </li>
                </ul>
            </div>
            <div class="button">
                <a class="btn-chat f-wsn" v-tap @tap="renderedChat = true">打个招呼吧~</a>
                <a class="btn-give" v-tap @tap="renderedGift = true"></a>
                <a class="btn-close" v-tap @tap="$emit('back')"></a>
            </div>
            <div class="praise-area" v-tap.stop @tap="praise()"></div>
            <div class="container"></div>
        </section>
    </transition>
</template>
<style>
</style>
<script>
    import chatPanel from './chat.vue';
    import giftPanel from './gift.vue';
    import Animator from '../../../modules/animator';

    export default {
        name: 'live-panel',
        props: ['room'],
        beforeDestroy() {
            clearInterval(this.timer); //停掉计时器
        },
        data() {
            return {
                messages: [], //消息队列
                users: [], //在线用户队列
                rank: 0, //热门排名
                playNumber: 0, //在线人数
                praiseType: Math.floor(Math.random() * 12), //点赞气泡类型
                hasPraise: false,//自己是否点赞
                renderedChat: false, //是否展示聊天输入框
                renderedGift: false, //是否显示礼物赠送框
                timer: null //刷新计时器
            }
        },
        asyncData(resolve) {
            this.loadUserData(resolve); //获取数据
        },
        watch: {
            messages() {
                //监听消息的数量 保证消息队列不超过20条
                if (this.messages.length >= 30) this.messages.splice(0, 9);
                this.$nextTick(function () {
                    let el = this.$el.querySelector('.message');
                    el.scrollTop = el.scrollHeight;
                });
            }
        },
        methods: {
            /**
             * 获取在线用户数据
             * @param {Function} callback 回调函数 用于asyncData
             */
            loadUserData(callback) {
                Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/live_Users.ss`, {
                    r: this.room.roomid,
                    p: 1,
                    pt: Vue.$fenbei.pt
                }, (res) => {
                    if (typeof callback == "function") {
                        callback({
                            users: res.data.viewers,
                            rank: res.data.hotRank,
                            playNumber: res.data.playnum
                        });
                    } else {
                        this.users = res.data.viewers;
                        this.rank = res.data.hotRank;
                        this.playNumber = res.data.playnum;
                    }
                });
            },
            /**
             * 点赞
             */
            praise() {
                if (this.animator) {
                    this.animator.bubble(this.praiseType); //点赞气泡

                    //输出信息
                    if (!this.hasPraise) {
                        this.hasPraise = true;
                        if(Vue.$fenbei.user.hide){
                            this.messages.push({
                                nickname: '神秘人',
                                level: 0,
                                content: `点亮了 <i class="icon-bubble s-min bubble-${this.praiseType}"></i>`
                            }); //用户进入房间欢迎词
                        }else{
                            this.messages.push(Object.freeze({
                                nickname: Vue.$fenbei.formatText(Vue.$fenbei.user.nickname),
                                level: Vue.$fenbei.user.level,
                                content: `点亮了 <i class="icon-bubble s-min bubble-${this.praiseType}"></i>`
                            }));
                        }

                    }

                    if (!Vue.$fenbei.user.guest) {
                        //提交点赞
                        Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/live_Praise.ss`, {
                            u: Vue.$fenbei.user.key,
                            r: this.room.roomid,
                            type: this.praiseType,
                            pt: Vue.$fenbei.pt
                        });
                    }
                }
            },
            /**
             * 隐藏组件
             */
            hideComponent() {
                if (this.renderedChat) {
                    this.renderedChat = false;
                    this.$refs.chat.$emit('blur');
                } else {
                    this.renderedGift = false;
                }
            },
            formatImageUrl: (url, size) => Vue.$fenbei.formatImageUrl(url, size)
        },
        computed: {
            listWidth() {
                return `width:${this.users.length * 38 - 6}px`;
            }
        },
        created() {
            function loadGiftCss() {
                let link = document.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.id = 'js_gift_styles';
                link.href = __uri('/css/gift.css');
                document.getElementsByTagName("head")[0].appendChild(link);
            }

            //加载礼物css样式
            if (!document.getElementById('js_gift_styles')) loadGiftCss();
        },
        mounted() {
            if (!Vue.$fenbei.user.guest) {
                if(Vue.$fenbei.user.hide){
                    this.messages.push({
                        nickname: '神秘人',
                        level: 0,
                        content: '来了'
                    }); //用户进入房间欢迎词
                }else{
                    this.messages.push({
                        nickname: Vue.$fenbei.formatText(Vue.$fenbei.user.nickname),
                        level: Vue.$fenbei.user.level,
                        content: '来了'
                    }); //用户进入房间欢迎词
                }

            }

            this.animator = new Animator(this.$el.querySelector('.container')); //动画绘制者
            this.$on('animate', (type, data) => this.animator[type](data)); //绘制 气泡 礼物等动画
            this.$on('message', (message) => this.messages.push(message)); //打印消息
            this.$on('gold', (gold) => this.room.gold = gold); //更新主播的贝壳数量
            this.$on('chat', (type, content) => {
                if (type == 0) { //普通消息
                    this.messages.push(Object.freeze({
                        nickname: Vue.$fenbei.formatText(Vue.$fenbei.user.nickname),
                        level: Vue.$fenbei.user.level,
                        content: content
                    }));
                }
            }); //聊天
            this.timer = setInterval(() => this.loadUserData(), 30 * 1000); //每30秒刷新一次
        },
        components: {
            chatPanel,
            giftPanel
        }
    }
</script>
