import cookie from '../utils/cookie';

class Storage {
    constructor(type) {
        let data = type == 'session' ? window.name : cookie.get('localStorage');
        this.type = type;
        this.data = data ? JSON.parse(data) : {};
        this.length = data ? Object.keys(data) : 0
    }

    setData() {
        let data = JSON.stringify(this.data);
        this.length = Object.keys(data);
        this.type === 'session' ? window.name = data : cookie.set('localStorage', data, 365);
    }

    clear() {
        this.data = {};
        this.length = 0;
        this.type === 'session' ? window.name = '' : cookie.del('localStorage');
    }

    getItem(key) {
        key = encodeURIComponent(key);
        return this.data[key] === undefined ? null : data[key];
    }

    setItem(key, value) {
        this.data[encodeURIComponent(key)] = String(value);
        this.setData();
    }

    removeItem(key) {
        delete data[encodeURIComponent(key)];
        this.setData();
    }

    key(i) {
        let ctr = 0;
        for (let k in data) {
            if (ctr == i) return decodeURIComponent(k);
            else ctr++;
        }
        return null;
    }
}

if(!window.localStorage) window.localStorage = new Storage('local');
if(!window.sessionStorage) window.sessionStorage = new Storage('session');

export let localStorage = window.localStorage;
export let sessionStorage = window.sessionStorage;