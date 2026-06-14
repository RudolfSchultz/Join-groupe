// ── Save Task ──────────────────────────────────────────────────────────────────

async function saveModalTask(task) {
    if (checkIsGuest()) {
        await saveModalTaskAsGuest(task);
    } else {
        await saveModalTaskRemote(task);
    }
}


async function saveModalTaskAsGuest(task) {
    const guestTasks = getGuestTasks();
    task.id = await resolveGuestTaskId(guestTasks);
    guestTasks.push(task);
    saveGuestTasks(guestTasks);
}


async function resolveGuestTaskId(guestTasks) {
    try {
        const fileTasks = await fetchDemoTaskList();
        const maxFileId = fileTasks.length ? Math.max(...fileTasks.map(t => Number(t.id) || 0)) : 0;
        const maxLocalId = guestTasks.length ? Math.max(...guestTasks.map(t => Number(t.id) || 0)) : 0;
        return Math.max(maxFileId, maxLocalId) + 1;
    } catch (e) {
        return guestTasks.length ? Math.max(...guestTasks.map(t => Number(t.id) || 0)) + 1 : 1;
    }
}


async function fetchDemoTaskList() {
    const res = await fetch('../demo-task.json');
    if (!res || !res.ok) return [];
    const data = await res.json();
    const raw = data?.tasks || data;
    if (!raw) return [];
    return Array.isArray(raw) ? raw.filter(Boolean) : Object.keys(raw).map(k => ({ ...raw[k], id: k })).filter(Boolean);
}


async function saveModalTaskRemote(task) {
    const id = await getNextModalTaskId();
    task.id = id;
    await fetch(`${ADDTASK_BASE_URL}/tasks/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}


async function getNextModalTaskId() {
    try {
        const response = await fetch(`${ADDTASK_BASE_URL}/tasks.json`);
        const data = await response.json();
        if (!data) return 1;
        const tasks = Array.isArray(data) ? data.filter(Boolean) : Object.values(data).filter(Boolean);
        return tasks.length ? Math.max(...tasks.map(t => Number(t.id) || 0)) + 1 : 1;
    } catch (error) {
        console.error('Error getting next task ID:', error);
        return 1;
    }
}


// ── Notification ───────────────────────────────────────────────────────────────

function showTaskNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.className = 'notification';
    if (isError) notification.classList.add('notification--error');
    notification.classList.remove('d-none');
    setTimeout(() => notification.classList.add('d-none'), 2000);
}