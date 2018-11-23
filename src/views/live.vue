<template>
    <section class="u-page">
        <div class="m-live-loading" v-if="state < 1" @touchstart="touchPlay()">
            <div class="u-poster s-blur" :style="poster"></div>
            <div v-show="state === 0" class="loading-spinner"></div>
            <div v-show="state === -1" class="play"></div>
            <a class="close" v-tap @tap="back()"></a>
        </div>
        <live-panel v-if="(state === 1 || state === 2) && roomInfo" :room="roomInfo" ref="panel"
                    @back="back()"></live-panel>
        <red-packet v-if="(state === 1 || state === 2) && roomInfo && showRedPacket"></red-packet>
        <div class="m-live-play" v-show="state === 2" @touchstart="touchPlay()"></div>
        <div class="m-live" v-if="state !== 3">
            <div class="u-poster s-blur" :style="poster"></div>
            <transition name="blur-in">
                <div v-show="state === 1 || state === 2" class="live">
                    <video id="js_live" :poster="blank" webkit-playsinline x-webkit-airplay playsinline
                           x5-video-player-type="h5" x5-video-player-fullscreen="true"></video>
                </div>
            </transition>
        </div>

        <div class="m-live-end" v-if="state === 3">
            <div class="u-poster s-black" :style="poster"></div>
            <div class="wrap">
                <h1 class="title">直播结束</h1>
                <img class="avatar" :src="roomInfo.headimg">
                <h3 class="name" v-html="formatText(roomInfo.nickname)"></h3>
                <ul class="number">
                    <li style="width: 100%">
                        {{liveInfo.gold || 0}}
                        <p>获得贝壳</p>
                    </li>
                </ul>
                <ul class="number">
                    <li style="width: 50%">
                        {{liveInfo.playnum || 0}}
                        <p>观看人数</p>
                    </li>
                    <li style="width: 50%">
                        {{liveInfo.praisenum || 0}}
                        <p>喜欢</p>
                    </li>
                </ul>
                <a class="link" v-tap @tap="back()">返回首页</a>
            </div>
        </div>
    </section>
