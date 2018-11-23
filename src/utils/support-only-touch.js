//判断当前设备是否支持touch事件
export default ('ontouchstart' in window) && /mobile|tablet|ip(ad|hone|od)|android/i.test(navigator.userAgent);