// Cart utility functions for managing cart state across the app

export const CartEvents = {
  // Dispatch cart update event
  dispatchCartUpdate: (cartData: { totalItems: number; uniqueItems: number; totalAmount: number }) => {
    // Only dispatch with cart data to avoid dual updates
    window.dispatchEvent(new CustomEvent('cartDataUpdated', {
      detail: cartData
    }));
  },

  // Dispatch cart item added event
  dispatchItemAdded: (productId: string, quantity: number, cartData: { totalItems: number; uniqueItems: number; totalAmount: number }) => {
    window.dispatchEvent(new CustomEvent('cartItemAdded', {
      detail: { productId, quantity }
    }));
    
    // Also trigger general cart update
    CartEvents.dispatchCartUpdate(cartData);
  },

  // Dispatch cart item removed event
  dispatchItemRemoved: (productId: string, cartData: { totalItems: number; uniqueItems: number; totalAmount: number }) => {
    window.dispatchEvent(new CustomEvent('cartItemRemoved', {
      detail: { productId }
    }));
    
    // Also trigger general cart update
    CartEvents.dispatchCartUpdate(cartData);
  },

  // Dispatch cart quantity updated event
  dispatchQuantityUpdated: (productId: string, newQuantity: number, cartData: { totalItems: number; uniqueItems: number; totalAmount: number }) => {
    window.dispatchEvent(new CustomEvent('cartQuantityUpdated', {
      detail: { productId, newQuantity }
    }));
    
    // Also trigger general cart update
    CartEvents.dispatchCartUpdate(cartData);
  },

  // Dispatch cart cleared event
  dispatchCartCleared: () => {
    window.dispatchEvent(new Event('cartCleared'));
    
    // Also trigger general cart update with empty cart
    CartEvents.dispatchCartUpdate({ totalItems: 0, uniqueItems: 0, totalAmount: 0 });
  }
};

// Export individual functions for convenience
export const { 
  dispatchCartUpdate,
  dispatchItemAdded,
  dispatchItemRemoved,
  dispatchQuantityUpdated,
  dispatchCartCleared
} = CartEvents;

export default CartEvents;