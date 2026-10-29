-- Run as VEATS_APP in FREEPDB1. The local Oracle Free instance supplies the CDB/PDB.
CREATE TABLE category (category_id VARCHAR2(40) PRIMARY KEY, category_name VARCHAR2(80) NOT NULL UNIQUE);
CREATE TABLE cuisine (cuisine_id VARCHAR2(40) PRIMARY KEY, cuisine_name VARCHAR2(80) NOT NULL UNIQUE);
CREATE TABLE dietary_type (dietary_type_id VARCHAR2(40) PRIMARY KEY, type_name VARCHAR2(80) NOT NULL UNIQUE);
CREATE TABLE allergen (allergen_id VARCHAR2(40) PRIMARY KEY, allergen_name VARCHAR2(80) NOT NULL UNIQUE);
CREATE TABLE restaurant (
 restaurant_id VARCHAR2(40) PRIMARY KEY, restaurant_name VARCHAR2(120) NOT NULL UNIQUE,
 block VARCHAR2(80) NOT NULL, landmark VARCHAR2(180) NOT NULL,
 must_have VARCHAR2(1000) DEFAULT '[]' NOT NULL CHECK (must_have IS JSON),
 image VARCHAR2(180), source_url VARCHAR2(500), source_note VARCHAR2(500),
 created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE food_item (
 food_id VARCHAR2(40) PRIMARY KEY, food_name VARCHAR2(120) NOT NULL,
 category_id VARCHAR2(40) NOT NULL REFERENCES category(category_id),
 cuisine_id VARCHAR2(40) NOT NULL REFERENCES cuisine(cuisine_id),
 dietary_type_id VARCHAR2(40) NOT NULL REFERENCES dietary_type(dietary_type_id),
 description VARCHAR2(1000), image VARCHAR2(180),
 created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE contains (
 restaurant_id VARCHAR2(40) REFERENCES restaurant(restaurant_id),
 food_id VARCHAR2(40) REFERENCES food_item(food_id),
 price NUMBER(8,2) NOT NULL CHECK (price > 0 AND price <= 100000),
 price_note VARCHAR2(250) DEFAULT 'Sample price; verify with outlet' NOT NULL,
 CONSTRAINT contains_pk PRIMARY KEY (restaurant_id, food_id)
);
CREATE TABLE has_allergen (
 food_id VARCHAR2(40) REFERENCES food_item(food_id),
 allergen_id VARCHAR2(40) REFERENCES allergen(allergen_id),
 CONSTRAINT has_allergen_pk PRIMARY KEY (food_id, allergen_id)
);
CREATE INDEX food_category_idx ON food_item(category_id);
CREATE INDEX food_cuisine_idx ON food_item(cuisine_id);
CREATE INDEX food_diet_idx ON food_item(dietary_type_id);
CREATE INDEX contains_food_idx ON contains(food_id);
CREATE INDEX has_allergen_allergen_idx ON has_allergen(allergen_id);
CREATE VIEW menu_catalog AS
SELECT r.restaurant_id, r.restaurant_name, r.block, f.food_id, f.food_name,
 c.category_name, cu.cuisine_name, d.type_name, m.price, m.price_note
FROM contains m JOIN restaurant r ON r.restaurant_id=m.restaurant_id
JOIN food_item f ON f.food_id=m.food_id JOIN category c ON c.category_id=f.category_id
JOIN cuisine cu ON cu.cuisine_id=f.cuisine_id JOIN dietary_type d ON d.dietary_type_id=f.dietary_type_id;
