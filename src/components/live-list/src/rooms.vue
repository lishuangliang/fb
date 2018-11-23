<template>
    <div class="m-rooms">
        <ul class="list">
            <li class="item" v-for="room of rooms"
                v-lazy:background-image.scroller="formatImageUrl(room.headimg, 316)">
                <router-link class="link" :to="'/mobile/live/' + room.id + '?roomid='+ room.roomid">
                    <span class="tag">直播中</span>
                    <div class="name f-toe" v-html="formatText(room.nickname)"></div>
                    <span class="count f-wsn">{{room.playnum}}人</span>
                </router-link>
            </li>
        </ul>
    </div>
</template>
<style>
</style>
<script>
    import vLazy from '../../../directives/lazyload';

    export default {
        props: {
            rooms: {
                type: 'Array',
                required: true
            }
        },
        methods: {
            formatImageUrl: (url, size) => Vue.$fenbei.formatImageUrl(url, size),
            formatText: (text) => Vue.$fenbei.formatText(text)
        },
        directives: {
            'lazy': vLazy()
        }
    }
</script>
