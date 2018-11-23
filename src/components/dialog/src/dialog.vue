<template>
    <transition :name="effect" @after-leave="afterLeave">
        <div class="u-dialog" :class="dialogClass" v-if="rendered">
            <div class="dialog-wrapper">
                <slot></slot>
            </div>
            <div class="dialog-mask" @touchmove.stop.prevent></div>
        </div>
    </transition>
</template>
<style>
</style>
<script>
    export default {
        name: 'dialog-box',
        props: {
            rendered: {
                type: Boolean,
                default: false
            },
            effect: {
                type: String,
                default: 'bounce'
            },
            dialogClass: {
                type: String,
                default: ''
            }
        },
        methods: {
            afterLeave() {
                this.$destroy(); //动画结束 立即摧毁
                document.body.removeChild(this.$el);
            }
        }
    };
</script>
