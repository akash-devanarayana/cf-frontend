// cypress.config.js
const {defineConfig} = require('cypress');

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
        baseUrl: 'http://localhost:3000/src',
        viewportHeight: 800,
        viewportWidth: 1440,
        supportFile: false,
    },
});