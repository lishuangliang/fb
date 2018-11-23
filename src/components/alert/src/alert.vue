<template>
    <alert-box :effect="effect" :dialog-class="dialogClass" :rendered="rendered">
        <div class="u-alert" :class="className">
            <a class="close" v-tap @tap="close()"></a>
            <div class="content">
                <h2 class="alert-title" v-show="title">{{title}}</h2>
                <div class="alert-text" v-html="text"></div>
            </div>
            <div class="button" :class="buttonClass">
                <a v-tap @tap="tap(index)" v-for="(btn, index) of buttons">{{btn.text}}</a>
            </div>
        </div>
    </alert-box>
</template>
<style>
</style>
<script>
    import dialog from '../../dialog';

    export default{
        name: 'alert',
        data: function () {
            return {
                rendered: false,
                effect: 'bounce',
                dialogClass: 'u-dialog-alert',
                title: '',
                text: '',
                className: '',
                buttons: [{
                    'text': '确定',
                    'event': null
                }]
            }
        },
        methods: {
            close() {
                this.rendered = false;
            },
            tap(index) {
                if (typeof this.buttons[index].event === "function") {
                    if (this.buttons[index].event() !== false) {
                        this.rendered = false;
                    }
                } else {
                    this.rendered = false;
                }
            }
        },
        computed: {
            buttonClass() {
                return `s-btn-${this.buttons.length}`;
            }
        },
        components: {
            'alert-box': dialog
        }
    }
</script>
