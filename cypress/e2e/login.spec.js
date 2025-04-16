// login.spec.js
describe('Login Test', () => {
    it('should fill login form and click submit', () => {
        // Visit our test page
        cy.visit('index.html')

        // Fill the login form
        cy.get('#username').type('testuser')
        cy.get('#password').type('password123')

        // Click the submit button using class selector that will change
        cy.get('.submit-button').click()

        // Click a product's Add to Cart button
        cy.get('.product-item').first().find('.product-action').click()

        // Click checkout
        cy.get('#checkout-btn').click()
    })
})