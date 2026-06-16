(function(){
    function initFor(el){
        if(!el || el._flatpickr) return;
        try{
            if(typeof flatpickr === 'function'){
                flatpickr(el, { allowInput:true, dateFormat: 'd.m.Y', clickOpens:true });
            }
        }catch(e){/* ignore */}
    }

    function attachToExisting(){
        document.querySelectorAll('input.date-picker').forEach(initFor);
    }

    const mo = new MutationObserver(muts => {
        for(const m of muts){
            for(const node of m.addedNodes){
                if(!(node instanceof Element)) continue;
                if(node.matches && node.matches('input.date-picker')) initFor(node);
                node.querySelectorAll && node.querySelectorAll('input.date-picker').forEach(initFor);
            }
        }
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
