export type Order ={
    order_id:string
    timestamp: string,
    vendor: string,
    location: string,
    total_amount: number,
    delivery_fee: number,
    customer_phone?: string,
    customer_name: string,
    special_instructions: string,
    items: Array<{ name: string; quantity: number; price: number }>,
    status: string,
    image_url?: string,
    assigned_drone: string | null
}

export type UserOrders = {

    current_orders: Order[],
    past_orders: Order[]
    
}