/**
 * Focuses the subtask input when the default "+" icon is clicked.
 * @returns {void}
 */
function focusSubtaskInput() {
    document.getElementById('task-subtask').focus();
}


/**
 * Handles key presses in the subtask field: Enter adds a subtask, never submits.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {void}
 */
function handleSubtaskKey(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addSubtask();
}


/**
 * Switches the subtask icons between the default "+" and the clear/confirm pair.
 * @returns {void}
 */
function updateSubtaskActions() {
    const hasText = document.getElementById('task-subtask').value.trim().length > 0;
    document.getElementById('subtask-add-default').classList.toggle('d-none', hasText);
    document.getElementById('subtask-edit-actions').classList.toggle('d-none', !hasText);
}


/**
 * Adds the current input value as a new subtask and clears the field.
 * @returns {void}
 */
function addSubtask() {
    const input = document.getElementById('task-subtask');
    const title = input.value.trim();
    if (!title) return;
    subtasks.push({ title, done: false });
    input.value = '';
    updateSubtaskActions();
    renderSubtasks();
}


/**
 * Clears the subtask input without adding a subtask.
 * @returns {void}
 */
function clearSubtaskInput() {
    document.getElementById('task-subtask').value = '';
    updateSubtaskActions();
}


/**
 * Removes a subtask by index and re-renders the list.
 * @param {number} index - Position in the subtask list.
 * @returns {void}
 */
function deleteSubtask(index) {
    subtasks.splice(index, 1);
    renderSubtasks();
}


/**
 * Switches a subtask into inline edit mode.
 * @param {number} index - Position in the subtask list.
 * @returns {void}
 */
function editSubtask(index) {
    const list = document.getElementById('subtask-list');
    list.children[index].outerHTML = subtaskEditTemplate(subtasks[index], index);
    document.getElementById(`subtask-edit-${index}`).focus();
}


/**
 * Saves the edited subtask title (or deletes it when left empty).
 * @param {number} index - Position in the subtask list.
 * @returns {void}
 */
function saveSubtaskEdit(index) {
    const value = document.getElementById(`subtask-edit-${index}`).value.trim();
    if (!value) return deleteSubtask(index);
    subtasks[index].title = value;
    renderSubtasks();
}


/**
 * Renders the full subtask list into the DOM.
 * @returns {void}
 */
function renderSubtasks() {
    const list = document.getElementById('subtask-list');
    list.innerHTML = subtasks.map((subtask, index) => subtaskItemTemplate(subtask, index)).join('');
}
