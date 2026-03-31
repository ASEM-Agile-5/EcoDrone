import { WAYPOINTS } from './constants';

export const initialOrders = [
  {
    id: 'ORD-001',
    vendor: 'Big Ben Cafeteria',
    buyer: 'Norton Hostel - Room 42',
    item: '2x Jollof Rice',
    status: 'pending',
    wpVendor: WAYPOINTS.VENDOR_1,
    wpBuyer: WAYPOINTS.BUYER_1,
  },
  {
    id: 'ORD-002',
    vendor: 'Akonnor',
    buyer: 'Engineering Block',
    item: '1x Iced Kenkey',
    status: 'queued',
    wpVendor: { lat: 5.7601, lon: -0.2185 },
    wpBuyer: { lat: 5.7592, lon: -0.219 },
  },
  {
    id: 'ORD-003',
    vendor: 'Big Ben Cafeteria',
    buyer: 'Berekuso Village',
    item: 'Assorted Drinks',
    status: 'queued',
    wpVendor: WAYPOINTS.VENDOR_1,
    wpBuyer: { lat: 5.762, lon: -0.222 },
  },
];
