(function(){
    function initFor(el){
        if(!el || el._flatpickr) return;
        try{
            if(typeof flatpickr === 'function'){
                flatpickr(el, { allowInput:true, dateFormat: 'd.m.Y', clickOpens:true });
            }
        }catch(e){/* ignore */}
    }

    let _scheduled = null;
    function runAttach() {
        _scheduled = null;
        try {
            document.querySelectorAll('input.date-picker').forEach(initFor);
        } catch (e) {
            console.error('attachDatepickers error', e);
        }
    }

    function scheduleAttach(delay = 50) {
        if (_scheduled) return;
        const runner = () => runAttach();
        if (typeof requestIdleCallback === 'function') {
            _scheduled = requestIdleCallback(runner, { timeout: 200 });
        } else {
            _scheduled = setTimeout(runner, delay);
        }
    }

    function attachToExisting(){
        // schedule a batched attach to avoid blocking click handlers
        scheduleAttach();
    }

    const mo = new MutationObserver(muts => {
        // schedule a single batched attach when mutations occur
        scheduleAttach(100);
    });

    function startObserverAndAttach(){
        attachToExisting();
        mo.observe(document.body, { childList:true, subtree:true });
    }

    function waitForFlatpickrAndInit(retries = 50, delay = 100){
        if (typeof flatpickr === 'function') { startObserverAndAttach(); return; }
        if (retries <= 0) { startObserverAndAttach(); return; }
        setTimeout(() => waitForFlatpickrAndInit(retries - 1, delay), delay);
    }

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', () => { waitForFlatpickrAndInit(); });
    } else {
        waitForFlatpickrAndInit();
    }

    window.attachDatepickers = attachToExisting;
})();
