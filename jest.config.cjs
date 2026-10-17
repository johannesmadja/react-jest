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
