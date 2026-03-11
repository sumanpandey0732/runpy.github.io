

## Problem

The console has an existing `contentEditable` span for inline input, but it's problematic:
1. It only appears after the last `stdout` entry -- if the program prints a prompt via `input("Enter name: ")`, Pyodide's `setStdout` with `batched` may not flush the prompt text before blocking on stdin, so the user never sees the prompt or the input field.
2. The `contentEditable` span is nearly invisible -- no cursor indicator, no styling, no visual cue that input is expected.
3. For JavaScript mode, there's no input support at all.
4. The worker uses `setStdin` with an async `stdin` callback, which signals when input is needed, but the main thread has no "waiting for input" state to show a proper input field.

## Plan

### 1. Add a "waiting for input" signal from the worker
- When the worker's `stdin` callback is invoked (meaning Python called `input()`), post a message `{ type: "input_request" }` to the main thread **before** awaiting the promise.
- In `usePyodide`, handle `"input_request"` by setting a new state `waitingForInput: true`, and reset it to `false` when `sendInput` is called.

### 2. Redesign ConsoleOutput with a proper input bar
- Remove the `contentEditable` span approach.
- Add a dedicated input row at the bottom of the console (always visible when `waitingForInput` is true): a styled `<input>` element with a blinking cursor, a ">" prompt indicator, and a submit button/Enter key handler.
- When not waiting for input, the input bar is hidden.
- On submit: call `sendInput(value)`, clear the field.

### 3. Wire up the new state
- `usePyodide` exposes `waitingForInput: boolean`.
- `ConsoleOutput` receives `waitingForInput` prop.
- `Index.tsx` passes `waitingForInput` from the Python hook (always `false` for JS).

### 4. Styling
- Input bar: dark background matching console, monospace font, green ">" prompt, auto-focus when it appears, subtle border-top separator.

### Files to modify
- `src/hooks/use-pyodide.ts` -- add `input_request` message handling + `waitingForInput` state
- `src/components/ConsoleOutput.tsx` -- replace contentEditable with proper input bar
- `src/pages/Index.tsx` -- pass `waitingForInput` prop

