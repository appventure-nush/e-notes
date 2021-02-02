window.GEBI = id => document.getElementById(id);
window.qs = tag => document.querySelector(tag);
window.qsa = tag => document.querySelectorAll(tag);
const listenerCache = {};
window.addChangeListener = function (el, ov, gt, tg) {
    if (typeof gt !== 'function') tg = [gt, gt = tg][0];
    if (!gt) gt = el => el.value;
    if (!tg) tg = el;
    if (listenerCache[el.id]) el.removeEventListener('change', listenerCache[el.id]);
    if (tg.classList.contains('changed')) tg.classList.remove('changed');
    el.addEventListener('change', listenerCache[el.id] = () => {
        if (!tg.classList.contains('changed') && ov !== gt(el)) tg.classList.add('changed');
        else if (tg.classList.contains('changed') && ov === gt(el)) tg.classList.remove('changed');
    });
}
window.clearChangeListener = function (el) {
    if (listenerCache[el.id]) el.removeEventListener('change', listenerCache[el.id]);
}