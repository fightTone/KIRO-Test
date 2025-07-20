// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (username, password) => {
  cy.request({
    method: 'POST',
    url: '/auth/login',
    body: {
      username,
      password
    }
  }).then((response) => {
    localStorage.setItem('auth_token', response.body.access_token);
    localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Command for checking accessibility
Cypress.Commands.add('checkA11y', (context = null, options = null) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});