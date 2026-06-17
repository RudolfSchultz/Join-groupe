function renderAddTaskModal() {
    return `
    <dialog class="board-overlay" id="add-task-overlay" onclick="closeAddTaskModal(event)">
        <div class="add-task-modal" onclick="event.stopPropagation()">
            <button class="modal-close-btn" onmousedown="event.stopPropagation(); event.preventDefault();" onclick="closeAddTaskModal()">&times;</button>
            <h2 class="modal-title">Add Task</h2>

            <form method="dialog" class="task-form" id="modal-task-form" onsubmit="createTaskFromModal(event)">
            <div class="task-form-detail">
                <div class="form-columns">
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label" for="modal-task-title">Title <span
                                    class="required">*</span></label>
                            <input class="form-input" type="text" id="modal-task-title" placeholder="Enter a title"
                                oninput="updateModalCreateButton()">
                            <span class="field-error d-none" id="modal-error-title">This field is required</span>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="modal-task-desc">Description</label>
                            <textarea class="form-input form-textarea" id="modal-task-desc"
                                placeholder="Enter a description"></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="modal-task-due">Due date <span
                                    class="required">*</span></label>
                            <div class="form-input-icon">
                                <input class="form-input" type="date" id="modal-task-due"
                                    onchange="updateModalCreateButton()" oninput="updateModalCreateButton()">
                            </div>
                            <span class="field-error d-none" id="modal-error-due">This field is required</span>
                        </div>
                    </div>

                    <div class="form-divider-vertical"></div>

                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Priority</label>
                            <div class="prio-buttons">
                                <button type="button" class="prio-btn prio-urgent" data-prio="urgent"
                                    onclick="setModalPriority(this)">
                                    Urgent
                                    <svg width="20" height="15" viewBox="0 0 20 14.51" fill="none">
                                        <path d="M0 8.76 L10 0 L20 8.76 L17.5 8.76 L10 2.5 L2.5 8.76 Z" />
                                        <path d="M0 14.51 L10 5.75 L20 14.51 L17.5 14.51 L10 8.25 L2.5 14.51 Z" />
                                    </svg>
                                </button>
                                <button type="button" class="prio-btn prio-medium prio-active" data-prio="medium"
                                    onclick="setModalPriority(this)">
                                    Medium
                                    <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                                        <rect x="0" y="0" width="20" height="2.21" rx="1.1" />
                                        <rect x="0" y="5.24" width="20" height="2.21" rx="1.1" />
                                    </svg>
                                </button>
                                <button type="button" class="prio-btn prio-low" data-prio="low"
                                    onclick="setModalPriority(this)">
                                    Low
                                    <svg width="20" height="15" viewBox="0 0 20 14.51" fill="none">
                                        <path d="M0 0 L10 8.76 L20 0 L17.5 0 L10 6.26 L2.5 0 Z" />
                                        <path d="M0 5.75 L10 14.51 L20 5.75 L17.5 5.75 L10 12.01 L2.5 5.75 Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="form-group" style="position: relative;">
                            <label class="form-label">Assigned to</label>
                            <div class="custom-select" id="modal-assign-select">
                                <div class="form-input select-toggle" id="modal-assign-toggle"
                                    onclick="toggleModalAssignDropdown()">
                                    <span>Select contacts to assign</span>
                                    <span class="select-caret">&#9662;</span>
                                </div>
                                <div class="select-options d-none" id="modal-assign-options"></div>
                            </div>
                            <div class="assigned-avatars" id="modal-assigned-avatars"
                                style="position: absolute; top: 100%; left: 0; z-index: 1;"></div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" style="margin-top: 30px;">Category <span class="required">*</span></label>
                            <div class="custom-select" id="modal-category-select">
                                <div class="form-input select-toggle" id="modal-category-toggle"
                                    onclick="toggleModalCategoryDropdown()">
                                    <span id="modal-category-selected" class="select-placeholder">Select task
                                        category</span>
                                    <span class="select-caret">&#9662;</span>
                                </div>
                                <div class="select-options d-none" id="modal-category-options">
                                    <div class="select-option" onclick="selectModalCategory('Technical Task')">Technical
                                        Task
                                    </div>
                                    <div class="select-option" onclick="selectModalCategory('User Story')">User Story
                                    </div>
                                </div>
                            </div>
                            <span class="field-error d-none" id="modal-error-category">This field is required</span>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="modal-task-subtask">Subtasks</label>
                            <div class="subtask-input-wrapper">
                                <input class="form-input" type="text" id="modal-task-subtask"
                                    placeholder="Add new subtask" oninput="updateModalSubtaskActions()"
                                    onkeydown="handleModalSubtaskKey(event)">
                                <div class="subtask-actions">
                                    <span class="subtask-edit-actions d-none" id="modal-subtask-edit-actions">
                                        <button type="button" class="subtask-icon-btn" title="Clear"
                                            onclick="clearModalSubtaskInput()">&#10005;</button>
                                        <span class="subtask-action-divider"></span>
                                        <button type="button" class="subtask-icon-btn" title="Add"
                                            onclick="addModalSubtask()">&#10003;</button>
                                    </span>
                                </div>
                            </div>
                            <ul class="subtask-list" id="modal-subtask-list"></ul>
                        </div>
                    </div>
                </div>
     </div>
     
                <div class="form-footer">
                    <span class="required-hint"><span class="required">*</span>This field is required</span>
                    <div class="form-actions">
                        <button type="button" class="btn-clear" onclick="clearModalTaskForm()">Clear <span
                                class="btn-x">✕</span></button>
                        <button type="submit" class="btn-create" id="modal-btn-create" disabled>
                            Create Task
                            <img src="../assets/icons/done.svg" alt="" class="btn-icon">
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </dialog>`;
}


function injectAddTaskModal() {
    document.body.insertAdjacentHTML('beforeend', renderAddTaskModal());
    // ensure datepickers attach to dynamically injected modal
    setTimeout(() => { if (window.attachDatepickers) try { window.attachDatepickers(); } catch (e) {} }, 0);
}


function initAddTaskModal() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectAddTaskModal);
    } else {
        injectAddTaskModal();
    }
}

try {
    initAddTaskModal();
} catch (e) {
    /* ignore injection errors in non-browser contexts */
}