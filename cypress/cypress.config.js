// cypress.config.js
const {defineConfig} = require('cypress');

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
        baseUrl: 'http://localhost:8080',
        viewportHeight: 800,
        viewportWidth: 1440,
    },
});