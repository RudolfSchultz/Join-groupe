const ADDTASK_BASE_URL = 'https://remotestorage-c0469-default-rtdb.europe-west1.firebasedatabase.app';
const ADDTASK_CONTACTS_URL = `${ADDTASK_BASE_URL}/contacts.json`;

let modalSelectedPriority = 'medium';
let modalSelectedCategory = '';
let modalAssignedIds = [];
let modalSubtasks = [];
let modalContacts = [];
let modalDefaultStatus = 'todo';


// ── Load Contacts ──────────────────────────────────────────────────────────────

async function loadAssignContacts() {
    try {
        return (typeof checkIsGuest === 'function' && checkIsGuest())
            ? await loadGuestAssignContacts()
            : await loadRemoteAssignContacts();
    } catch (error) {
        console.error('Error loading contacts:', error);
        return [];
    }
}


async function loadGuestAssignContacts() {
    const response = await fetch('../db.json');
    const raw = await response.json();
    const contacts = Object.entries(raw.contacts || {}).map(([key, c]) => ({ ...c, id: key }));
    return normalizeContacts(contacts);
}


async function loadRemoteAssignContacts() {
    const response = await fetch(ADDTASK_CONTACTS_URL);
    const raw = await response.json();
    if (!raw) return [];
    return normalizeContacts(Array.isArray(raw) ? raw : Object.values(raw));
}


