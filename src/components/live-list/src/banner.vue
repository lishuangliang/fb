<template>
    <div class="m-banner" v-show="banners.length > 0" :style="bannerImage">
        <a class="item" :href="banner.webUrl" v-for="banner in banners">
            <img :src="banner.imgUrl">
        </a>
        <ul class="islider-dot f-wsn" v-show="sliderInit">
            <li :class="{'z-sel': index == sliderIndex}" v-for="(obj, index) in banners"></li>
        </ul>
    </div>
</template>
<style>
</style>
<script>
    export default {
        props: {
            banners: {
                type: 'Array',
                required: true
            }
        },
        data() {
            return {
                slider: null, //islider对象
                sliderIndex: 0, //islider 选中下标
                sliderInit: false //islider 初始化成功
            }
        },
        computed: {
            bannerImage() {
                return this.banners.length > 0 ? `background-image: url("${this.banners[this.sliderIndex].imgUrl}");` : '';
            }
        },
        mounted() {
            require([__uri('/js/iSlider.js')], (iSlider) => {
                this.$nextTick(function () {
                    if (this.banners.length > 0) {
                        this.slider = new iSlider({
                            dom: this.$el,
                            data: Array.prototype.slice.call(this.$el.querySelectorAll('.item')).map(function (el) {
                                return {
                                    content: el
                                }
                            }),
                            isLooping: true,
                            isAutoplay: true,
                            duration: 3 * 1000
                        });
                        this.slider.on('slideChanged', (index) => this.sliderIndex = index);
                        this.sliderInit = true;
                    }
                });
            });
        },
        beforeDestroy() {
            if (this.slider) this.slider.destroy(); //摧毁islider
        }
    }
</script>
