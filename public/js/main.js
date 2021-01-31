window.GEBI = id => document.getElementById(id);
window.qs = tag => document.querySelector(tag);
window.qsa = tag => document.querySelectorAll(tag);
const listenerCache = {};
window.addChangeListener = function (el, ov, gt = el => el.value, tg = el) {
    if (typeof gt !== 'function') [tg, gt] = [gt, tg];
    if (listenerCache[el.id]) el.removeEventListener('change', listenerCache[el.id]);
    if (tg.classList.contains('changed')) tg.classList.remove('changed');
    el.addEventListener('change', listenerCache[el.id] = () => {
        if (!tg.classList.contains('changed') && ov !== gt(el)) tg.classList.add('changed');
        else if (tg.classList.contains('changed') && ov === gt(el)) tg.classList.remove('changed');
    });
}

// the above code is just to make code shorter