function normalizeContacts(raw) {
    return raw
        .filter(Boolean)
        .map(contact => ({
            id: String(contact.id),
            name: contact.name,
            color: contact.color || (typeof getRandomColor === 'function' ? getRandomColor() : '#ccc'),
            avatar: contact.avatar || (typeof initialsFromName === 'function' ? initialsFromName(contact.name) : '?')
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}


// ── Priority ───────────────────────────────────────────────────────────────────

function setModalPriority(button) {
    document.querySelectorAll('#add-task-overlay .prio-btn').forEach(btn => btn.classList.remove('prio-active'));
    button.classList.add('prio-active');
    modalSelectedPriority = button.dataset.prio;
}


// ── Category Dropdown ──────────────────────────────────────────────────────────

function toggleModalCategoryDropdown() {
    closeModalAssignDropdown();
    document.getElementById('modal-category-options').classList.toggle('d-none');
}


function closeModalCategoryDropdown() {
    document.getElementById('modal-category-options').classList.add('d-none');
}


function selectModalCategory(value) {
    modalSelectedCategory = value;
    const label = document.getElementById('modal-category-selected');
    label.textContent = value;
    label.classList.remove('select-placeholder');
    closeModalCategoryDropdown();
    document.getElementById('modal-error-category').classList.add('d-none');
    updateModalCreateButton();
}


// ── Assign Dropdown ────────────────────────────────────────────────────────────

function toggleModalAssignDropdown() {
    closeModalCategoryDropdown();
    renderModalAssignOptions();
    document.getElementById('modal-assign-options').classList.toggle('d-none');
}


function closeModalAssignDropdown() {
    document.getElementById('modal-assign-options').classList.add('d-none');
}


function renderModalAssignOptions() {
    const options = document.getElementById('modal-assign-options');
    options.innerHTML = modalContacts
        .map(contact => modalAssignOptionTemplate(contact, modalAssignedIds.includes(contact.id)))
        .join('');
}


function modalAssignOptionTemplate(contact, isSelected) {
    return `
        <div class="assign-option ${isSelected ? 'assign-option--active' : ''}"
             role="checkbox" tabindex="0" aria-checked="${isSelected}"
             onclick="toggleModalPerson('${contact.id}'); event.stopPropagation();"
             onkeydown="if(event.key==='Enter' || event.key===' '){event.preventDefault(); toggleModalPerson('${contact.id}');}">
            <span class="assign-option-left">
                <span class="avatar-chip" style="background-color:${contact.color}">${contact.avatar}</span>
                <span class="assign-option-name">${escapeHtml(contact.name)}</span>
            </span>
            <span class="assign-checkbox" aria-hidden="true">${isSelected ? '&#x2611;' : '&#x2610;'}</span>
        </div>`;
}


function toggleModalPerson(id) {
    if (modalAssignedIds.includes(id)) {
        modalAssignedIds = modalAssignedIds.filter(assignedId => assignedId !== id);
    } else {
        if (!canAssignMoreModalPersons()) return;
        modalAssignedIds.push(id);
    }
    renderModalAssignOptions();
    renderModalAssignedAvatars();
}


function canAssignMoreModalPersons() {
    if (modalAssignedIds.length >= 10) {
        notify('Maximal 10 Personen können zugewiesen werden.', true);
        return false;
    }
    return true;
}


function renderModalAssignedAvatars() {
    const container = document.getElementById('modal-assigned-avatars');
    const selected = modalContacts.filter(contact => modalAssignedIds.includes(contact.id));
    const max = 5;
    const visible = selected.slice(0, max);
    let html = visible.map(contact => `<span class="avatar-chip" style="background-color:${contact.color}">${contact.avatar}</span>`).join('');
    if (selected.length > max) {
        const more = selected.length - max;
        html += `<span class="avatar-chip avatar-chip-more">+${more}</span>`;
    }
    container.innerHTML = html;
}


// ── Subtasks ───────────────────────────────────────────────────────────────────

function handleModalSubtaskKey(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addModalSubtask();
}


function updateModalSubtaskActions() {
    const hasText = document.getElementById('modal-task-subtask').value.trim().length > 0;
    const editActions = document.getElementById('modal-subtask-edit-actions');
    if (editActions) editActions.classList.toggle('d-none', !hasText);
}


function addModalSubtask() {
    const input = document.getElementById('modal-task-subtask');
    const title = input.value.trim();
    if (!title) return;
    modalSubtasks.push({ title, done: false });
    input.value = '';
    updateModalSubtaskActions();
    renderModalSubtasks();
}


function clearModalSubtaskInput() {
    document.getElementById('modal-task-subtask').value = '';
    updateModalSubtaskActions();
}


function deleteModalSubtask(index) {
    modalSubtasks.splice(index, 1);
    renderModalSubtasks();
}


function editModalSubtask(index) {
    const list = document.getElementById('modal-subtask-list');
    list.children[index].outerHTML = modalSubtaskEditTemplate(modalSubtasks[index], index);
    document.getElementById(`modal-subtask-edit-${index}`).focus();
}


function saveModalSubtaskEdit(index) {
    const value = document.getElementById(`modal-subtask-edit-${index}`).value.trim();
    if (!value) return deleteModalSubtask(index);
    modalSubtasks[index].title = value;
    renderModalSubtasks();
}


function renderModalSubtasks() {
    const list = document.getElementById('modal-subtask-list');
    list.innerHTML = modalSubtasks.map((subtask, index) => modalSubtaskItemTemplate(subtask, index)).join('');
}


function modalSubtaskItemTemplate(subtask, index) {
    return `
        <li class="subtask-item" ondblclick="editModalSubtask(${index})">
            <span class="subtask-text">&bull; ${escapeHtml(subtask.title)}</span>
            <span class="subtask-item-actions">
                <button type="button" class="subtask-icon-btn" title="Edit" onclick="editModalSubtask(${index})">&#9998;</button>
                <span class="subtask-action-divider"></span>
                <button type="button" class="subtask-icon-btn" title="Delete" onclick="deleteModalSubtask(${index})">&#128465;</button>
            </span>
        </li>`;
}


function modalSubtaskEditTemplate(subtask, index) {
    return `
        <li class="subtask-item subtask-item--editing">
            <input class="subtask-edit-input" id="modal-subtask-edit-${index}" value="${escapeHtml(subtask.title)}"
                onkeydown="if(event.key==='Enter'){event.preventDefault();saveModalSubtaskEdit(${index});}">
            <span class="subtask-item-actions">
                <button type="button" class="subtask-icon-btn" title="Delete" onclick="deleteModalSubtask(${index})">&#128465;</button>
                <span class="subtask-action-divider"></span>
                <button type="button" class="subtask-icon-btn" title="Save" onclick="saveModalSubtaskEdit(${index})">&#10003;</button>
            </span>
        </li>`;
}


// ── Clear Form ─────────────────────────────────────────────────────────────────

function clearModalTaskForm() {
    clearModalTextFields();
    resetModalPriority();
    resetModalCategory();
    resetModalAssignAndSubtasks();
    hideModalFieldErrors();
    updateModalCreateButton();
}


function clearModalTextFields() {
    document.getElementById('modal-task-title').value = '';
    document.getElementById('modal-task-desc').value = '';
    document.getElementById('modal-task-due').value = '';
    document.getElementById('modal-task-subtask').value = '';
    updateModalSubtaskActions();
}


function resetModalPriority() {
    modalSelectedPriority = 'medium';
    document.querySelectorAll('#add-task-overlay .prio-btn').forEach(btn => {
        btn.classList.remove('prio-active');
        if (btn.dataset.prio === 'medium') btn.classList.add('prio-active');
    });
}


function resetModalCategory() {
    modalSelectedCategory = '';
    const categoryLabel = document.getElementById('modal-category-selected');
    categoryLabel.textContent = 'Select task category';
    categoryLabel.classList.add('select-placeholder');
}


function resetModalAssignAndSubtasks() {
    modalAssignedIds = [];
    modalSubtasks = [];
    renderModalAssignedAvatars();
    renderModalSubtasks();
}


function hideModalFieldErrors() {
    document.querySelectorAll('#add-task-overlay .field-error').forEach(el => el.classList.add('d-none'));
}


// ── Create Task ────────────────────────────────────────────────────────────────

async function createTaskFromModal(event) {
    event.preventDefault();
    const task = collectModalTask();
    if (!validateModalTask(task)) return;
    const button = document.getElementById('modal-btn-create');
    button.disabled = true;
    await trySaveModalTask(task, button);
}


async function trySaveModalTask(task, button) {
    try {
        await saveModalTask(task);
        showTaskNotification('Task added to board');
        closeAddTaskModal();
        await initTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        showTaskNotification('Could not save task. Please try again.', true);
        button.disabled = false;
    }
}


function collectModalAssignedTo() {
    return modalContacts
        .filter(c => modalAssignedIds.includes(c.id))
        .map(c => ({ id: c.id, name: c.name, color: c.color, initials: c.avatar }));
}


function collectModalTask() {
    return {
        title: document.getElementById('modal-task-title').value.trim(),
        description: document.getElementById('modal-task-desc').value.trim(),
        dueDate: document.getElementById('modal-task-due').value,
        priority: modalSelectedPriority,
        category: modalSelectedCategory,
        assignedTo: collectModalAssignedTo(),
        subtasks: modalSubtasks,
        status: modalDefaultStatus
    };
}


// ── Validate Task ──────────────────────────────────────────────────────────────

function validateModalField(value, errorId) {
    const errorEl = document.getElementById(errorId);
    const isValid = Boolean(value);
    errorEl.classList.toggle('d-none', isValid);
    return isValid;
}


function validateModalTask(task) {
    const titleOk = validateModalField(task.title, 'modal-error-title');
    const dueOk = validateModalField(task.dueDate, 'modal-error-due');
    const catOk = validateModalField(task.category, 'modal-error-category');
    return titleOk && dueOk && catOk;
}


function updateModalCreateButton() {
    const title = document.getElementById('modal-task-title').value.trim();
    const due = document.getElementById('modal-task-due').value;
    const btn = document.getElementById('modal-btn-create');
    btn.disabled = !(title && due && modalSelectedCategory);
}