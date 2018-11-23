<template>
    <transition name="fade">
        <div class="u-dialog u-dialog-indicator" v-show="visible">
            <div class="dialog-wrapper">
                <div class="u-indicator">
                    <div class="indicator-spin">
                        <div class="indicator-snake"></div>
                    </div>
                    <span class="indicator-text" v-show="text">{{text}}</span>
                </div>
            </div>
            <div class="dialog-mask" @touchmove.stop.prevent></div>
        </div>
    </transition>
</template>
<style>
</style>
<script>
    export default {
        name: 'indicator',
        data: function () {
            return {
                text: '',
                visible: false
            }
        }
    };
</script>
