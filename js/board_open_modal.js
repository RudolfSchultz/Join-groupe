// ── Open / Close Modal ─────────────────────────────────────────────────────────

async function openAddTaskModal(status = 'todo') {
    modalDefaultStatus = status || 'todo';
    showModalOverlay();
    if (modalContacts.length === 0) modalContacts = await loadAssignContacts();
    clearModalTaskForm();
    setMinModalDueDate();
    document.addEventListener('click', handleModalOutsideClick, true);
    try { document.body.classList.add('dialog-open'); } catch (e) { /* ignore */ }
}


function showModalOverlay() {
    const overlay = document.getElementById('add-task-overlay');
    if (!overlay) return;
    if (typeof overlay.showModal === 'function') {
        try { overlay.showModal(); } catch (e) { /* ignore if already open */ }
        overlay.addEventListener('cancel', closeAddTaskModal);
    } else {
        overlay.classList.remove('d-none');
    }
}


function closeAddTaskModal(event) {
    if (event && event.target.id !== 'add-task-overlay') return;
    closeModalOverlay();
    clearModalTaskForm();
    try { document.removeEventListener('click', handleModalOutsideClick, true); } catch (e) { /* ignore */ }
}


function closeModalOverlay() {
    const overlay = document.getElementById('add-task-overlay');
    if (!overlay) return;
    if (typeof overlay.close === 'function') {
        try { overlay.close(); } catch (e) { /* ignore */ }
        try { overlay.removeEventListener('cancel', closeAddTaskModal); } catch (e) { /* ignore */ }
    } else {
        overlay.classList.add('d-none');
    }
    try { document.body.classList.remove('dialog-open'); } catch (e) { /* ignore */ }
}


function handleModalOutsideClick(event) {
    if (!event.target.closest('#modal-assign-select')) closeModalAssignDropdown();
    if (!event.target.closest('#modal-category-select')) closeModalCategoryDropdown();
}


function setMinModalDueDate() {
    const today = new Date().toISOString().split('T')[0];
    const input = document.getElementById('modal-task-due');
    if (input) input.setAttribute('min', today);
}