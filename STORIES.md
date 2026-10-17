# Configurer Jest dans un projet React + Vite + TypeScript

Ce guide part d'un projet créé avec `npm create vite@latest` (template React + TypeScript). Il va jusqu'à un premier test de composant qui passe.

À la fin, vous aurez :

- Jest qui compile le TypeScript et le JSX ;
- un navigateur simulé pour afficher des composants React ;
- les vérifications de Testing Library (`toBeInTheDocument()`…) ;
- un éditeur (VS Code) qui reconnaît `test`, `expect`, etc. sans soulignement rouge.

---

## 1. Installer les dépendances

```cmd
npm i -D jest @types/jest ts-jest jest-environment-jsdom
npm i -D @testing-library/react @testing-library/dom @testing-library/jest-dom
```

| Paquet | À quoi il sert |
|---|---|
| `jest` | Le lanceur de tests. |
| `@types/jest` | Les types TypeScript de `test`, `describe`, `expect`… |
| `ts-jest` | Permet à Jest de lire les fichiers `.ts` et `.tsx`. |
| `jest-environment-jsdom` | Simule un navigateur (`document`, `window`) dans Node. |
| `@testing-library/react` | `render()` et `screen` pour afficher un composant et le tester. |
| `@testing-library/dom` | Nécessaire à `@testing-library/react`, qui ne l'installe pas tout seul. |
| `@testing-library/jest-dom` | Ajoute des vérifications sur le DOM : `toBeInTheDocument()`, `toHaveTextContent()`… |

## 2. Ajouter le script de test

Dans `package.json` :

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "jest --watchAll"
}
```

`--watchAll` relance les tests à chaque sauvegarde. Pour une exécution unique, utilisez `npx jest`.

## 3. Créer la configuration Jest : `jest.config.cjs`

> **Pourquoi `.cjs` ?** Le `package.json` de Vite contient `"type": "module"`, donc un fichier `.js` y est traité comme un module ES. L'extension `.cjs` force le format CommonJS : il faut alors écrire `module.exports` et `require`, **jamais** `export default`.
>
> `npx ts-jest config:init` génère un fichier qui mélange les deux formats et qui plante. Mieux vaut l'écrire à la main.

```js
/** @type {import("jest").Config} **/
module.exports = {
  // Simule un navigateur (document, window...) pour pouvoir rendre des composants React
  testEnvironment: "jsdom",

  // Compile les fichiers .ts/.tsx avec ts-jest, en utilisant la config TypeScript dédiée aux tests
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },

  // Jest ne sait pas lire le CSS ni les images : on les remplace par des modules factices
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/test/styleMock.cjs",
    "\\.(png|jpe?g|gif|webp|svg)$": "<rootDir>/test/fileMock.cjs",
  },

  // Exécuté avant chaque fichier de test : ajoute les matchers comme toBeInTheDocument()
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
```

## 4. Créer les modules factices pour le CSS et les images

Vite sait importer `import './App.css'` ou `import logo from './logo.svg'`, mais Jest ne le sait pas. On lui donne donc des fichiers de remplacement.

`test/styleMock.cjs` :

```js
module.exports = {};
```

`test/fileMock.cjs` :

```js
module.exports = "test-file-stub";
```

## 5. Créer le fichier de setup : `jest.setup.ts`

```ts
import "@testing-library/jest-dom";
```

Jest exécute ce fichier avant chaque fichier de test (option `setupFilesAfterEnv`). Grâce à lui, `toBeInTheDocument()` et les autres vérifications sont disponibles partout.

## 6. Créer une config TypeScript pour les tests : `tsconfig.test.json`

L'application et les tests n'ont pas les mêmes besoins :

- l'application est compilée par Vite au format ES modules ;
- les tests sont compilés par ts-jest au format **CommonJS** et ont besoin des types de Jest.

On crée donc une config séparée, qui hérite de celle de l'application :

```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.test.tsbuildinfo",
    "types": ["vite/client", "jest", "@testing-library/jest-dom", "node"],

    /* Jest exécute du CommonJS : on adapte la sortie de TypeScript */
    "module": "commonjs",
    "moduleResolution": "node10",
    "verbatimModuleSyntax": false,
    "esModuleInterop": true,
    "ignoreDeprecations": "6.0"
  },
  "exclude": [],
  "include": ["src/**/*.spec.ts", "src/**/*.spec.tsx", "src/**/*.d.ts", "jest.setup.ts"]
}
```

Les options importantes :

- **`types`** : quand cette option est présente, TypeScript ne charge **que** les types listés. C'est pour ça que `test` et `expect` étaient soulignés en rouge au départ : `tsconfig.app.json` ne contenait que `vite/client`. On garde `vite/client` ici, parce qu'il déclare les imports d'images et de CSS.
- **`module` / `moduleResolution`** : sortie au format CommonJS, que Jest sait exécuter.
- **`verbatimModuleSyntax: false`** : cette option est incompatible avec une sortie CommonJS.
- **`ignoreDeprecations: "6.0"`** : TypeScript 6 signale `node10` comme obsolète. Cette ligne fait taire l'avertissement.
- **`exclude: []`** : sans elle, la config hériterait de l'`exclude` de `tsconfig.app.json` (voir l'étape 7) et ignorerait les fichiers de test.

## 7. Séparer l'application et les tests

Dans `tsconfig.app.json`, excluez les fichiers de test pour qu'ils dépendent uniquement de `tsconfig.test.json` :

```json
  "include": ["src"],
  "exclude": ["src/**/*.spec.ts", "src/**/*.spec.tsx"]
