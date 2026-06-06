function createProgressPopover() {
    let pop = document.getElementById('progress-popover');
    if (!pop) {
        pop = document.createElement('div');
        pop.id = 'progress-popover';
        pop.className = 'progress-popover d-none';
        document.body.appendChild(pop);
    }
    return pop;
}

function showProgressTooltip(event, taskId) {
    const task = allTasks.find(t => String(t.id) == String(taskId));
    if (!task) return;
    const subtasks = task.subtasks || [];
    const done = subtasks.filter(s => s.done).length;
    const total = subtasks.length;
    const pop = createProgressPopover();
    pop.innerHTML = `<div class="progress-popover-header">${done} von ${total} Subtasks erledigt</div>`;
    const rect = (event.target && event.target.getBoundingClientRect && event.target.getBoundingClientRect()) || { left: event.clientX, bottom: event.clientY };
    pop.style.left = (rect.left + window.scrollX) + 'px';
    pop.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    pop.dataset.taskId = taskId;
    pop.classList.remove('d-none');
}

function hideProgressTooltip() {
    const pop = document.getElementById('progress-popover');
    if (pop) pop.classList.add('d-none');
}

function toggleProgressDetails(event, taskId) {
    event.stopPropagation(); event.preventDefault();
    const task = allTasks.find(t => String(t.id) == String(taskId)); if (!task) return;
    const subtasks = task.subtasks || [], done = subtasks.filter(s => s.done).length, total = subtasks.length;
    const pop = createProgressPopover();
    if (pop.dataset.taskId == String(taskId) && !pop.classList.contains('d-none')) { pop.classList.add('d-none'); return; }
    pop.innerHTML = `<div class="progress-popover-header">${done} von ${total} Subtasks erledigt</div><ul class="progress-popover-list">${subtasks.map(s=>`<li class="progress-popover-item ${s.done?'done':''}"><span class="progress-popover-check">${s.done?'✓':'○'}</span><span class="progress-popover-title">${(s.title||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span></li>`).join('')}</ul>`;
    const rect = (event.target && event.target.getBoundingClientRect && event.target.getBoundingClientRect()) || { left: event.clientX, bottom: event.clientY };
    pop.style.left = (rect.left + window.scrollX) + 'px'; pop.style.top = (rect.bottom + window.scrollY + 8) + 'px'; pop.dataset.taskId = taskId; pop.classList.remove('d-none');
}