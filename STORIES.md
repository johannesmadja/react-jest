```cmd 
npm i -D jest @types/jest
```
* Modifier le script du package.json 

```script
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "jest --watchAll"
  },
```

J'ai ajouté `"jest"` à la liste `types` de [tsconfig.app.json](tsconfig.app.json). Je n'ai pas encore lancé les tests.

Si le soulignement rouge reste, redémarrez le serveur TypeScript de VS Code : `Ctrl+Shift+P` puis **TypeScript: Restart TS Server**.

**Attention pour la suite :** ce changement règle seulement l'éditeur. Quand vous lancerez `npm test`, Jest ne saura pas encore lire du TypeScript ni du JSX, et la commande échouera. Il manque deux choses :

1. **Transformer le TypeScript.** La solution la plus simple est `ts-jest` :
   ```
   npm i -D ts-jest
   npx ts-jest config:init
   ```
   Le projet est en `"type": "module"`, donc le fichier de config généré devra peut-être s'appeler `jest.config.cjs`.
2. **Tester des composants React.** Il faut un environnement de navigateur simulé et la bibliothèque de test :
   ```
   npm i -D jest-environment-jsdom @testing-library/react @testing-library/jest-dom
   ```
   Ensuite, mettez `testEnvironment: "jsdom"` dans la config Jest. Pour un fichier qui contient du JSX, utilisez l'extension `.spec.tsx` plutôt que `.spec.ts`.

Une alternative à envisager : avec Vite, beaucoup de projets utilisent **Vitest** plutôt que Jest. Il reprend la config Vite, gère TypeScript et JSX sans configuration, et son API est presque identique (`describe`, `it`, `expect`). Si vous tenez à apprendre Jest, je peux faire la configuration complète avec vous.