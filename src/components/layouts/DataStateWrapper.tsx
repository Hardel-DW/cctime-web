import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useFilterStore } from "@/lib/store";

interface DataStateWrapperProps {
    isLoading: boolean;
    error: Error | null;
    loadingMessage: string;
    noDirectoryIcon: ReactNode;
    noDirectoryMessage: string;
    children: ReactNode;
}

export function DataStateWrapper({
    isLoading,
    error,
    loadingMessage,
    noDirectoryIcon,
    noDirectoryMessage,
    children
}: DataStateWrapperProps) {
    const { directoryHandle } = useFilterStore();

    if (!directoryHandle) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground flex items-center justify-center">
                            {noDirectoryIcon}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Directory Selected</h3>
                        <p className="text-muted-foreground">{noDirectoryMessage}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted-foreground">{loadingMessage}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <div className="h-12 w-12 mx-auto mb-4 text-red-500 flex items-center justify-center">
                            {noDirectoryIcon}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                        <p className="text-muted-foreground mb-4">Failed to load data.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}