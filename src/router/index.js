import {sessionStorage} from '../ployfill/storage';
import assign from '../ployfill/Object.assign';

export default function (VueRouter) {
    //创建router
    const routes = [{
        path: '/mobile/list',
        name: 'list',
        meta: {title: '分贝直播 - 专注音乐直播平台'},
        component: resolve => require([__uri('/js/views/list.js')], resolve)
    }, {
        path: '/mobile/pay',
        name: 'pay',
        meta: {title: '我的账户'},
        component: resolve => require([__uri('/js/views/pay.js')], resolve)
    }, {
        path: '/mobile/login',
        name: 'login',
        meta: {title: '登录'},
        component: resolve => require([__uri('/js/views/login.js')], resolve)
    }, {
        path: '/mobile/register',
        name: 'register',
        meta: {title: '手机注册'},
        component: resolve => require([__uri('/js/views/sign.js')], resolve)
    }, {
        path: '/mobile/find',
        name: 'find',
        meta: {title: '找回密码'},
        component: resolve => require([__uri('/js/views/sign.js')], resolve)
    }, {
        path: '/mobile/live/:id',
        name: 'live',
        meta: {title: '正在进入直播间...'},
        component: resolve => require([__uri('/js/views/live.js')], resolve)
    },{
        path: '/mobile/download',
        name: 'download',
        meta: {title: '分贝下载'},
        component: resolve => require([__uri('/js/views/download.js')], resolve)
    }, {
        path: '*',
        redirect: '/mobile/list' //所以未定义的路由都重定向至list
    }];

    const router = new VueRouter({
        routes,
        /*<remove trigger="@release == 0" alt="开发环境使用hash模式，正式环境使用history模式">*/
        mode: 'history'
        /*</remove>*/
        // scrollBehavior: (to, from, savedPosition) => to.name === 'List' && savedPosition ? savedPosition : {x: 0, y: 0}
    });

    //路由跳转前处理微信客户端的问题
    router.beforeEach((to, from, next) => {
        document.title = to.meta.title || document.title; //设置标题

        try {
            //存储推广token
            if (to.query.fbtoken) {
                let token = decodeURIComponent(to.query.fbtoken);
                sessionStorage.setItem('fb_token', decodeURIComponent(token));
                //存储家族推广token
                if (to.name === 'list' && to.query.type != 'generalize') {
                    sessionStorage.setItem('fb_family_token', decodeURIComponent(token));
                }
            }
        } catch (e) {
            //无痕模式会引发错误
        }

        if (/^login|register|find/.test(to.name) && /micromessenger/i.test(navigator.userAgent)) {
            //微信中不存在登录，注册以及找回密码操作 只能通过微信授权
            let uri;

            /*<remove trigger="@release == 0" alt="正式环境">*/
            uri = encodeURIComponent(`${Vue.$fenbei.WEB_HOST}/wx/redirectLoginwx.ss?url=${Vue.$fenbei.WEB_HOST + (from.name ? from.path : '/mobile/list')}?origin=${encodeURIComponent(JSON.stringify(to.query || {}))}`);
            /*</remove>*/
            /*<remove trigger="@release == 1" alt="测试环境">*/
            uri = encodeURIComponent(`${Vue.$fenbei.WEB_HOST}/wx/redirectLoginwx.ss?url=http://${location.host + `/%23${from.name ? from.path : '/mobile/list'}`}?origin=${encodeURIComponent(JSON.stringify(to.query || {}))}`);
            /*</remove>*/

            window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx981b612434816ab9&redirect_uri=${uri}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
        } else if (/^qq|sina|weixin|generalize$/.test(to.query.type) && (to.query.token || to.query.fbtoken)) {
            Vue.$indicator.open(`第三方登录`);  //授权登录提示

            let formData = assign({
                pt: Vue.$fenbei.pt,
                c: Vue.$fenbei.channelid,
                deviceid: Vue.$fenbei.deviceid,
                us: 'appid',
                appid: {
                    'qq': '101316488',
                    'sina': '2579951765',
                    'wx': 'wx981b612434816ab9'
                }[to.query.type] || ''
            }, to.query);
            formData.name = decodeURIComponent(formData.name); //解码
            if (to.query.type !== 'generalize') formData.fbtoken = sessionStorage.getItem('fb_token'); //非推广商传递推广id

            //调用第三方登录接口
            Vue.$fenbei.api(`${Vue.$fenbei.API_HOST}/${to.query.type === 'generalize' ? 'user_GeneralizeLogin.ss' : 'user_ExternalLogin.ss'}`, formData, {
                then: (res) => {
                    res.data.user.openid = to.query.openid || ''; //openid
                    Vue.$fenbei.refreshUserInfo(res.data); //刷新用户信息

                    let origin = JSON.parse(decodeURIComponent(to.query.origin || '%7B%7D')), //获取请求源传递的信息
                        route = {query: {}};

                    //从url继承
                    ['forbid'].forEach(function (key) {
                        if (origin[key]) route.query[key] = origin[key];
                    });

                    // //第三方登录成功后重定向
                    if (!/^generalize$/.test(to.query.type)) {
                        if (origin.name) {
                            route.name = origin.name;
                        } else if (origin.path) {
                            route.path = decodeURIComponent(origin.path); //跳转到来源地址
                        } else if (!/^weixin/.test(to.query.type)) {
                            route.name = 'list';
                        } else {
                            route.path = to.path;
                        }
                    } else {
                        route.path = to.path;
                    }

                    next(route);
                },
                catch: (res) => {
                    Vue.$alert(res.msg);
                    next(to.name !== 'live' ? to.path : {name: 'list'});
                }
            });
        } else {
            Vue.$indicator.open(); //加载提示
            next();
        }
    });

    router.afterEach((to, from) => {
        if (from.name === 'live') Vue.$fenbei.setShareInfo(); //重置分享信息
        Vue.$indicator.close();
    });

    /*<remove trigger="@env == 1" alt="调试模式，可以通过函数调用跳转路由">*/
    for (let route of routes) {
        if (route.name && route.name !== 'live') window[route.name] = () => router.push({name: route.name});
    }
    window.user = Vue.$fenbei.user;
    window.clear = function () {
        localStorage.clear();
        sessionStorage.clear();
    };
    window.t = function () {
        router.push({
            name: 'login',
            query: {
                name: 'pay',
                forbid: '1'
            }
        })
    };
    /*</remove>*/

    return router;
}