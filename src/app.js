// Script to simulate UI changes that would break selectors
document.getElementById('switch-version').addEventListener('click', function () {
    // Change login form
    const loginForm = document.querySelector('.login-form');
    loginForm.classList.remove('login-form');
    loginForm.classList.add('user-form');

    // Change submit button
    const submitButton = document.querySelector('.submit-button');
    submitButton.classList.remove('submit-button');
    submitButton.classList.add('btn-primary');

    // Change product items
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        item.classList.remove('product-item');
        item.classList.add('catalog-item');
    });

    // Change action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.classList.remove('action-btn');
        btn.classList.add('ui-button');
    });

    // Update button text
    this.textContent = 'Version 2 Active (Selectors Changed)';
    this.disabled = true;

    // Add notification
    const notification = document.createElement('div');
    notification.style.backgroundColor = '#ffd700';
    notification.style.padding = '10px';
    notification.style.marginTop = '20px';
    notification.style.borderRadius = '4px';
    notification.innerHTML = '<strong>UI Updated!</strong> The selectors have been changed, which would normally break Cypress tests.';
    document.querySelector('.container').appendChild(notification);
});