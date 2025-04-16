let selectorMappings = {};
const classMappings = {};
const idMappings = {};

// Function to initialize the selector healer
const initSelectorHealer = () => {
    const appVersion = Cypress.env('APP_VERSION') || 'v1.0';

    // Fetch mappings from the cf-mapping-service
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('CF_MAPPING_SERVICE_URL')}/api/mappings`,
        qs: {
            version: appVersion
        },
        failOnStatusCode: true
    }).then((response) => {
        if (response.status === 200) {
            selectorMappings = response.body;
            Cypress.log({
                name: 'Selector Healer',
                message: `Loaded ${Object.keys(selectorMappings).length} selector mappings`
            });
        } else {
            // If backend is not available, use our fallback mappings
            selectorMappings = {
                '.submit-button': '.btn-primary',
                '.product-item': '.catalog-item',
                '.product-action': '.ui-button',
                '.action-btn': '.ui-button'
            };

            Cypress.log({
                name: 'Selector Healer',
                message: 'Using fallback mappings (backend not available)'
            });
        }
    });
};

before(() => {
    initSelectorHealer();
});

// Add custom commands for healed selectors
Cypress.Commands.add('getHealed', (selector, options) => {
    let healedSelector;
    for (const object in selectorMappings) {
        if (object.originalSelector === selector) {
            console.log(object);
        }
    }

    if (healedSelector !== selector) {
        Cypress.log({
            name: 'Selector Healed',
            message: `Original: "${selector}" → Healed: "${healedSelector}"`
        });
    }

    return cy.get(healedSelector, options);
});

// Add a custom command for healed find
Cypress.Commands.add('findHealed', {prevSubject: true}, (subject, selector, options) => {
    // Check if this selector needs translation
    const healedSelector = selectorMappings[selector] || selector;

    // Log the healing for demonstration
    if (healedSelector !== selector) {
        Cypress.log({
            name: 'Selector Healed',
            message: `Original: "${selector}" → Healed: "${healedSelector}"`
        });
    }

    // Call the original find with the healed selector
    return cy.wrap(subject).find(healedSelector, options);
});

// Add a command to handle selector failure with automatic healing
// Fixed getWithHealing command
Cypress.Commands.add('getWithHealing', (selector, options) => {
    // First check if element exists
    cy.get('body').then($body => {
        const exists = $body.find(selector).length > 0;

        if (exists) {
            // Element exists, use normal get
            return cy.get(selector, options);
        } else {
            // Element doesn't exist, try to heal
            Cypress.log({
                name: 'Healing Attempt',
                message: `Selector "${selector}" failed, contacting healing service...`
            });

            // Get the page content for analysis
            return cy.document().then((document) => {
                const pageContent = document.documentElement.outerHTML;

                // Request healing from the service
                return cy.request({
                    method: 'POST',
                    url: `${BACKEND_URL}/api/heal-selector`,
                    body: {
                        selector,
                        pageContent,
                        appVersion: Cypress.env('APP_VERSION') || 'v1.0.0'
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    if (response.status === 200 && response.body.healedSelector) {
                        const healedSelector = response.body.healedSelector;

                        // Update our local mappings
                        selectorMappings[selector] = healedSelector;

                        Cypress.log({
                            name: 'Selector Healed',
                            message: `Healing service provided: "${healedSelector}"`
                        });

                        // Use the healed selector
                        return cy.get(healedSelector, options);
                    }

                    // If healing failed, report the failure to the service
                    return cy.request({
                        method: 'POST',
                        url: `${BACKEND_URL}/api/report-failure`,
                        body: {
                            selector,
                            context: {
                                testTitle: Cypress.currentTest ? Cypress.currentTest.title : 'unknown',
                                error: `Element with selector "${selector}" not found`
                            },
                            timestamp: new Date().toISOString(),
                            url: Cypress.config('baseUrl'),
                            appVersion: Cypress.env('APP_VERSION') || 'v1.0.0'
                        },
                        failOnStatusCode: false
                    }).then(() => {
                        // Return a failing assertion with a clear message
                        return cy.get(selector, options); // This will fail with a standard Cypress error
                    });
                });
            });
        }
    });
});

// Add a command to manually update a mapping
Cypress.Commands.add('updateSelectorMapping', (originalSelector, newSelector) => {
    // Update local mapping
    selectorMappings[originalSelector] = newSelector;

    // Update remote mapping
    cy.request({
        method: 'POST',
        url: `${BACKEND_URL}/api/update-mapping`,
        body: {
            originalSelector,
            newSelector,
            appVersion: Cypress.env('APP_VERSION') || 'v1.0.0'
        },
        failOnStatusCode: false
    });

    Cypress.log({
        name: 'Mapping Updated',
        message: `Added mapping: "${originalSelector}" → "${newSelector}"`
    });
});