describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should navigate to login page', () => {
    cy.get('a').contains('Login').click();
    cy.url().should('include', '/login');
    cy.get('h1').should('contain', 'Login');
  });

  it('should navigate to register page', () => {
    cy.get('a').contains('Register').click();
    cy.url().should('include', '/register');
    cy.get('h1').should('contain', 'Register');
  });

  it('should show validation errors on login form', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.get('.form-error-message').should('exist');
  });

  it('should show validation errors on register form', () => {
    cy.visit('/register');
    cy.get('button[type="submit"]').click();
    cy.get('.form-error-message').should('exist');
  });

  it('should register a new user', () => {
    // Intercept the registration API call
    cy.intercept('POST', '/auth/signup', {
      statusCode: 201,
      body: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User'
      }
    }).as('registerUser');

    cy.visit('/register');
    
    // Fill out the form
    cy.get('#email').type('test@example.com');
    cy.get('#username').type('testuser');
    cy.get('#password').type('Password123');
    cy.get('#confirmPassword').type('Password123');
    cy.get('#role').select('customer');
    cy.get('#first_name').type('Test');
    cy.get('#last_name').type('User');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call
    cy.wait('@registerUser');
    
    // Should be redirected to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should login a user', () => {
    // Intercept the login API call
    cy.intercept('POST', '/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt-token',
        token_type: 'bearer',
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          role: 'customer',
          first_name: 'Test',
          last_name: 'User'
        }
      }
    }).as('loginUser');

    cy.visit('/login');
    
    // Fill out the form
    cy.get('#username').type('testuser');
    cy.get('#password').type('Password123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call
    cy.wait('@loginUser');
    
    // Should be redirected to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Should show user is logged in
    cy.get('button').contains('Logout').should('exist');
  });

  it('should logout a user', () => {
    // Setup a logged-in state
    localStorage.setItem('auth_token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      role: 'customer'
    }));
    
    // Intercept the logout API call
    cy.intercept('POST', '/auth/logout', {
      statusCode: 200,
      body: { message: 'Logged out successfully' }
    }).as('logoutUser');
    
    cy.visit('/');
    
    // Click logout button
    cy.get('button').contains('Logout').click();
    
    // Wait for the API call
    cy.wait('@logoutUser');
    
    // Should show login/register links
    cy.get('a').contains('Login').should('exist');
    cy.get('a').contains('Register').should('exist');
  });
});