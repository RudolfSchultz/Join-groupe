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


function getSubtaskStats(taskId) {
  const task = allTasks.find(t => String(t.id) == String(taskId));
  if (!task) return null;
  const subtasks = task.subtasks || [];
  const done = subtasks.filter(s => s.done).length;
  return { subtasks, done, total: subtasks.length };
}


function getPopoverPosition(event) {
  const rect = event.target?.getBoundingClientRect?.() || {
    left: event.clientX,
    bottom: event.clientY
  };
  return {
    left: rect.left + window.scrollX,
    top: rect.bottom + window.scrollY + 8
  };
}


function positionPopover(pop, event) {
  const pos = getPopoverPosition(event);
  pop.style.left = pos.left + 'px';
  pop.style.top = pos.top + 'px';
}


function renderPopoverHeader(done, total) {
  return `<div class="progress-popover-header">${done} von ${total} Subtasks erledigt</div>`;
}


function escapedTitle(title) {
  return (title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


function renderSubtaskItem(subtask) {
  const doneClass = subtask.done ? 'done' : '';
  const icon = subtask.done ? '✓' : '○';
  return `
    <li class="progress-popover-item ${doneClass}">
      <span class="progress-popover-check">${icon}</span>
      <span class="progress-popover-title">${escapedTitle(subtask.title)}</span>
    </li>`;
}


function renderPopoverList(subtasks) {
  const items = subtasks.map(renderSubtaskItem).join('');
  return `<ul class="progress-popover-list">${items}</ul>`;
}


function showProgressTooltip(event, taskId) {
  const stats = getSubtaskStats(taskId);
  if (!stats) return;
  const pop = createProgressPopover();
  pop.innerHTML = renderPopoverHeader(stats.done, stats.total);
  positionPopover(pop, event);
  pop.dataset.taskId = taskId;
  pop.classList.remove('d-none');
}


function hideProgressTooltip() {
  const pop = document.getElementById('progress-popover');
  if (pop) pop.classList.add('d-none');
}


function isPopoverVisibleForTask(pop, taskId) {
  return pop.dataset.taskId == String(taskId) && !pop.classList.contains('d-none');
}


function toggleProgressDetails(event, taskId) {
  event.stopPropagation();
  event.preventDefault();
  const stats = getSubtaskStats(taskId);
  if (!stats) return;
  const pop = createProgressPopover();
  if (isPopoverVisibleForTask(pop, taskId)) {
    pop.classList.add('d-none');
    return;
  }
  pop.innerHTML = renderPopoverHeader(stats.done, stats.total) + renderPopoverList(stats.subtasks);
  positionPopover(pop, event);
  pop.dataset.taskId = taskId;
  pop.classList.remove('d-none');
}