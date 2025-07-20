describe('Shop Owner Flow', () => {
  beforeEach(() => {
    // Setup a logged-in state for a shop owner
    localStorage.setItem('auth_token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      id: 2,
      email: 'owner@example.com',
      username: 'shopowner',
      role: 'shop_owner'
    }));
    
    // Mock API responses
    cy.intercept('GET', '/shops*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'My Test Shop',
          description: 'My shop description',
          category_id: 1,
          category_name: 'Clothing',
          address: '123 Shop St',
          image_url: null,
          owner_id: 2
        }
      ]
    });
    
    cy.intercept('GET', '/shops/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'My Test Shop',
        description: 'My shop description',
        category_id: 1,
        category_name: 'Clothing',
        address: '123 Shop St',
        image_url: null,
        owner_id: 2,
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
          name: 'Shop Product',
          description: 'A product in my shop',
          price: '29.99',
          category_id: 1,
          category_name: 'Clothing',
          shop_id: 1,
          shop_name: 'My Test Shop',
          image_url: null,
          stock_quantity: 20,
          is_available: true
        }
      ]
    });
    
    cy.intercept('GET', '/categories', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Clothing' },
        { id: 2, name: 'Electronics' },
        { id: 3, name: 'Food' }
      ]
    });
    
    cy.intercept('GET', '/orders*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          customer_id: 1,
          customer_name: 'Test Customer',
          shop_id: 1,
          total_amount: '29.99',
          status: 'pending',
          delivery_address: '123 Customer St',
          created_at: new Date().toISOString(),
          items: [
            {
              product_id: 1,
              product_name: 'Shop Product',
              quantity: 1,
              price: '29.99'
            }
          ]
        }
      ]
    });
  });

  it('should view shop dashboard', () => {
    cy.visit('/my-shop');
    cy.get('h1').should('contain', 'My Test Shop');
    cy.contains('Shop Management').should('exist');
    cy.contains('Product Management').should('exist');
  });

  it('should manage products', () => {
    // Intercept the create product API call
    cy.intercept('POST', '/products', {
      statusCode: 201,
      body: {
        id: 2,
        name: 'New Product',
        description: 'A new product',
        price: '39.99',
        category_id: 1,
        shop_id: 1,
        stock_quantity: 15,
        is_available: true
      }
    }).as('createProduct');
    
    cy.visit('/product-management');
    
    // Click add product button
    cy.get('button').contains('Add Product').click();
    
    // Fill in product form
    cy.get('#name').type('New Product');
    cy.get('#description').type('A new product');
    cy.get('#price').type('39.99');
    cy.get('#category_id').select('Clothing');
    cy.get('#stock_quantity').type('15');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call
    cy.wait('@createProduct');
    
    // Should show success message
    cy.contains('Product created successfully').should('exist');
  });

  it('should update product', () => {
    // Intercept the update product API call
    cy.intercept('PUT', '/products/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Updated Product',
        description: 'Updated description',
        price: '49.99',
        category_id: 1,
        shop_id: 1,
        stock_quantity: 25,
        is_available: true
      }
    }).as('updateProduct');
    
    cy.visit('/product-management');
    
    // Click edit button for product
    cy.get('button').contains('Edit').click();
    
    // Update product form
    cy.get('#name').clear().type('Updated Product');
    cy.get('#description').clear().type('Updated description');
    cy.get('#price').clear().type('49.99');
    cy.get('#stock_quantity').clear().type('25');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call
    cy.wait('@updateProduct');
    
    // Should show success message
    cy.contains('Product updated successfully').should('exist');
  });

  it('should manage orders', () => {
    // Intercept the update order API call
    cy.intercept('PUT', '/orders/1', {
      statusCode: 200,
      body: {
        id: 1,
        status: 'confirmed',
        customer_id: 1,
        customer_name: 'Test Customer',
        shop_id: 1,
        total_amount: '29.99',
        delivery_address: '123 Customer St',
        created_at: new Date().toISOString(),
        items: [
          {
            product_id: 1,
            product_name: 'Shop Product',
            quantity: 1,
            price: '29.99'
          }
        ]
      }
    }).as('updateOrder');
    
    cy.visit('/orders');
    
    // Check order is displayed
    cy.contains('Order #1').should('exist');
    cy.contains('Status: pending').should('exist');
    
    // Click on order to view details
    cy.contains('Order #1').click();
    
    // Update order status
    cy.get('select').select('confirmed');
    cy.get('button').contains('Update Status').click();
    
    // Wait for the API call
    cy.wait('@updateOrder');
    
    // Should show updated status
    cy.contains('Status: confirmed').should('exist');
  });

  it('should update shop details', () => {
    // Intercept the update shop API call
    cy.intercept('PUT', '/shops/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Updated Shop Name',
        description: 'Updated shop description',
        category_id: 2,
        category_name: 'Electronics',
        address: '456 New Shop St',
        image_url: null,
        owner_id: 2
      }
    }).as('updateShop');
    
    cy.visit('/shop-management');
    
    // Update shop form
    cy.get('#name').clear().type('Updated Shop Name');
    cy.get('#description').clear().type('Updated shop description');
    cy.get('#category_id').select('Electronics');
    cy.get('#address').clear().type('456 New Shop St');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call
    cy.wait('@updateShop');
    
    // Should show success message
    cy.contains('Shop updated successfully').should('exist');
  });
});