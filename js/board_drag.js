let touchDragClone = null;
let touchDragOffsetX = 0;
let touchDragOffsetY = 0;

const COLUMN_IDS = ['todo', 'inProgress', 'awaitFeedback', 'done'];


/** Sets the currently dragged task ID. @param {number|string} id */
function startDragging(id) {
  currentDraggedTaskId = id;
}


/** Prevents default browser behaviour to allow dropping. @param {DragEvent} ev */
function allowDrop(ev) {
  ev.preventDefault();
}


/** Adds the drag-active highlight to the given column. @param {string} id */
function highlight(id) {
  document.getElementById(`drag-hl-${id}`)?.classList.add('drag-active');
}


/** Removes the drag-active highlight from the given column. @param {string} id */
function removeHighlight(id) {
  document.getElementById(`drag-hl-${id}`)?.classList.remove('drag-active');
}


/**
 * Updates the dragged task's status and refreshes the board.
 * @param {string} status - Target column ID.
 */
async function moveTo(status) {
  if (currentDraggedTaskId === null) return;
  const task = allTasks.find(t => t.id == currentDraggedTaskId);
  if (!task) return;
  task.status = status;
  await updateTaskStatus(task);
  displayTasks(allTasks);
  currentDraggedTaskId = null;
}


/** Persists the updated task status for guests or remote users. @param {Object} task */
async function updateTaskStatus(task) {
  if (checkIsGuest()) {
    saveGuestTasks(allTasks);
  } else {
    await updateTaskStatusRemote(task.id, task.status);
  }
}


/**
 * Sends a PATCH request to update the task status on the remote API.
 * @param {number|string} taskId
 * @param {string} status
 */
async function updateTaskStatusRemote(taskId, status) {
  try {
    await fetch(`${BOARD_BASE_URL}/tasks/${taskId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (e) {
    console.error('Error updating task status:', e);
  }
}


/**
 * Calculates and stores the pointer offset relative to the drag card.
 * @param {Touch} touch
 * @param {DOMRect} rect
 */
function setTouchDragOffset(touch, rect) {
  touchDragOffsetX = touch.clientX - rect.left;
  touchDragOffsetY = touch.clientY - rect.top;
}


/**
 * Initiates a touch drag: records the task ID, offset and creates the clone.
 * @param {TouchEvent} event
 * @param {number|string} id
 */
function touchDragStart(event, id) {
  currentDraggedTaskId = id;
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  setTouchDragOffset(event.touches[0], rect);
  createTouchClone(card, rect);
  card.style.opacity = '0.4';
}


/**
 * Creates a fixed-position visual clone of the dragged card.
 * @param {HTMLElement} card
 * @param {DOMRect} rect
 */
function createTouchClone(card, rect) {
  touchDragClone = card.cloneNode(true);
  touchDragClone.style.cssText = `
    position:fixed;left:${rect.left}px;top:${rect.top}px;
    width:${rect.width}px;opacity:0.8;pointer-events:none;
    z-index:9999;transform:rotate(3deg);
    box-shadow:0 8px 24px rgba(0,0,0,0.25);
  `;
  document.body.appendChild(touchDragClone);
}


/**
 * Repositions the clone to follow the touch pointer.
 * @param {Touch} touch
 */
function moveTouchClone(touch) {
  touchDragClone.style.left = (touch.clientX - touchDragOffsetX) + 'px';
  touchDragClone.style.top = (touch.clientY - touchDragOffsetY) + 'px';
}


/** Moves the clone and updates column highlights during a touch drag. @param {TouchEvent} event */
function touchDragMove(event) {
  if (!touchDragClone) return;
  event.preventDefault();
  const touch = event.touches[0];
  moveTouchClone(touch);
  updateColumnHighlights(touch);
}


/**
 * Returns true when the touch point lies inside the given column element.
 * @param {Touch} touch
 * @param {HTMLElement} col
 * @returns {boolean}
 */
function isTouchInsideColumn(touch, col) {
  const r = col.getBoundingClientRect();
  return touch.clientX >= r.left && touch.clientX <= r.right &&
    touch.clientY >= r.top && touch.clientY <= r.bottom;
}


/** Highlights the column under the touch point and removes all others. @param {Touch} touch */
function updateColumnHighlights(touch) {
  COLUMN_IDS.forEach(colId => {
    const col = document.getElementById(colId);
    if (!col) return;
    isTouchInsideColumn(touch, col) ? highlight(colId) : removeHighlight(colId);
  });
}


/** Cleans up the touch drag and triggers a drop into the column under the finger. @param {TouchEvent} event */
function touchDragEnd(event) {
  if (!touchDragClone) return;
  const touch = event.changedTouches[0];
  cleanupTouchDrag(event.currentTarget);
  checkDropZone(touch);
}


/** Removes the clone and restores the original card's opacity. @param {HTMLElement} card */
function cleanupTouchDrag(card) {
  if (touchDragClone) {
    touchDragClone.remove();
    touchDragClone = null;
  }
  card.style.opacity = '';
}


/** Removes all highlights and calls moveTo for the column under the touch point. @param {Touch} touch */
function checkDropZone(touch) {
  COLUMN_IDS.forEach(colId => {
    removeHighlight(colId);
    const col = document.getElementById(colId);
    if (col && isTouchInsideColumn(touch, col)) moveTo(colId);
  });
}