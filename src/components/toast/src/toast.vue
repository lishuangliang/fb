<template>
    <toast-box :effect="effect" :dialog-class="dialogClass" :rendered="rendered">
        <div class="u-toast" :class="customClass">
            <i class="toast-icon" :class="iconClass" v-show="iconClass !== ''"></i>
            <span class="toast-text">{{message}}</span>
        </div>
    </toast-box>
</template>
<style>
</style>
<script>
    import dialog from '../../dialog';

    export default {
        name: 'toast',
        data: function () {
            return {
                rendered: false,
                effect: 'fade',
                dialogClass: 'u-dialog-toast',
                message: '',
                className: '',
                position: 'middle',
                iconClass: ''
            }
        },
        computed: {
            customClass() {
                var classes = [];
                switch (this.position) {
                    case 'top':
                        classes.push('s-place-top');
                        break;
                    case 'bottom':
                        classes.push('s-place-bottom');
                        break;
                    default:
                        classes.push('s-place-middle');
                }
                classes.push(this.className);
                return classes.join(' ');
            }
        },
        components: {
            'toast-box': dialog
        }
    };
</script>
