describe('Shopping Flow', () => {
  beforeEach(() => {
    // Setup a logged-in state for a customer
    localStorage.setItem('auth_token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'customer@example.com',
      username: 'customer',
      role: 'customer'
    }));
    
    // Mock API responses
    cy.intercept('GET', '/shops*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'Test Shop',
          description: 'A test shop',
          category_id: 1,
          category_name: 'Clothing',
          address: '123 Test St',
          image_url: null
        }
      ]
    });
    
    cy.intercept('GET', '/shops/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Test Shop',
        description: 'A test shop',
        category_id: 1,
        category_name: 'Clothing',
        address: '123 Test St',
        image_url: null,
        owner: {
          id: 2,
          username: 'shopowner'
        }
      }
    });
    
    cy.intercept('GET', '/products*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'Test Product',
          description: 'A test product',
          price: '19.99',
          category_id: 1,
          category_name: 'Clothing',
          shop_id: 1,
          shop_name: 'Test Shop',
          image_url: null,
          stock_quantity: 10,
          is_available: true
        }
      ]
    });
    
    cy.intercept('GET', '/products/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Test Product',
        description: 'A test product',
        price: '19.99',
        category_id: 1,
        category_name: 'Clothing',
        shop_id: 1,
        shop_name: 'Test Shop',
        image_url: null,
        stock_quantity: 10,
        is_available: true
      }
    });
    
    cy.intercept('GET', '/cart', {
      statusCode: 200,
      body: {
        items: [],
        total_items: 0,
        total_amount: '0.00'
      }
    });
  });

  it('should browse shops', () => {
    cy.visit('/shops');
    cy.get('h1').should('contain', 'Shops');
    cy.contains('Test Shop').should('exist');
  });

  it('should view shop details', () => {
    cy.visit('/shops/1');
    cy.get('h1').should('contain', 'Test Shop');
    cy.contains('A test shop').should('exist');
  });

  it('should browse products', () => {
    cy.visit('/products');
    cy.get('h1').should('contain', 'Products');
    cy.contains('Test Product').should('exist');
    cy.contains('$19.99').should('exist');
  });

  it('should view product details', () => {
    cy.visit('/products/1');
    cy.get('h1').should('contain', 'Test Product');
    cy.contains('A test product').should('exist');
    cy.contains('$19.99').should('exist');
    cy.contains('Add to Cart').should('exist');
  });

  it('should add product to cart', () => {
    // Intercept the add to cart API call
    cy.intercept('POST', '/cart/items', {
      statusCode: 201,
      body: {
        id: 1,
        product_id: 1,
        quantity: 1,
        product_name: 'Test Product',
        product_price: '19.99',
        total_price: '19.99'
      }
    }).as('addToCart');
    
    // Update cart response after adding item
    cy.intercept('GET', '/cart', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 1,
            product_id: 1,
            quantity: 1,
            product_name: 'Test Product',
            product_price: '19.99',
            total_price: '19.99',
            product_image: null,
            is_available: true,
            stock_quantity: 10
          }
        ],
        total_items: 1,
        total_amount: '19.99'
      }
    }).as('getCart');
    
    cy.visit('/products/1');
    
    // Add to cart
    cy.get('button').contains('Add to Cart').click();
    
    // Wait for the API call
    cy.wait('@addToCart');
    
    // Go to cart page
    cy.get('a[href="/cart"]').click();
    
    // Wait for the cart API call
    cy.wait('@getCart');
    
    // Check cart contents
    cy.contains('Test Product').should('exist');
    cy.contains('$19.99').should('exist');
    cy.contains('Total: $19.99').should('exist');
  });

  it('should update cart quantity', () => {
    // Setup initial cart state
    cy.intercept('GET', '/cart', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 1,
            product_id: 1,
            quantity: 1,
            product_name: 'Test Product',
            product_price: '19.99',
            total_price: '19.99',
            product_image: null,
            is_available: true,
            stock_quantity: 10
          }
        ],
        total_items: 1,
        total_amount: '19.99'
      }
    }).as('getCart');
    
    // Intercept the update cart API call
    cy.intercept('PUT', '/cart/items/1', {
      statusCode: 200,
      body: {
        id: 1,
        product_id: 1,
        quantity: 2,
        product_name: 'Test Product',
        product_price: '19.99',
        total_price: '39.98'
      }
    }).as('updateCart');
    
    // Update cart response after updating quantity
    cy.intercept('GET', '/cart', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 1,
            product_id: 1,
            quantity: 2,
            product_name: 'Test Product',
            product_price: '19.99',
            total_price: '39.98',
            product_image: null,
            is_available: true,
            stock_quantity: 10
          }
        ],
        total_items: 1,
        total_amount: '39.98'
      }
    }).as('getUpdatedCart');
    
    cy.visit('/cart');
    
    // Wait for the initial cart API call
    cy.wait('@getCart');
    
    // Update quantity
    cy.get('input[type="number"]').clear().type('2');
    cy.get('button').contains('Update').click();
    
    // Wait for the update API call
    cy.wait('@updateCart');
    
    // Check updated cart
    cy.contains('Total: $39.98').should('exist');
  });

  it('should place an order', () => {
    // Setup initial cart state
    cy.intercept('GET', '/cart', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 1,
            product_id: 1,
            quantity: 1,
            product_name: 'Test Product',
            product_price: '19.99',
            total_price: '19.99',
            product_image: null,
            is_available: true,
            stock_quantity: 10,
            shop_id: 1
          }
        ],
        total_items: 1,
        total_amount: '19.99'
      }
    }).as('getCart');
    
    // Intercept the create order API call
    cy.intercept('POST', '/orders', {
      statusCode: 201,
      body: {
        id: 1,
        customer_id: 1,
        shop_id: 1,
        total_amount: '19.99',
        status: 'pending',
        delivery_address: '123 Test St',
        notes: 'Test order',
        created_at: new Date().toISOString(),
        items: [
          {
            id: 1,
            product_id: 1,
            product_name: 'Test Product',
            quantity: 1,
            price: '19.99'
          }
        ]
      }
    }).as('createOrder');
    
    // Update cart to be empty after order
    cy.intercept('GET', '/cart', {
      statusCode: 200,
      body: {
        items: [],
        total_items: 0,
        total_amount: '0.00'
      }
    }).as('getEmptyCart');
    
    cy.visit('/cart');
    
    // Wait for the initial cart API call
    cy.wait('@getCart');
    
    // Place order
    cy.get('button').contains('Checkout').click();
    
    // Fill in delivery address
    cy.get('#delivery_address').type('123 Test St');
    cy.get('#notes').type('Test order');
    
    // Confirm order
    cy.get('button').contains('Place Order').click();
    
    // Wait for the create order API call
    cy.wait('@createOrder');
    
    // Should be redirected to orders page
    cy.url().should('include', '/orders');
    
    // Should show success message
    cy.contains('Order placed successfully').should('exist');
  });
});