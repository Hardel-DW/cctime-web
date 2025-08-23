Structure du projets :

- public/ -> contient les fichiers statiques (images)
- src/ -> contient le code source

Structure des sources :

- assets/ -> contient les fichiers statiques (images)
- components/ -> contient les composants
- hooks/ -> contient les hooks reacts
- lib/ -> contient les fichiers utilitaires et qui manipules les données
- routes/ -> contient les routes de l'application en Tanstack Router

- main.tsx -> point d'entrée de l'application avec Root et App
- App.tsx -> Contient l'initialisation de Tanstack Router et de la Query Client
- global.css -> contient les styles globaux de l'application. Utilise Tailwind
  CSS 4
- routeTree.gen.ts -> Fichier auto-généré par Tanstack Router contenant les
  routes de l'application
- vite-env.d.ts -> contient les types de l'application

Structures du dossier components :

- charts/ -> Contient un dossier par routes. Contient les composants de recharts
  qui sont utilisés dans l'application a chaque fois qu'ont veut afficher un
  graphique ou créera un component, la logique TS spécifique seras présent dans
  le composant.
- ui/ -> Contient les composants primitives de shadcn/ui et certains composants
  personnalisés. (Que des primitives)

Structures du dossier libs :

- data/ -> Contient des JSON notament Sidebar, les prix des modéles Claude des
  données statiques.
- models/ -> Contient l'orientés objets qui manipulents les données JSONL de
  claude.
- types/ -> Contient les types de l'application.
- store.ts -> Contient les données primitives trouver dans claude.
- utils.ts -> Contient notament cn.

Processus :

- Ont récupére les données du dossier que l'utilisateur a sélectionné dans le
  store comme primitives sans faire de modification dessus ou trés peu.
- Ont utilise la logique orientés objets pour manipuler les données.
- Ont créer une routes avec le dossiers routes de Tanstack Router.
- Ont créer un composant pour chaque route. (Ces composants ne doivent contenir
  strictement que des hooks ou des composants pas de logique TS)
- Pour chaque graphique, ont créer un composant dans le dossier charts/ et on
  utilise recharts pour afficher le graphique. Ce fichier auras des logiques TS
  spécifique.

Régles :

- Pas de redondance de code.
- Chaque methodes dans les classes doivent être pensés pour être réutilisable.
- Les methodes doivent faire moins de 10 lignes de code et doivent faire un truc
  et correctement.
- Ont évites les finalités dans les classes. Ont préféres mettre la logique
  dédiés dans les composants de charts.
- Ont évite de faire des codes surperflux.
- Ont évite le statique dans les classes exepters pour les design patterns.
- Pas de support de Legacy ou de Deprecated.
- Une logique simple.

Ont veut déplacer la logique liés a chaque charts dans sont component chart a
lui. Et pas mettre dans le composant mére.

Ont veut que les composants de chaque routes ConversationActivity Dashboard
SessionDetails Prices Sessions TokenUsage soit a terme fusionnés dans le
component du dossier routes, mais pour cela il faut qu'il y est que des
composant et des hooks. Pas de logique TS.
