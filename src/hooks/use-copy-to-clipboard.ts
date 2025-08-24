import * as React from "react";

export function useCopyToClipboard() {
    const [copiedStates, setCopiedStates] = React.useState<{ [key: string]: boolean }>({});

    const copyToClipboard = React.useCallback(async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedStates((prev) => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopiedStates((prev) => ({ ...prev, [id]: false }));
            }, 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    }, []);

    const isCopied = React.useCallback(
        (id: string) => {
            return copiedStates[id] || false;
        },
        [copiedStates]
    );

    return {
        copyToClipboard,
        isCopied
    };
}
