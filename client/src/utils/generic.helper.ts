export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => unknown,
  delay: number,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      void fn(...args);
    }, delay);
  };
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}
