-- Database Schema and Population Script for Order Placement App

-- ==========================================================
-- 1. Schema Definitions (DDL)
-- ==========================================================

-- Create Vendor Table
CREATE TABLE IF NOT EXISTS order_placement_vendor (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ratings DOUBLE PRECISION NOT NULL,
    eta INTEGER NOT NULL
);

-- Create Menu Table
CREATE TABLE IF NOT EXISTS order_placement_menu (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES order_placement_vendor(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL
);

-- ==========================================================
-- 2. Data Population (DML)
-- ==========================================================

-- Insert Vendors
INSERT INTO order_placement_vendor (name, ratings, eta) 
VALUES 
    ('Burger King', 4.5, 30),
    ('Pizza Hut', 4.2, 45),
    ('KFC', 4.0, 25);

-- Insert Menus
-- Assuming IDs 1, 2, 3 were assigned to the vendors inserted above respectively.
-- Vendor 1: Burger King
INSERT INTO order_placement_menu (vendor_id, name, price, description)
VALUES 
    (1, 'Whopper Meal', 9.99, 'Flame-grilled beef burger with fries and a drink'),
    (1, 'Chicken Royale', 8.99, 'Crispy chicken burger with lettuce and mayo');

-- Vendor 2: Pizza Hut
INSERT INTO order_placement_menu (vendor_id, name, price, description)
VALUES 
    (2, 'Pepperoni Feast', 12.50, 'Large pizza loaded with pepperoni and cheese'),
    (2, 'Vegetarian Supreme', 11.50, 'Vegetarian pizza with mushrooms, peppers, and onions');

-- Vendor 3: KFC
INSERT INTO order_placement_menu (vendor_id, name, price, description)
VALUES 
    (3, 'Zinger Box Meal', 10.99, 'Zinger burger, 2 hot wings, fries, and a drink'),
    (3, 'Popcorn Chicken', 5.99, 'Bite-sized pieces of crispy chicken');