</template>
<style>
</style>
<script>
    import panel from '../components/live-panel';
    import packet from '../components/red-packet';
    import Socket from '../modules/socket';

    const preventScroll = (e) => e.preventDefault();
    let player = null; //播放器对象
    export default {
        name: 'live',
        data() {
            return {

                showRedPacket: sessionStorage.getItem('SHOW_RED_PACKET') == null, //是否展示红包
                socket: null, //scoket对象
                roomId: null,//房间id
                roomInfo: null,//房间信息
                liveInfo: null, //直播信息
                state: -1, //状态 -1:准备就绪 0:加载中 1:直播中 2:暂停中 3:直播结束
                timer: null, //直播心跳计时器
                blank: 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==' //透明占位图
            }
        },
        computed: {
            /**
             * 直播间封面图
             * @returns {string}
             */
            poster() {
                return this.roomInfo ? `background-image: url("${Vue.$fenbei.formatImageUrl(this.roomInfo.headimg, 316)}");` : '';
            }
        },
        methods: {
            /**
             * 错误提示
             * @param msg 提示内容
             */
            error(msg) {
                Vue.$alert({
                    text: msg,
                    buttons: [{
                        'text': '确定',
                        'event': () => this.$router.push({'name': 'list'})
                    }]
                });
            },
            /**
             * 返回列表页面
             */
            back() {
                this.$router.push({name: 'list'});
            },
            /**
             * 初始化获取房间id
             * 1.读取url上的roomid
             * 2.根据主播id查询roomid
             * @param {Function} callback 回调
             */
            init(callback) {
                if (this.$route.query.roomid) {
                    callback(this.$route.query.roomid);
                } else {
                    Vue.$fenbei.api(`${Vue.$fenbei.WEB_HOST}/web/json/room_userroomid_j.ss`, {
                        uid: this.$route.params.id
                    }, {
                        then: (res) => {
                            callback(res.data.room.roomid);
                        },
                        catch: (res) => this.error(res.msg)
                    });
                }
            },
            /**
             * 用户登录
             * @param {Function} callback 回调
             */
            login(callback) {
                let guest = Vue.$fenbei.user.id == null;

                Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/${guest ? 'user_GuestLogin.ss' : 'user_AutoLogin.ss'}`, guest ? {
                    pt: Vue.$fenbei.pt
                } : {
                    u: Vue.$fenbei.user.key
                }, {
                    then: (res) => {
                        if (guest) {
                            Vue.$fenbei.user.key = res.data.key; //存储游客key
                        } else {
                            Vue.$fenbei.refreshUserInfo(res.data); //刷新用户信息
                        }
                        callback(res.data.servers);
                    },
                    catch: (res) => callback(null, res.msg)
                });
            },
            /**
             * 清除用户信息 跳转到登录页面
             */
            againLogin() {
                //重置掉用户信息
                Vue.$fenbei.resetUserInfo();
                //跳转到登录页面
                this.$router.push({
                    name: 'login',
                    query: {
                        path: encodeURIComponent(this.$route.path)
                    }
                });
            },
            /**
             * 开始播放直播视频
             */
            play() {
                let firstPlay = true; //是否是第一次触发播放

                //加载依赖项
                require([__uri('/js/video.js')], (videojs) => {
                    window.videojs = videojs;
                    require([__uri('/js/videojs-contrib-hls.js')], () => {
                        //加载依赖项成功
                        this.$nextTick(function () {
                            player = videojs('js_live', {
                                controls: false,
                                controlBar: false,
                                bigPlayButton: false,
                                textTrackSettings: false,
                                posterImage: false,
                                textTrackDisplay: false
                            }, () => {
                                player.on('playing', () => {
                                    if (firstPlay) {
                                        this.state = 1; //直播ing
                                        this.liveHeartbeat();
                                        firstPlay = false;
                                    }
                                });
                                player.on('pause', (e) => {
                                    this.state = 2;
                                });
                                player.src({type: "application/x-mpegURL", src: this.getLiveSource()});
                            });
                        });
                    });
                });
            },
            /**
             * 直播心跳监听
             */
            liveHeartbeat() {
                let currentTime = 0,
                    count = 0;

                this.timer = setInterval(() => {
                    if (this.state == 3) return clearInterval(this.timer); //直播结束 停掉心跳检测
                    if (currentTime === player.currentTime() && ++count == 10) {
                        player.src({type: "application/x-mpegURL", src: this.getLiveSource()});
                        player.play(); //重启直播
                        currentTime = 0;
                        count = 0;
                    }
                    currentTime = player.currentTime();
                }, 1000);
            },
            /**
             * 获取直播视频地址
             * @returns {string}
             */
            getLiveSource() {
                return this.roomId ? `http://pull.163888.net/live/${this.roomId}/playlist.m3u8?t=${Date.now()}` : '';
            },
            /**
             * 获取最优的socket连接
             * @param {Array} servers socket集合
             * @returns {string}
             */
            bestSocket(servers) {
                let count = 10000,
                    ws = '';

                servers.forEach(function (server) {
                    if (server.conns < count) {
                        count = server.conns;
                        ws = `ws://${server.waiip}:${server.websocketport}/websocket`;
                    }
                });

                return ws;
            },
            /**
             * 连接socket
             * @param {Array} servers socket集合
             */
            connection(servers) {
                let praise = {}, //已点赞
                    join = {}; //已进入房间

                const open = () => {
                    if (this.socket) {
                        this.socket.send(JSON.stringify({
                            data: {
                                roomid: this.roomId
                            },
                            head: {
                                cmd: 'UserCmd_UserLogin',
                                u: Vue.$fenbei.user.key,
                                guest: Vue.$fenbei.user.guest,
                                uid: Vue.$fenbei.user.id,
                                channelId: Vue.$fenbei.channelid,
                                deviceId: Vue.$fenbei.deviceid,
                                deviceType: 0,
                                vernum: 0
                            },
                            uid: Vue.$fenbei.user.id
                        }));
                        this.joinRoom();
                    }
                };

                this.socket = new Socket(this.bestSocket(servers)); //选取最优的链接
                this.socket.on('connect', open);
                this.socket.on('reconnect', open);
                this.socket.on('message', (packet) => {
                    if (packet.data.roomid != this.roomId || this.state !== 1 || !this.$refs.panel) return;

                    switch (packet.cmd) {
                        case 'RoomCmd_EndLive':
                            //直播结束
                            this.destroy();
                            this.state = 3;
                            this.liveInfo = {
                                gold: packet.data.gold,
                                playnum: packet.data.playnum,
                                praisenum: packet.data.praisenum
                            };
                            break;
                        case 'UserCmd_KickOut':
                            //重复登录
                            Vue.$alert({
                                text: '您的帐号已在别处登录，是否重新登录？',
                                buttons: [{
                                    'text': '确定',
                                    'event': () => this.againLogin()
                                }, {
                                    'text': '取消',
                                    'event': () => Vue.$fenbei.resetUserInfo() //重置掉用户信息
                                }]
                            });
                            break;
                        case 'GiftCmd_GiveGift':
                            //收到了礼物
                            packet.data.content = `送了一个${packet.data.name}`;
                            //刷新主播的贝壳数量
                            this.$refs.panel.$emit('gold', packet.data.gold);
                            this.$refs.panel.$emit('animate', 'gift', packet.data);
                            break;
                        case 'RoomCmd_Praise':
                            //点亮
                            if (!praise[packet.data.id]) {
                                packet.data.content = `点亮了 <i class="icon-bubble s-min bubble-${packet.data.type}"></i>`
                            }
                            //气泡
                            this.$refs.panel.$emit('animate', 'bubble', packet.data.type);
                            break;
                        case 'RoomCmd_JoinLive':
                            //进入房间
                            packet.data.content = '来了';
                            break;
                    }

                    if ((/GiftCmd_GiveGift|ChatCmd_RoomChat|RoomCmd_UserShare/.test(packet.cmd) || (packet.cmd === 'RoomCmd_Praise' && !praise[packet.data.id]) || (packet.cmd === 'RoomCmd_JoinLive') && !join[packet.data.id])) {
                        //告知message组件 消息追加
                        this.$refs.panel.$emit('message', Object.freeze({
                            nickname: this.formatText(packet.data.nickname),
                            level: packet.data.level,
                            content: this.formatText(packet.data.content)
                        }));
                        //存储已点赞用户列表 避免重复显示
                        if (packet.cmd === 'RoomCmd_Praise') praise[packet.data.id] = true;
                        //存储已进入直播间的普通用户列表 避免重复显示
                        if (packet.cmd === 'RoomCmd_JoinLive') join[packet.data.id] = true;
                    }
                });
            },
            /**
             * 加入房间
             */
            joinRoom() {
                Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/live_InOutLive.ss`, {
                    u: Vue.$fenbei.user.key,
                    r: this.roomId,
                    type: 1,
                    pt: Vue.$fenbei.pt
                }, {
                    then: (res) => {
                        document.title = `【${res.data.nickname}的直播间】 - ${res.data.subject}`; //更新标题
                        Vue.$fenbei.setShareInfo(`${res.data.nickname}的直播间`, res.data.subject, res.data.headimg); //设置分享信息

                        this.roomInfo = res.data; //初始化获取房间信息
                        if (res.data.roomstatus == 2) {
                            //直播已经结束
                            this.state = 3;
                            this.liveInfo = {
                                gold: res.data.gold,
                                playnum: res.data.playnum,
                                praisenum: res.data.praisenum
                            };
                        } else {

                        }
                    },
                    catch: (res) => this.error(res.msg)
                });
            },
            /**
             * 点击播放直播视频
             */
            touchPlay() {
                if (player) {
                    this.state = this.state === 2 ? 1 : this.state === -1 ? 0 : this.state;
                    player.play();
                }
            },
            /**
             * 摧毁卸载
             */
            destroy() {
                //摧毁播放器
                if (player) {
                    player.pause();
                    player.dispose();
                    player = null;
                }

                //关闭socket
                if (this.socket) {
                    this.socket.close();
                    this.socket = null;
                }

                clearInterval(this.timer); //停掉计时器
            },
            formatText: (text) => Vue.$fenbei.formatText(text)
        },
        beforeRouteEnter(to, from, next) {
            document.body.addEventListener('touchmove', preventScroll, false);
            next();
        },
        created() {
            this.init((roomId) => {
                this.roomId = roomId;
                this.$nextTick(() => {
                    this.play();
                    this.login((servers, msg) => {
                        if (servers) {
                            this.connection(servers); //登录成功 链接socket
                        } else {
                            Vue.$alert({
                                text: msg,
                                buttons: [{
                                    'text': '确定',
                                    'event': () => this.againLogin()
                                }]
                            });
                        }
                    });
                });
            });
        },
        beforeRouteLeave(to, from, next) {
            document.body.removeEventListener('touchmove', preventScroll);
            this.destroy();
            next();
        },
        components: {
            'live-panel': panel,
            'red-packet': packet
        }
    }
</script>