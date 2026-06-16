(function(){
    function initFor(el){
        if(!el || el._flatpickr) return;
        try{
            if(typeof flatpickr === 'function'){
                flatpickr(el, {
                    allowInput: true,
                    dateFormat: 'd.m.Y',
                    clickOpens: true,
                    disableMobile: true   // ← verhindert natives Mobile-Datepicker-Overlay
                });
            }
        }catch(e){/* ignore */}
    }

    function runAttach() {
        try {
            document.querySelectorAll('input.date-picker').forEach(initFor);
        } catch (e) {
            console.error('attachDatepickers error', e);
        }
    }

    // ← Lock entfernt: jeder MutationObserver-Aufruf darf schedulen
    function scheduleAttach(delay = 50) {
        setTimeout(runAttach, delay);
    }

    const mo = new MutationObserver(() => scheduleAttach(100));

    function startObserverAndAttach(){
        runAttach();
        mo.observe(document.body, { childList: true, subtree: true });
    }

    function waitForFlatpickrAndInit(retries = 50, delay = 100){
        if (typeof flatpickr === 'function') { startObserverAndAttach(); return; }
        if (retries <= 0) { startObserverAndAttach(); return; }
        setTimeout(() => waitForFlatpickrAndInit(retries - 1, delay), delay);
    }

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', () => waitForFlatpickrAndInit());
    } else {
        waitForFlatpickrAndInit();
    }

    window.attachDatepickers = runAttach;
})();