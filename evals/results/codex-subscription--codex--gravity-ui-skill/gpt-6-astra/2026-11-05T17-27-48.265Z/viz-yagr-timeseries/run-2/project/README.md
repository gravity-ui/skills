# CPU monitoring

Run `npm install` and `npm run dev`. Verification: `npm run build` and `npx vitest run`.

The page currently uses **demonstration data**, not machine metrics: 43,201 points
for the last 24 hours, followed by a measurement every second. ThemeProvider
follows the system theme; CpuChart also responds to changes in a parent provider.

To connect a real transport, replace `demoCpuSource` in `src/App.tsx` with a stable
`CpuSource` object. Its `subscribe(onSamples, onError)` must emit history followed
by ordered live batches, and return a function that cancels pending requests,
unsubscribes listeners, and closes its connection. An asynchronous transport must
handle cancellation during history loading too. Timestamps are Unix milliseconds,
CPU values are 0–100, and null represents a gap. Empty batches finish the loading
state. The adapter should replay live measurements received while history loads.
Late/out-of-order timestamps and invalid/future points are discarded; a duplicate
of the latest timestamp replaces its value.

Storage is capped at 100,000 points and the rolling 24-hour window. A faster source
exceeding that capacity must aggregate upstream or explicitly raise the capacity.
Samples stay outside React state. Updates are coalesced at 250 ms and painted in
requestAnimationFrame; YAGR's existing series is updated by ID, avoiding its full
replacement path that rebuilds uPlot. A one-second timer advances the window and
expires old measurements even if the source stops. Zoom remains fixed during live
updates; “Показать сутки” returns to the live window.

The component owns ResizeObserver (YAGR's internal adaptive mode is disabled),
clears queued timers/animation frames, unsubscribes the source, and calls dispose
on cleanup, including React StrictMode cleanup and remount.

Manual browser checks still needed: light/dark contrast, ~375px and ~1400px widths,
tooltip and drag zoom during updates, hidden-to-visible resize, loading/empty/error
states, and repeated mounts/unmounts. Typechecking and data tests do not establish
browser rendering performance; profile with the production stream and target hardware.
