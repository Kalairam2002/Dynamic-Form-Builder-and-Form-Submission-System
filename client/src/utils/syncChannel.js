// Lets other open tabs know right away that something changed, so they can reload
// without waiting for the next timed refresh.
//   'form'        - a form was saved or deleted in the builder or dashboard
//   'submissions' - a submission was added or deleted
const CHANNEL_NAME = 'form-builder-sync';

const isSupported = typeof BroadcastChannel !== 'undefined';

export function notifyChange(type, formId) {
  if (!isSupported) return;

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type, formId });
  channel.close();
}

// Returns a function that stops listening.
export function listenForChanges(onChange) {
  if (!isSupported) return () => {};

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event) => onChange(event.data || {});
  return () => channel.close();
}
