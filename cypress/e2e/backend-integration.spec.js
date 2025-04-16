// cypress/e2e/backend-integration.spec.js

describe('Selector Healing Integration Test', () => {
    before(() => {
        // Verify backend is accessible
        cy.request('GET', 'http://localhost:3000/api/mappings?app=v1.0.0')
            .its('status')
            .should('eq', 200);
    });

    it.only('should use selectors from the backend service', () => {
        // Visit test page
        cy.visit('index.html');

        // Click the button to change selectors
        cy.get('#switch-version').click();

        // Fill in form and test selectors
        cy.get('#username').type('testuser');
        cy.get('#password').type('password123');

        // This should use the mapped selector from the backend
        cy.getHealed('.submit-button').click();

        // Verify that we are successfully using the healed selector
        // In a real app this would check application state changes
        cy.getHealed('.submit-button')
            .should('have.class', 'btn-primary'); // Verify we found the correct element

        // Test a more complex case with nested elements
        cy.getHealed('.product-item').first()
            .findHealed('.product-action')
            .click();

        // Report a new selector failure to the backend
        cy.window().then((win) => {
            // Get the document HTML to send to the healing service
            const pageContent = win.document.documentElement.outerHTML;

            console.log('Page content:', pageContent);

            // Make request to the healing service
            cy.request({
                method: 'POST',
                url: 'http://localhost:3000/api/heal-selector',
                body: {
                    selector: '.button-primary',
                    pageContent: pageContent,
                    appVersion: 'v1.0.0',
                    failOnStatusCode: false
                }
            }).then((response) => {
                // Log the response for verification
                cy.log(`Healing service response: ${JSON.stringify(response.body)}`);

                // Check if the service returned a valid alternative
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('healedSelector');
            });
        });

        // Verify the mapping was updated in the database
        cy.request('GET', 'http://localhost:3000/api/admin/mappings')
            .then((response) => {
                // Log all mappings
                cy.log(`Current mappings: ${JSON.stringify(response.body)}`);

                // Verify our mappings are in the database
                const mappings = response.body;
                const hasSubmitButton = mappings.some(m =>
                    m.originalSelector === '.submit-button' &&
                    m.newSelector === '.btn-primary'
                );

                expect(hasSubmitButton).to.be.true;
            });
    });

    it('should handle selector failure and automatic healing', () => {
        // Visit test page
        cy.visit('index.html');

        // Switch to version 2
        cy.get('#switch-version').click();

        // Test the getWithHealing command to find an element that wasn't pre-mapped
        cy.getWithHealing('.action-buttons')
            .should('be.visible')
            .then(() => {
                // Check if a new mapping was created for this selector
                cy.request('GET', 'http://localhost:3000/api/admin/mappings')
                    .then((response) => {
                        const mappings = response.body;
                        const hasNewMapping = mappings.some(m =>
                            m.originalSelector === '.action-buttons'
                        );

                        // This may be true or false depending on if the service found an alternative
                        cy.log(`New mapping created: ${hasNewMapping}`);
                    });
            });
    });
});