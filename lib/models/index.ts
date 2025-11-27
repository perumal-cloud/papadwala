// Export all models for easy importing
export { default as User, type IUser } from './User';
export { default as OTP, type IOTP } from './OTP';
export { default as Category, type ICategory } from './Category';
export { default as Product, type IProduct } from './Product';
export { default as Cart, type ICart, type ICartItem } from './Cart';
export { default as Order, type IOrder, type IOrderItem, type IShippingAddress } from './Order';
export { default as ShippingZone, type IShippingZone, type IShippingMethod } from './Shipping';
export { default as Newsletter, type INewsletter } from './Newsletter';