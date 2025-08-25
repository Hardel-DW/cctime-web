Project Structure:

- public/ -> contains static files (images)
- src/ -> contains source code

Source Structure:

- assets/ -> contains static files (images)
- components/ -> contains components
- hooks/ -> contains React hooks
- lib/ -> contains utility files and data manipulation
- routes/ -> contains application routes in TanStack Router

- main.tsx -> application entry point with Root and App
- App.tsx -> Contains TanStack Router and Query Client initialization
- global.css -> contains global application styles. Uses Tailwind CSS 4
- routeTree.gen.ts -> Auto-generated file by TanStack Router containing
  application routes
- vite-env.d.ts -> contains application types

Components folder structure:

- charts/ -> Contains a folder per route. Contains recharts components used in
  the application. Every time we want to display a chart or create a component,
  the specific TS logic will be present in the component.
- ui/ -> Contains shadcn/ui primitive components and some custom components.
  (Only primitives)

Libs folder structure:

- data/ -> Contains JSON files notably Sidebar, Claude model prices, static
  data.
- models/ -> Contains object-oriented classes that manipulate Claude's JSONL
  data.
- types/ -> Contains application types.
- store.ts -> Contains primitive data found in Claude.
- utils.ts -> Contains notably cn.

Process:

- We retrieve data from the folder that the user selected in the store as
  primitives without modifying them or very little.
- We use object-oriented logic to manipulate the data.
- We create a route with the TanStack Router routes folder.
- We create a component for each route. (These components should strictly
  contain only hooks or components, no TS logic)
- For each chart, we create a component in the charts/ folder and use recharts
  to display the chart. This file will have specific TS logic.

Rules:

- No code redundancy.
- Each method in classes must be designed to be reusable.
- Methods must be less than 10 lines of code and must do one thing correctly.
- We avoid finalities in classes. We prefer putting dedicated logic in chart
  components.
- We avoid superfluous code.
- We avoid static in classes except for design patterns.
- No Legacy or Deprecated support.
- Simple logic.
