<template>
    <nav class="m-navbar">
        <router-link v-show="guest" class="login" to="login">登陆</router-link>
        <a v-show="!guest" class="login" v-tap.prevent @tap="logout()">注销</a>
        <router-link class="pay" to="pay">充值</router-link>
        <!--<router-link class="download" to="download">立即下载</router-link>-->
        <router-link class="download" to="download">立即下载</router-link>
    </nav>
</template>
<style>
</style>
<script>
    export default {
        data() {
            return {
                guest: Vue.$fenbei.user.guest
            }
        },
        methods: {
            logout() {
                this.guest = true;
                Vue.$fenbei.resetUserInfo();
            }
        }
    }
</script>
