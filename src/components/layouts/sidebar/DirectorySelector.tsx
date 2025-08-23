import { useQueryClient } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/lib/store";

export function DirectorySelector() {
    const { setDirectoryHandle } = useFilterStore();
    const queryClient = useQueryClient();

    const handleSelectDirectory = async () => {
        try {
            if ("showDirectoryPicker" in window) {
                const directoryHandle = await (window as any).showDirectoryPicker({
                    mode: "read",
                    startIn: "documents"
                });

                setDirectoryHandle(directoryHandle);
                queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
                queryClient.invalidateQueries({ queryKey: ["projects"] });
            } else {
                alert("File System Access API not supported in this browser. Please use Chrome, Edge, or another compatible browser.");
            }
        } catch (error) {
            console.error("Error selecting directory:", error);
            if (error instanceof Error && error.name === "AbortError") {
                console.log("User cancelled directory selection");
            }
        }
    };

    return (
        <Button onClick={handleSelectDirectory} size="lg" className="w-full">
            <FolderOpen className="h-5 w-5 mr-2" />
            Select Claude Directory
        </Button>
    );
}