```

Dans `tsconfig.json`, ajoutez la référence à la config de test. C'est ce qui permet à VS Code (et à `tsc -b`) de la trouver :

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.test.json" }
  ]
}
```

## 8. Écrire un premier test : `src/App.spec.tsx`

> Le fichier doit finir par **`.tsx`** dès qu'il contient du JSX (`<App />`).

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("Should be true", () => {
    expect(true).toBe(true);
})

test("affiche le titre et incrémente le compteur au clic", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Get started" })).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /count is 0/i });
    fireEvent.click(button);

    expect(button).toHaveTextContent("Count is 1");
})
```

Le second test se lit en trois temps :

1. `render(<App />)` affiche le composant dans le navigateur simulé.
2. `screen.getByRole(...)` cherche un élément comme le ferait un utilisateur : par son rôle (bouton, titre…) et son texte.
3. `fireEvent.click(...)` simule un clic, puis on vérifie le résultat.

## 9. Lancer les tests

```cmd
npm test
```

Résultat attendu :

```
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

---

## Structure finale

```
react-jest/
├── jest.config.cjs        ← configuration Jest
├── jest.setup.ts          ← chargé avant chaque fichier de test
├── test/
│   ├── fileMock.cjs       ← remplace les images
│   └── styleMock.cjs      ← remplace le CSS
├── tsconfig.json          ← référence app + node + test
├── tsconfig.app.json      ← exclut les *.spec.*
├── tsconfig.test.json     ← config TypeScript des tests
└── src/
    ├── App.tsx
    └── App.spec.tsx
```

## En cas de problème

| Symptôme | Cause et solution |
|---|---|
| `test`, `expect` soulignés en rouge | Les types Jest ne sont pas chargés. Vérifiez `types` dans `tsconfig.test.json` et la référence dans `tsconfig.json`, puis faites `Ctrl+Shift+P` → **TypeScript: Restart TS Server**. |
| `toBeInTheDocument` souligné en rouge | Il manque `@testing-library/jest-dom` dans `types`, ou `jest.setup.ts` dans `include`. |
| `Cannot find module './assets/xxx.png'` | Il manque `vite/client` dans `types` de `tsconfig.test.json`. |
| Erreur de syntaxe sur un `.css` ou une image | La règle `moduleNameMapper` de `jest.config.cjs` est absente ou ne couvre pas cette extension. |
| `export default` / `module is not defined` dans `jest.config.cjs` | Le fichier mélange CommonJS et ES modules. Utilisez uniquement `module.exports`. |
| `document is not defined` | Il faut `testEnvironment: "jsdom"` et le paquet `jest-environment-jsdom` installé. |

## Pour aller plus loin

- **`@testing-library/user-event`** (`npm i -D @testing-library/user-event`) simule les interactions de façon plus réaliste que `fireEvent` (frappe au clavier, survol…).
- **Vitest** : une alternative à Jest très utilisée avec Vite. Il réutilise la config Vite, ce qui évite la plupart des étapes ci-dessus. Son API est presque identique.
