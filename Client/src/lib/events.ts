export function emitAttendanceChanged(detail?: any) {
  window.dispatchEvent(new CustomEvent('attendance-changed', { detail }));
}

export function emitSubjectAssigned(detail?: any) {
  window.dispatchEvent(new CustomEvent('subject-assigned', { detail }));
}
