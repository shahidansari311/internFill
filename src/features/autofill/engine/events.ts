/**
 * Simulates user typing/selecting by setting values and dispatching events.
 * This is designed to bypass React/Vue's virtual DOM state interception.
 */

/**
 * Update the value of an input element and trigger native react/vue listeners.
 */
export function setElementValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
): void {
  try {
    // Walk the prototype chain to find the native value setter
    let setter: ((v: any) => void) | null = null;
    let proto = Object.getPrototypeOf(el);
    while (proto) {
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) {
        setter = desc.set;
        break;
      }
      proto = Object.getPrototypeOf(proto);
    }

    if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }

    // Trigger value tracking for React 16+
    const tracker = (el as any)._valueTracker;
    if (tracker) {
      tracker.setValue('');
    }

    // Dispatch standard DOM events to notify framework listeners (Zustand, Redux, React Hook Form, etc.)
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    el.dispatchEvent(inputEvent);

    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    el.dispatchEvent(changeEvent);

    const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
    el.dispatchEvent(blurEvent);
  } catch (err) {
    console.error('[InternFill] Error setting value on element:', el, err);
    // Fallback: simple assignment
    el.value = value;
  }
}
