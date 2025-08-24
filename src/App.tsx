import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Create a query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10 // 10 minutes
        }
    }
});

// Create the router instance
const router = createRouter({
    routeTree,
    context: {
        queryClient
    },
    defaultPreload: "intent",
    defaultPreloadDelay: 10,
    defaultPreloadStaleTime: 1000 * 60 * 5 // 5 minutes
});

// Register things for typesafety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}
