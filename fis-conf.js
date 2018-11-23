const os = require('os');
function getIP() {
    var iptable = {},
        ifaces = os.networkInterfaces();
    for (let dev in ifaces) {
        ifaces[dev].forEach(function (details, alias) {
            if (details.family == 'IPv4') {
                iptable[dev + (alias ? ':' + alias : '')] = details.address;
            }
        });
    }
    return iptable;
}

//补充fis3对inline html a标签等元素的定位
//修改fis3对inline svg to base64, update to svg element
//对开发标记进行清理
fis.match('*', {
    preprocessor: fis.plugin('project', {
        release: 0,
        env: 0
    })
});
//设置成本地ip
let ips = getIP();
fis.set('livereload.hostname', ips['en0:1'] || ips['无线网络连接 2:1'] || '127.0.0.1');