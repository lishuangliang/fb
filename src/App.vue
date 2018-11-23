<template>
    <div id="app">
        <div class="u-loading" v-show="init"></div>
        <transition :name="effect">
            <router-view></router-view>
        </transition>
    </div>
</template>
<style>
</style>
<script>
    export default {
        data() {
            return {
                init: false,
                effect: 'slide-right'
            }
        },
        watch: {
            '$route' (to, from) {
                if (from.name) {
                    if (to.name === 'live' && from.name === 'list') {
                        this.effect = 'slide-up';
                    } else if (to.name === 'list' && from.name === 'live') {
                        this.effect = 'slide-down';
                    } else if ((/login/.test(to.name) && !/recharge|list|live/.test(from.name)) || (/recharge|list|live/.test(to.name) && /login|recharge|sign/.test(from.name))) {
                        this.effect = 'slide-left';
                    } else {
                        this.effect = 'slide-right';
                    }
                } else {
                    this.effect = '';
                }
            }
        },
        created() {
            Vue.$fenbei.setShareInfo(); //设置分享信息
        }
    }
</script>
