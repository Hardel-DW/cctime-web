import { useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useFilterStore } from "@/lib/store";

export function SettingsPopover() {
    const { clearDirectoryHandle, setDirectoryHandle } = useFilterStore();
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
        <SidebarMenuItem>
            <Popover>
                <PopoverTrigger asChild>
                    <SidebarMenuButton tooltip="Settings">
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start" side="right">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Settings</h4>
                            <p className="text-sm text-muted-foreground">Configure your CCTime preferences</p>
                        </div>

                        <div className="grid gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="claude-path">Claude Data Directory</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleSelectDirectory} className="flex-1 justify-start">
                                        <FolderOpen className="h-4 w-4 mr-2" />
                                        Select Claude Directory
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Select your Claude data directory to load real projects and conversation data
                                </p>
                                <p className="text-xs text-orange-600">
                                    Note: Requires Chrome, Edge, or another browser with File System Access API support
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button onClick={() => clearDirectoryHandle()} variant="outline" size="sm" className="flex-1">
                                Reset Directory
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </SidebarMenuItem>
    );
}
