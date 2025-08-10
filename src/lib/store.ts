import { create } from "zustand";
import type { Project } from "./web-data-loader";

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
    setClaudePath: (path: string | null) => void;

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

    // Data refresh
    refreshData: () => set((state) => ({ dataRefreshKey: state.dataRefreshKey + 1 })),

    // Projects
    loadProjects: async () => {
        const { projects, isLoadingProjects } = get();
        if (projects.length > 0 || isLoadingProjects) return;

        set({ isLoadingProjects: true });
        try {
            const { loadProjectsFromDirectory } = await import("./web-data-loader");
            const projectsData = await loadProjectsFromDirectory();
            set({ projects: projectsData, isLoadingProjects: false });
        } catch (error) {
            console.error("Failed to load projects:", error);
            set({ projects: [], isLoadingProjects: false });
        }
    }
}));
