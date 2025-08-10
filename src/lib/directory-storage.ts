let cachedDirectoryHandle: any = null;

export function setCachedDirectoryHandle(handle: any) {
    cachedDirectoryHandle = handle;
}

export function getCachedDirectoryHandle(): any {
    return cachedDirectoryHandle;
}

export function clearCachedDirectoryHandle() {
    cachedDirectoryHandle = null;
}
