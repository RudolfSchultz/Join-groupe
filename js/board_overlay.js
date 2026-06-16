// ── Overlay ────────────────────────────────────────────────────────────────────

function openOverlay() {
    document.getElementById('board-overlay').classList.remove('d-none');
}


function closeOverlay() {
    document.getElementById('board-overlay').classList.add('d-none');
    clearOverlayContent();
    document.removeEventListener('click', handleEditAssignOutsideClick, true);
}


function clearOverlayContent() {
    document.getElementById('board-detail-box').innerHTML = '';
    document.getElementById('board-edit-box').innerHTML = '';
    document.getElementById('board-edit-box').classList.add('d-none');
    document.getElementById('board-detail-box').classList.remove('d-none');
}


function handleOverlayClick(event) {
    if (event.target.id === 'board-overlay') closeOverlay();
}


function openTaskDetail(id) {
    const task = allTasks.find(t => t.id == id);
    if (!task) return;
    document.getElementById('board-detail-box').innerHTML = taskDetailTemplate(task);
    document.getElementById('board-detail-box').classList.remove('d-none');
    document.getElementById('board-edit-box').classList.add('d-none');
    openOverlay();
}


// ── Delete Task ────────────────────────────────────────────────────────────────

async function deleteTask(id) {
    if (!confirm('Task wirklich löschen?')) return;
    allTasks = allTasks.filter(t => t.id != id);
    if (checkIsGuest()) {
        deleteTaskGuest();
    } else {
        await deleteTaskRemote(id);
    }
}


function deleteTaskGuest() {
    saveGuestTasks(allTasks);
    closeOverlay();
    displayTasks(allTasks);
}


async function deleteTaskRemote(id) {
    try {
        await fetch(`${BOARD_BASE_URL}/tasks/${id}.json`, { method: 'DELETE' });
        closeOverlay();
        displayTasks(allTasks);
    } catch (e) {
        console.error('Error deleting task:', e);
    }
}


// ── Subtasks ───────────────────────────────────────────────────────────────────

async function toggleSubtask(taskId, subtaskIndex) {
    const task = allTasks.find(t => t.id == taskId);
    if (!task || !task.subtasks) return;
    task.subtasks[subtaskIndex].done = !task.subtasks[subtaskIndex].done;
    await saveSubtaskState(taskId, task.subtasks);
    refreshTaskCard(taskId);
    refreshSubtaskChecks(task);
}


async function saveSubtaskState(taskId, subtasks) {
    if (checkIsGuest()) {
        saveGuestTasks(allTasks);
    } else {
        await updateSubtasksRemote(taskId, subtasks);
    }
}


