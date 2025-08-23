import { create } from "zustand";
import type { Project } from "./models/ClaudeDataManager";

export interface FilterState {
    // Filtres
    selectedProject: string | null;
    startDate: string | null; // YYYY-MM-DD format
    endDate: string | null; // YYYY-MM-DD format

    // Actions
    setSelectedProject: (project: string | null) => void;
    setStartDate: (date: string | null) => void;
    setEndDate: (date: string | null) => void;
    clearFilters: () => void;

    // Settings
    claudePath: string | null;
    directoryHandle: any;
    setClaudePath: (path: string | null) => void;
    setDirectoryHandle: (handle: any) => void;
    clearDirectoryHandle: () => void;

    // Data refresh
    dataRefreshKey: number;
    refreshData: () => void;

    // Projects
    projects: readonly Project[];
    isLoadingProjects: boolean;
    loadProjects: () => Promise<void>;
}

export const useFilterStore = create<FilterState>((set, get) => ({
    // Initial state
    selectedProject: null,
    startDate: null,
    endDate: null,
    claudePath: null,
    directoryHandle: null,
    dataRefreshKey: 0,
    projects: [],
    isLoadingProjects: false,

    // Actions
    setSelectedProject: (project) => set({ selectedProject: project }),
    setStartDate: (date) => set({ startDate: date }),
    setEndDate: (date) => set({ endDate: date }),
    clearFilters: () =>
        set({
            selectedProject: null,
            startDate: null,
            endDate: null
        }),

    // Settings
    setClaudePath: (path) => set({ claudePath: path, dataRefreshKey: Date.now(), projects: [] }),
    setDirectoryHandle: (handle) => set({ 
        directoryHandle: handle, 
        claudePath: handle?.name || "Directory selected",
        dataRefreshKey: Date.now(), 
        projects: [] 
    }),
    clearDirectoryHandle: () => set({ 
        directoryHandle: null, 
        claudePath: null, 
        dataRefreshKey: Date.now(), 
        projects: [] 
    }),

    // Data refresh
    refreshData: () => set((state) => ({ dataRefreshKey: state.dataRefreshKey + 1 })),

    // Projects
    loadProjects: async () => {
        const { projects, isLoadingProjects, directoryHandle } = get();
        if (projects.length > 0 || isLoadingProjects || !directoryHandle) return;

        set({ isLoadingProjects: true });
        try {
            const { ClaudeDataManager } = await import("./models/ClaudeDataManager");
            const projectsData = await ClaudeDataManager.loadProjectsFromDirectory(directoryHandle);
            set({ projects: projectsData, isLoadingProjects: false });
        } catch (error) {
            console.error("Failed to load projects:", error);
            set({ projects: [], isLoadingProjects: false });
        }
    }
}));
