// login-with-healing.spec.js
describe('Login Test with Selector Healing', () => {
    it('should fill login form and click submit even after UI changes', () => {
        // Visit our test page
        cy.visit('index.html');

        // Simulate UI changes by clicking the version switch button
        cy.get('#switch-version').click();

        // Fill the login form (these selectors don't change)
        cy.get('#username').type('testuser');
        cy.get('#password').type('password123');

        // These selectors would fail with normal cy.get but work with our healed versions

        // Old: cy.get('.submit-button').click()
        // New with healing:
        cy.getHealed('.submit-button').click();

        // Old: cy.get('.product-item').first().find('.product-action').click()
        // New with healing:
        cy.getHealed('.product-item').first().findHealed('.product-action').click();

        // Old: cy.get('#checkout-btn').click()
        // IDs usually don't change, but we can use the healed version for consistency:
        cy.getHealed('#checkout-btn').click();

        // For demonstration, let's also use our getWithHealing command
        // for a selector we didn't pre-map
        cy.getWithHealing('.action-buttons').should('be.visible');
    });
});