# CPU monitoring

`npm install`, `npm run dev`. Verification: `npm test` and `npm run build`.

The page currently uses **explicitly labeled demonstration data**: 43,201 initial
measurements covering 24 hours, with a new sample every two seconds. No monitoring
API was present in this project.

To connect production metrics, supply a stable `CpuDataSource` to `CpuChart` in
`src/App.tsx`. Its `subscribe(onData, onError)` must emit chronological history,
then chronological live batches, and return a function that closes the socket,
aborts pending history requests, and removes listeners. Timestamps are Unix
milliseconds; CPU values are 0–100 or `null` for missing measurements. Send `[]`
for a successful empty history and call `onError` for connection/load failures.
The adapter owns transport-specific reconnection and history/live synchronization.
The UI offers a retry that disposes and reconnects the source.

The ring buffer retains at most 100,000 samples and expires points older than
24 hours. At higher sample rates, aggregate upstream or increase the capacity;
the cap takes precedence over retaining the full day. Duplicate latest timestamps
replace their values; older out-of-order samples, future timestamps, and invalid
percentages are ignored. Rendering is coalesced to at most four data updates per
second, independently of the incoming event rate. Raw samples live outside React
state. The Yagr Canvas renderer draws the existing series, with markers disabled.

Drag horizontally to zoom; “Вернуться к 24 часам” restores the moving daily
window. Incoming samples preserve the selected range. The host is responsive in
width and has an explicit responsive height. The chart consumes the surrounding
Gravity UI theme; the application provider follows the OS light/dark preference.
Disposal closes the source, cancels pending animation frames and timers,
disconnects ResizeObserver and calls Yagr's `dispose()`.

Tests cover retention/capacity, invalid samples, update coalescing, zoom, theme
updates, error/empty recovery and cleanup with a mocked renderer. Build/typecheck
do not verify visual appearance or actual browser frame rates. Manual checks:
light/dark themes, widths near 375px and 1400px, container resizing, hover/zoom,
and loading/empty/error states using an API adapter.