async function updateSubtasksRemote(taskId, subtasks) {
    try {
        await fetch(`${BOARD_BASE_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subtasks })
        });
    } catch (e) {
        console.error('Error updating subtask:', e);
    }
}


function refreshTaskCard(taskId) {
    const task = allTasks.find(t => t.id == taskId);
    if (!task) return;
    const card = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
    if (!card) return;
    card.outerHTML = taskCardTemplate(task);
    const newCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
    attachTouchListenersToCard(newCard, taskId);
}


function refreshSubtaskChecks(task) {
    (task.subtasks || []).forEach((s, i) => {
        const cb = document.getElementById(`sub-check-${i}`);
        if (cb) cb.checked = s.done;
    });
}


// ── Edit Modal ─────────────────────────────────────────────────────────────────

async function openEditModal(id) {
    const task = allTasks.find(t => t.id == id);
    if (!task) return;
    initEditState(task);
    if (!boardContacts.length) boardContacts = await loadBoardContacts();
    renderEditModal(task);
 /*    document.addEventListener('click', handleEditOutsideClick, true); */
}


function initEditState(task) {
    editSelectedPrio = task.priority || 'medium';
    editSubtasks = (task.subtasks || []).map(s => ({ ...s }));
    editAssignedIds = (task.assignedTo || []).map(a => String(a.id));
}


function renderEditModal(task) {
    document.getElementById('board-detail-box').classList.add('d-none');
    document.getElementById('board-edit-box').innerHTML = editTaskTemplate(task);
    document.getElementById('board-edit-box').classList.remove('d-none');
    renderEditAssignOptions();
    renderEditAssignedAvatars();
    renderEditSubtasks();

    setTimeout(() => {
        if (window.attachDatepickers) window.attachDatepickers();
    }, 0);

    // Assign-Dropdown bei Klick außerhalb schließen
    setTimeout(() => {
        document.addEventListener('click', handleEditAssignOutsideClick, true);
    }, 0);
}

function handleEditOutsideClick(event) {
    const editBox = document.getElementById('board-edit-box');
    if (!editBox || editBox.classList.contains('d-none')) return;
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') return;
    if (event.target.closest('#board-overlay')) return;
    closeOverlay();
}

function handleEditAssignOutsideClick(event) {
    if (!event.target.closest('.edit-assign-wrapper')) {
        const opts = document.getElementById('edit-assign-options');
        if (opts && !opts.classList.contains('d-none')) {
            opts.classList.add('d-none');
        }
    }
}


// ── Load Contacts ──────────────────────────────────────────────────────────────

async function loadBoardContacts() {
    return checkIsGuest() ? await loadGuestContacts() : await loadRemoteContacts();
}


async function loadGuestContacts() {
    try {
        const res = await fetch('../db.json');
        const data = await res.json();
        const raw = Object.values(data.contacts || {});
        return mapContacts(raw, true);
    } catch (e) { return []; }
}


async function loadRemoteContacts() {
    try {
        const response = await fetch(`${BOARD_BASE_URL}/contacts.json`);
        const data = await response.json();
        if (!data) return [];
        const raw = Array.isArray(data) ? data.filter(Boolean) : Object.values(data).filter(Boolean);
        return mapContacts(raw, false);
    } catch (e) {
        console.error('Error loading contacts:', e);
        return [];
    }
}


function mapContacts(raw, isGuest) {
    return raw.filter(Boolean).map((c, i) => ({
        id: String(isGuest ? (c.id || i + 1) : c.id),
        name: c.name || '',
        color: c.color || '#888',
        initials: initialsFromName(c.name)
    })).sort((a, b) => a.name.localeCompare(b.name));
}


// ── Edit Assign ────────────────────────────────────────────────────────────────

function toggleEditAssignDropdown() {
    document.getElementById('edit-assign-options').classList.toggle('d-none');
}


function renderEditAssignOptions() {
    const el = document.getElementById('edit-assign-options');
    if (!el) return;
    el.innerHTML = renderEditAssignOptionsHTML(boardContacts, editAssignedIds);
}


function toggleEditPerson(id) {
    const sid = String(id);
    if (editAssignedIds.includes(sid)) {
        editAssignedIds = editAssignedIds.filter(x => x !== sid);
    } else {
        if (!canAssignMorePersons()) return;
        editAssignedIds.push(sid);
    }
    renderEditAssignOptions();
    renderEditAssignedAvatars();
}


function canAssignMorePersons() {
    if (editAssignedIds.length >= 10) {
        notify('Maximal 10 Personen können zugewiesen werden.', true);
        return false;
    }
    return true;
}


function renderEditAssignedAvatars() {
    const el = document.getElementById('edit-assigned-avatars');
    if (!el) return;
    el.innerHTML = renderEditAssignedAvatarsHTML(boardContacts, editAssignedIds);
}


// ── Edit Prio ──────────────────────────────────────────────────────────────────

function selectEditPrio(button, prio) {
    document.querySelectorAll('.edit-prio-btn').forEach(b => b.classList.remove('edit-prio-btn--active'));
    button.classList.add('edit-prio-btn--active');
    editSelectedPrio = prio;
}


// ── Edit Subtasks ──────────────────────────────────────────────────────────────

function addEditSubtask() {
    const input = document.getElementById('edit-subtask-input');
    const title = input.value.trim();
    if (!title) return;
    editSubtasks.push({ title, done: false });
    input.value = '';
    renderEditSubtasks();
}


function deleteEditSubtask(index) {
    editSubtasks.splice(index, 1);
    renderEditSubtasks();
}


function startEditSubtask(index) {
    const item = document.getElementById(`edit-sub-item-${index}`);
    item.innerHTML = renderEditSubtaskInputHTML(index, editSubtasks[index].title);
    document.getElementById(`edit-sub-input-${index}`)?.focus();
}


function saveEditSubtask(index) {
    const val = document.getElementById(`edit-sub-input-${index}`)?.value.trim();
    if (!val) { deleteEditSubtask(index); return; }
    editSubtasks[index].title = val;
    renderEditSubtasks();
}


function renderEditSubtasks() {
    const list = document.getElementById('edit-subtask-list');
    if (!list) return;
    list.innerHTML = renderEditSubtasksHTML(editSubtasks);
}


// ── Save Edited Task ───────────────────────────────────────────────────────────

async function saveEditedTask(id) {
    const task = allTasks.find(t => t.id == id);
    if (!task) return;
    const title = document.getElementById('edit-title').value.trim();
    if (!title) { notify('Title is required.', true); return; }
    const updates = buildTaskUpdates(title, task);
    Object.assign(task, updates);
    await saveTaskUpdates(id, updates);
    resetEditState();
}


function buildAssignedTo() {
    return boardContacts
        .filter(c => editAssignedIds.includes(String(c.id)))
        .map(c => ({ id: c.id, name: c.name, color: c.color, initials: c.initials }));
}


function buildTaskUpdates(title, task) {
    return {
        title,
        description: document.getElementById('edit-desc').value.trim(),
        dueDate: document.getElementById('edit-due').value,
        priority: editSelectedPrio || task.priority,
        assignedTo: buildAssignedTo(),
        subtasks: editSubtasks
    };
}


async function saveTaskUpdates(id, updates) {
    if (checkIsGuest()) {
        saveGuestTasks(allTasks);
        closeOverlay();
        displayTasks(allTasks);
    } else {
        await updateTaskRemote(id, updates);
    }
}


function buildPatchOptions(data) {
    return { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}


async function updateTaskRemote(id, updates) {
    try {
        await fetch(`${BOARD_BASE_URL}/tasks/${id}.json`, buildPatchOptions(updates));
        closeOverlay();
        displayTasks(allTasks);
    } catch (e) {
        console.error('Error saving task:', e);
    }
}


function resetEditState() {
    editSelectedPrio = null;
    editAssignedIds = [];
    editSubtasks = [];
}