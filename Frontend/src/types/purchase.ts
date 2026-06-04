export interface CartItem {
  tour_id: string;
  tour_name: string;
  price: number;
}

export interface CartResponse {
  tourist_id: string;
  items: CartItem[];
  total_price: number;
}

export interface PurchaseToken {
  id: string;
  tourist_id: string;
  tour_id: string;
  price: number;
  issued_at: string;
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
  tourist_id: string;
  tokens: PurchaseToken[];
}

export interface AllPurchasesResponse {
  purchases: PurchaseItem[];
}

export interface RefundResponse {
  success: boolean;
}
