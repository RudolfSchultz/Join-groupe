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
        document.querySelectorAll('input[type="date"], input.date-picker').forEach(initFor);
    }

    const mo = new MutationObserver(muts => {
        for(const m of muts){
            for(const node of m.addedNodes){
                if(!(node instanceof Element)) continue;
                if(node.matches && (node.matches('input[type="date"]') || node.matches('input.date-picker'))) initFor(node);
                node.querySelectorAll && node.querySelectorAll('input[type="date"], input.date-picker').forEach(initFor);
            }
        }
    });

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', () => { attachToExisting(); mo.observe(document.body, { childList:true, subtree:true }); });
    } else {
        attachToExisting(); mo.observe(document.body, { childList:true, subtree:true });
    }

    window.attachDatepickers = attachToExisting;
})();
