export interface CartItem {
  tourId: string;
  tourName: string;
  price: number;
}

export interface CartResponse {
  touristId: string;
  items: CartItem[];
  totalPrice: number;
}

export interface PurchaseToken {
  id: string;
  touristId: string;
  tourId: string;
  price: number;
  issuedAt: string;
}

export interface CheckoutResponse {
  tokens: PurchaseToken[];
}

export interface HasPurchasedResponse {
  purchased: boolean;
}

export interface MyPurchasesResponse {
  tokens: PurchaseToken[];
}

export interface PurchaseItem {
  touristId: string;
  tokens: PurchaseToken[];
}

export interface AllPurchasesResponse {
  purchases: PurchaseItem[];
}

export interface RefundResponse {
  success: boolean;
}
