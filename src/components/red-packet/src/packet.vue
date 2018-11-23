<template>
    <div class="m-packet" v-show="number != -1">
        <div class="number number1" v-if="number === 3"></div>
        <div class="number number2" v-if="number === 2"></div>
        <div class="number number3" v-if="number === 1"></div>
        <div class="packet" v-show="renderedPacket">
            <div class="button" v-tap @tap="open()"></div>
        </div>
        <div class="openHB" v-show="renderedOpenHB">
            <div class="openHB_bot"></div>
            <div class="bg">
                <img src="http://www.fenbei.com/html/banners/christmas/images/share_logo.jpg" class="logo" />
                <p>来自163888</p>
                <p>恭喜你获得现金红包</p>
                <div class="btn-openHB" v-tap @tap="openResult()"></div>
            </div>
        </div>
        <div class="result" v-show="renderedResult">
            <div class="hb_bg">
                <p>手气太好了！恭喜获得</p>
                <span><i>8.00</i>元</span>
                <!--<a href="http://www.fenbei.com/mobile/login?name=download" class="btn_dn">下载APP提现</a>-->
                <a class="btn_dn" v-tap @tap="download()">下载APP提现</a>
                <div class="icon_close" v-tap @tap="close()"></div>
            </div>

        </div>
    </div>
</template>

<style>
</style>
<script>
    import animationend from '../../../ployfill/animationend';

    export default{
        data() {
            return {
                number: -1,
                renderedPacket: false,
                renderedOpenHB : false,
                renderedResult: false
            }
        },
        methods: {
            open() {
                this.renderedPacket = false;
                //this.renderedResult = true;
                this.renderedOpenHB = true;

            },
            openResult (){
                var oBtn = this.$el.querySelector('.btn-openHB');
                var openHB = this.$el.querySelector('.openHB');
                oBtn.classList.add('hasClick');
                openHB.classList.add('active');
//                oBtn.addEventListener('webkitAnimationend',function(){
//                    this.renderedOpenHB = false;
//                    this.renderedResult =  true;
//                },false);

                animationend(oBtn,() => this.nearestClose());
            },

            nearestClose(){
                this.renderedOpenHB  =  false ;
                this.renderedResult =  true;
            },

            close(){
                this.renderedResult = false;
                this.number = -1;
            },
            countdown() {
                if (this.number > 1) {

                    this.$nextTick(function () {
                        animationend(this.$el.querySelector('.number'), () => this.countdown());
                    });
                    this.number--;
                } else {
                    this.renderedPacket = true;
                    this.number = 0;
                }
            },

            /*路由跳转*/
            download(){
                this.$router.replace({name: 'download'});
            }
        },
        created() {
            setTimeout(() => {
                try {
                    sessionStorage.setItem('SHOW_RED_PACKET', true);
                } catch (e) {

                }
                this.number = 4;
                this.countdown();
            }, 5 * 1000);
        }
    }
</script>
