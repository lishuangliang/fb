<template>
    <section class="u-page"></section>
</template>
<style>
</style>
<script>
    export default {
        name: 'pay',
        data() {
            return {
                forbid: !this.$route.query.forbid, //隐藏返回列表按钮
                wx: /micromessenger/i.test(navigator.userAgent), //是否是微信客户端
                android : /android/i.test(navigator.userAgent),  //是否是安卓
                ios : /iphone|ipad|ipod/i.test(navigator.userAgent)  //是否是ios
            }
        },
        methods: {
            /**
             * 加载数据
             */
            init (){

                if(this.wx){
                    location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.decibel.fblive';
                }else{
                    if(this.android){
                        location.href = 'http://oss.fenbei.com/fenbei/download/fenbei-1.3.6.apk';
                    }else if(this.ios){
                        location.href = 'https://itunes.apple.com/cn/app/id1178889746';
                    }
                }

                this.$router.replace({name: 'list'});
            }
        },
        beforeRouteEnter(to, from, next) {
            //不允许游客进入该页面
            next(Vue.$fenbei.user.guest ? {
                name: 'login',
                query: {
                    name: 'download'
                }
            } : true);
        },
        created() {
            this.init();
        }
    }
</script>  