import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
    text: string;
    id: string;
    className?: string;
}

export function CopyButton({ text, id, className = "" }: CopyButtonProps) {
    const { copyToClipboard, isCopied } = useCopyToClipboard();
    const isTextCopied = isCopied(id);

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn(
                "h-6 w-6 p-0 transition-colors cursor-pointer",
                isTextCopied &&
                    "text-green-400 bg-green-500/10 hover:bg-green-500/20 dark:text-green-400 dark:bg-green-500/10 dark:hover:bg-green-500/20",
                className
            )}
            onClick={() => copyToClipboard(text, id)}>
            {isTextCopied ? <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" /> : <Copy className="h-3 w-3" />}
        </Button>
    );
}
