import assign from '../ployfill/Object.assign';
import Events from './events';

export default class Socket extends Events {
    constructor(server, options) {
        super();
        this.server = server;
        this.opts = assign({
            reconnection: true, //是否自动重新连接
            reconnectionDelay: 1000, //多长时间尝试新的前等待的时间 重新连接
            reconnectionDelayMax: 5000 //最长时间之间等待 重新连接
        }, options);
        this.readyState = WebSocket.CONNECTING;
        this.open();
    }

    open() {
        this.forcedClose = false; //强制关闭

        this.ws = new WebSocket(this.server);
        this.ws.onopen = () => {
            this.readyState = WebSocket.OPEN;
            this.reconnectCount > 0 ? this.trigger('reconnect', this.reconnectCount) : this.trigger('connect');
            this.reconnectCount = 0; //重连尝试次数
        };
        this.ws.onmessage = (e) => {
            this.trigger('message', typeof e.data === "string" ? JSON.parse(e.data) : e.data)
        };
        this.ws.onclose = () => {
            this.ws = null;
            this.trigger('disconnect'); //断开连接事件

            if (this.forcedClose) {
                this.readyState = WebSocket.CLOSED;
            } else {
                this.readyState = WebSocket.CONNECTING;

                setTimeout(() => {
                    this.trigger('reconnecting');  //正在重连事件
                    this.open(); //重连
                }, Math.min(this.opts.reconnectionDelay * (++this.reconnectCount), this.opts.reconnectionDelayMax));
            }
        };
        this.ws.onerror = (err) => this.trigger('error', err)
    }

    /**
     * 数据传输
     * @param {String|ArrayBuffer|Blob} data
     */
    send(data) {
        if (this.ws) {
            this.ws.send(data);
        } else {
            throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
        }
    }

    /**
     * 刷新连接
     */
    refresh() {
        if (this.ws) this.ws.close();
    }

    /**
     * 强制关闭socket连接
     * @param {Number} code 关闭代码 缺省:1000
     * @param {String} reason 关闭原因
     */
    close(code = 1000, reason) {
        this.forcedClose = true; //强制关闭
        if (this.ws) this.ws.close(code, reason);
    }
};