import { useCallback, useEffect, useRef, type ChangeEvent } from 'react';

interface UseDebouncedSearchInputOptions {
  value: string;
  onChange: (value: string) => void;
  delayMs: number;
}

export function useDebouncedSearchInput({
  value,
  onChange,
  delayMs,
}: UseDebouncedSearchInputOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const committedValueRef = useRef(value);
  const pendingEchoValueRef = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const setInputValue = useCallback((nextValue: string) => {
    const input = inputRef.current;
    if (input && input.value !== nextValue) {
      input.value = nextValue;
    }
  }, []);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    committedValueRef.current = value;

    if (pendingEchoValueRef.current === value) {
      pendingEchoValueRef.current = null;
      return;
    }

    pendingEchoValueRef.current = null;
    clearTimer();
    setInputValue(value);
  }, [value, clearTimer, setInputValue]);

  useEffect(() => clearTimer, [clearTimer]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value;
      clearTimer();

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;

        if (nextValue === committedValueRef.current) {
          return;
        }

        pendingEchoValueRef.current = nextValue;
        onChangeRef.current(nextValue);
      }, delayMs);
    },
    [clearTimer, delayMs]
  );

  const resetInput = useCallback(
    (nextValue: string) => {
      clearTimer();
      setInputValue(nextValue);
    },
    [clearTimer, setInputValue]
  );

  const clearInput = useCallback(() => {
    clearTimer();
    setInputValue('');
    inputRef.current?.focus();

    if (committedValueRef.current === '') {
      return;
    }

    pendingEchoValueRef.current = '';
    onChangeRef.current('');
  }, [clearTimer, setInputValue]);

  return {
    inputRef,
    handleInputChange,
    resetInput,
    clearInput,
  };
}
