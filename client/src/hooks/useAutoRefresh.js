import { useEffect, useRef } from 'react';
import { listenForChanges } from '../utils/syncChannel';

const REFRESH_INTERVAL_MS = 15000;

// Calls onRefresh to reload data while the page is open: right away when another tab
// reports a change (onRefresh receives that form's id), when the user comes back to
// the tab, and every 15 seconds for changes made in other browsers.
// changeTypes limits which messages trigger a refresh, e.g. ['form'].
export default function useAutoRefresh(onRefresh, changeTypes = ['form', 'submissions']) {
  // Kept in refs so the timer and listeners are set up once, but always use the
  // latest callback (with the current page and filters).
  const callbackRef = useRef(onRefresh);
  const typesRef = useRef(changeTypes);

  useEffect(() => {
    callbackRef.current = onRefresh;
    typesRef.current = changeTypes;
  });

  useEffect(() => {
    function refresh(changedFormId) {
      if (document.visibilityState !== 'visible') return;
      callbackRef.current(changedFormId);
    }

    function handleVisibilityChange() {
      refresh();
    }

    function handleChange({ type, formId }) {
      if (typesRef.current.includes(type)) refresh(formId);
    }

    const timer = setInterval(() => refresh(), REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const stopListening = listenForChanges(handleChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopListening();
    };
  }, []);
}
