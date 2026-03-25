export type Order ={
    order_id:string
    "timestamp": string,
    "vendor": string,
    location: string,
    totalAmount: number,
    deliveryFee: number,
    customerPhone: string,
    customerName: string,
    specialInstructions: string,
    items: Array<{ name: string; quantity: number; price: number }>;
    "status": string,
    "drone": string | null
}