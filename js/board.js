const BOARD_BASE_URL = 'https://remotestorage-c0469-default-rtdb.europe-west1.firebasedatabase.app';

let allTasks = [];
let currentDraggedTaskId = null;
let editSelectedPrio = null;
let editAssignedIds = [];
let editSubtasks = [];
let boardContacts = [];


// ── Guest Storage ──────────────────────────────────────────────────────────────

function getGuestTasks() {
    try { return JSON.parse(sessionStorage.getItem('guestTasks')) || []; } catch (e) { return []; }
}


function saveGuestTasks(tasks) {
    sessionStorage.setItem('guestTasks', JSON.stringify(tasks));
}


// ── Init ───────────────────────────────────────────────────────────────────────

function init() {
    initMain();
}


async function initTasks() {
    allTasks = await loadBoardTasks();
    displayTasks(allTasks);
}


// ── Load Tasks ─────────────────────────────────────────────────────────────────

async function loadBoardTasks() {
    if (checkIsGuest()) return await loadGuestTasks();
    return await loadRemoteTasks();
}


async function loadRemoteTasks() {
    try {
        const response = await fetch(`${BOARD_BASE_URL}/tasks.json`);
        const data = await response.json();
        if (!data) return [];
        return Array.isArray(data) ? data.filter(Boolean) : Object.values(data).filter(Boolean);
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}


async function loadGuestTasks() {
    try {
        const fileTasks = await fetchDemoTasks();
        return mergeWithSessionTasks(fileTasks);
    } catch (e) {
        console.error('Error loading guest tasks:', e);
        return getGuestTasks();
    }
}


async function fetchDemoTasks() {
    const res = await fetch('../demo-task.json');
    if (!res || !res.ok) return [];
    const data = await res.json();
    const raw = data?.tasks || data;
    if (!raw) return [];
    return Array.isArray(raw) ? raw.filter(Boolean) : Object.keys(raw).map(k => ({ ...raw[k], id: k })).filter(Boolean);
}


function mergeWithSessionTasks(fileTasks) {
    const local = getGuestTasks() || [];
    const mergedMap = new Map();
    fileTasks.forEach(t => mergedMap.set(String(t.id), t));
    local.forEach(t => mergedMap.set(String(t.id), t));
    const merged = Array.from(mergedMap.values());
    merged.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    return merged;
}


// ── Display Tasks ──────────────────────────────────────────────────────────────

function displayTasks(tasks) {
    clearBoardColumns();
    tasks.forEach(task => renderTaskCard(task));
    showEmptyPlaceholders();
    addDragHighlightBoxes();
}


function clearBoardColumns() {
    ['todo', 'inProgress', 'awaitFeedback', 'done'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
}


function renderTaskCard(task) {
    const col = document.getElementById(task.status);
    if (!col) return;
    col.insertAdjacentHTML('beforeend', taskCardTemplate(task));
    const card = col.querySelector(`.task-card[data-task-id="${task.id}"]`);
    attachTouchListenersToCard(card, task.id);
}


function attachTouchListenersToCard(card, id) {
    if (!card) return;
    try {
        card.addEventListener('touchstart', function (e) { touchDragStart(e, id); }, { passive: true });
        card.addEventListener('touchmove', touchDragMove, { passive: false });
        card.addEventListener('touchend', touchDragEnd, { passive: true });
    } catch (e) {
        card.addEventListener('touchstart', function (e) { touchDragStart(e, id); });
        card.addEventListener('touchmove', touchDragMove);
        card.addEventListener('touchend', touchDragEnd);
    }
}


function showEmptyPlaceholders() {
    if (document.getElementById('board-no-results')) return;
    getEmptyColumnTexts().forEach(([id, text]) => renderEmptyPlaceholder(id, text));
}


function getEmptyColumnTexts() {
    return Object.entries({
        todo: 'No tasks To do',
        inProgress: 'No tasks progress',
        awaitFeedback: 'No tasks feedback',
        done: 'No tasks done'
    });
}


function renderEmptyPlaceholder(id, text) {
    const el = document.getElementById(id);
    if (el && el.innerHTML.trim() === '') {
        el.innerHTML = `<div class="board-empty">${text}</div>`;
    }
}


function addDragHighlightBoxes() {
    ['todo', 'inProgress', 'awaitFeedback', 'done'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.insertAdjacentHTML('beforeend', `<div id="drag-hl-${id}" class="drag-highlight-box"></div>`);
    });
}


// ── Filter ─────────────────────────────────────────────────────────────────────

function filterTasks() {
    const term = getSearchTerm();
    if (!term) { resetFilter(); return; }
    const filtered = filterTasksByTerm(term);
    renderFilterResults(filtered);
}


function getSearchTerm() {
    return (document.getElementById('board-search')?.value || '').toLowerCase();
}


function resetFilter() {
    hideNoResultsMessage();
    displayTasks(allTasks);
}


function filterTasksByTerm(term) {
    return allTasks.filter(t =>
        (t.title || '').toLowerCase().includes(term) ||
        (t.description || '').toLowerCase().includes(term)
    );
}


function renderFilterResults(filtered) {
    if (filtered.length === 0) {
        displayTasks([]);
        showNoResultsMessage();
    } else {
        hideNoResultsMessage();
        displayTasks(filtered);
    }
}


function showNoResultsMessage() {
    hideNoResultsMessage();
    const container = document.querySelector('.board-columns');
    if (!container) return;
    const el = document.createElement('div');
    el.id = 'board-no-results';
    el.className = 'board-no-results';
    el.innerHTML = `<div class="board-empty">Keine Ergebnisse gefunden</div>`;
    container.appendChild(el);
}


function hideNoResultsMessage() {
    const existing = document.getElementById('board-no-results');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
}

// ── Outside Click ──────────────────────────────────────────────────────────────

function handleEditOutsideClick(event) {
    if (!event.target.closest('.edit-assign-wrapper')) {
        const opts = document.getElementById('edit-assign-options');
        if (opts) opts.classList.add('d-none');
    }
}