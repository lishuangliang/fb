<template>
    <section class="u-page">
        <div class="u-loading" v-if="!rooms"></div>
        <section id="scroller" class="scroller" v-else>
            <live-banner :banners="banners"></live-banner>
            <live-rooms :rooms="rooms"></live-rooms>
        </section>
        <live-navbar></live-navbar>
    </section>
</template>
<style>
</style>
<script>
    import {banner, rooms, navbar} from '../components/live-list';

    export default {
        name: 'list',
        data() {
            return {
                banners: null,
                rooms: null
            }
        },
        asyncData(resolve) {
            let token = sessionStorage.getItem('fb_family_token');

            Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/${token ? 'live_FamilyRoomList.ss' : 'live_RoomList.ss'}`, {
                u: Vue.$fenbei.user.key,
                p: 1,
                type: 1,
                fbtoken: token
            }, {
                then: (res) => {
                    res.data.rooms = (res.data.familyrooms || []).concat(res.data.rooms); //房间列表合并
                    delete res.data.familyrooms; //移除数据节点

                    resolve(Object.freeze(res.data));
                },
                catch: (res) => {
                    Vue.$alert({
                        'text': '加载直播间列表失败，请刷新页面再试！',
                        buttons: [{
                            'text': '确定',
                            'event': () => window.location.reload()
                        }]
                    });
                }
            })
        },
        components: {
            'live-banner': banner,
            'live-rooms': rooms,
            'live-navbar': navbar
        }

    }
</script>
