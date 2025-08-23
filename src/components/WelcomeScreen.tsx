import { Database, FolderOpen, TrendingUp, User } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DirectorySelector } from "@/components/layouts/sidebar/DirectorySelector";
import { CopyButton } from "./ui/copy-button";
import { ShimmerBorder } from "./ui/ShimmerBorder";


export function WelcomeScreen() {
    const [customUsername, setCustomUsername] = useLocalStorage("claude-username", "");
    const username = customUsername.trim() || "username";

    return (
        <div className="flex flex-1 items-center justify-center p-6">
            <ShimmerBorder
                className="w-full max-w-2xl p-6 pt-12 border-zinc-900 border-2"
                shimmerColor="rgba(255, 255, 255, 0.25)"
                background="var(--card)"
                borderRadius="0.75rem"
                shimmerDuration="10s"
                shimmerSize="2px">
                <div className="text-center space-y-12">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold">Welcome</h1>
                        <p className="text-muted-foreground">Claude Code Conversation Analytics</p>
                    </div>

                    <div className="text-muted-foreground text-sm space-y-2 text-left">
                        <div className="flex items-center justify-between gap-4">
                            <p className="font-medium pl-2 text-zinc-400">To get started, please select your Claude data directory.:</p>
                            <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <Input
                                    placeholder="username"
                                    value={customUsername}
                                    onChange={(e) => setCustomUsername(e.target.value)}
                                    className="h-6 w-24 text-xs px-2"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-accent/50 transition-colors">
                                <Badge variant="outline">Windows</Badge>
                                <code className="text-sm font-mono flex-1">C:\Users\{username}\.claude</code>
                                <CopyButton text={`C:\\Users\\${username}\\.claude`} id="windows" />
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-accent/50 transition-colors">
                                <Badge variant="outline">macOS</Badge>
                                <code className="text-sm font-mono flex-1">/Users/{username}/.claude</code>
                                <CopyButton text={`/Users/${username}/.claude`} id="macos" />
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-accent/50 transition-colors">
                                <Badge variant="outline">Linux</Badge>
                                <code className="text-sm font-mono flex-1">/home/{username.toLowerCase()}/.claude</code>
                                <CopyButton text={`/home/${username.toLowerCase()}/.claude`} id="linux" />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center p-4 rounded-lg bg-card/50 border">
                            <Database className="h-8 w-8 mx-auto mb-2" />
                            <h3 className="font-semibold">Track Conversations</h3>
                            <p className="text-sm text-muted-foreground">Daily activity and session analytics</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-card/50 border">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                            <h3 className="font-semibold">Usage Insights</h3>
                            <p className="text-sm text-muted-foreground">Understand your coding patterns</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-card/50 border">
                            <FolderOpen className="h-8 w-8 mx-auto mb-2" />
                            <h3 className="font-semibold">Project Analysis</h3>
                            <p className="text-sm text-muted-foreground">Per-project activity breakdown</p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <DirectorySelector />
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                        <p>Requires Chrome, Edge, or another browser with File System Access API support</p>
                    </div>
                </div>
            </ShimmerBorder>
        </div>
    );
}