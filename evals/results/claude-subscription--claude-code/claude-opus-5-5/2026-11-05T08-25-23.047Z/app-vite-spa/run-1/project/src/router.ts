import * as React from 'react';

/**
 * Minimal hash router: `#/notes` → `/notes`.
 * Hash routing needs no server config, so the build works from any static host.
 */
function getPath(): string {
    const path = window.location.hash.replace(/^#/, '') || '/';
    return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

function subscribe(onChange: () => void) {
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
}

export function useHashPath(): string {
    return React.useSyncExternalStore(subscribe, getPath, () => '/');
}

export function toHref(path: string): string {
    return `#${path}`;
}
