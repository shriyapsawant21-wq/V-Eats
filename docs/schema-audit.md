# ER diagram and live Oracle schema audit

Executed 2026-10-29T14:29:53.030Z. Audited the live VEATS_APP schema, not only source files.

- RESTAURANT: all diagram attributes present
- FOOD_ITEM: all diagram attributes present
- CONTAINS: all diagram attributes present
- HAS_ALLERGEN: all diagram attributes present
- CATEGORY: all diagram attributes present
- CUISINE: all diagram attributes present
- DIETARY_TYPE: all diagram attributes present
- ALLERGEN: all diagram attributes present
- FOOD_ITEM.CATEGORY_ID → CATEGORY.CATEGORY_ID: enabled FK
- FOOD_ITEM.CUISINE_ID → CUISINE.CUISINE_ID: enabled FK
- FOOD_ITEM.DIETARY_TYPE_ID → DIETARY_TYPE.DIETARY_TYPE_ID: enabled FK
- CONTAINS.RESTAURANT_ID → RESTAURANT.RESTAURANT_ID: enabled FK
- CONTAINS.FOOD_ID → FOOD_ITEM.FOOD_ID: enabled FK
- HAS_ALLERGEN.FOOD_ID → FOOD_ITEM.FOOD_ID: enabled FK
- HAS_ALLERGEN.ALLERGEN_ID → ALLERGEN.ALLERGEN_ID: enabled FK
- RESTAURANT: expected primary key verified
- FOOD_ITEM: expected primary key verified
- CONTAINS: expected primary key verified
- HAS_ALLERGEN: expected primary key verified
- CATEGORY: expected primary key verified
- CUISINE: expected primary key verified
- DIETARY_TYPE: expected primary key verified
- ALLERGEN: expected primary key verified
- FOOD_ITEM has no redundant single ALLERGEN_ID; M:N uses HAS_ALLERGEN
- All food is a UI filter, not a stored category
- All restaurant MUST_HAVE values are valid string arrays

## Live row counts

- RESTAURANT: 5
- FOOD_ITEM: 12
- CONTAINS: 23
- HAS_ALLERGEN: 12
- CATEGORY: 4
- CUISINE: 4
- DIETARY_TYPE: 3
- ALLERGEN: 5

## Exact-match qualifications

- Core entities, attributes and 1:N / M:N relationships match the original ER diagram. Column casing/underscore naming is conventional Oracle naming. Dietary_Type_ID is used consistently for the handwritten Dietary_ID / Dietary_type_ID variation.
- CONTAINS includes RESTAURANT_ID as required by the ER M:N relationship, although the handwritten table list omitted it.
- FOOD_ITEM omits the handwritten single ALLERGEN_ID because the ER diagram defines multiple allergens through HAS_ALLERGEN.
- Composite location is flattened into BLOCK and LANDMARK. Multivalued MUST_HAVE is a JSON string array on RESTAURANT. This is a deliberate storage choice, not a separate normalized Restaurant_Must_Have relation; the supplied relational list also keeps Must_have on Restaurant.
- IMAGE, DESCRIPTION, SOURCE_URL, SOURCE_NOTE, PRICE_NOTE and CREATED_AT are supporting application fields outside the original diagram. MENU_CATALOG is an extra view, not an extra entity.
- NOT NULL classification FKs require each food to have one category, cuisine and dietary type. Parent-side minimum participation (requiring every restaurant/lookup/allergen to already have child rows) is not enforced; this allows parents to be created before menu/link rows. If double lines in the drawing were intended as mandatory total participation, this is a remaining difference.
- MUST_HAVE strings are not foreign-key references to FOOD_ITEM.

These qualifications are documented rather than claiming a byte-for-byte identical schema. No schema changes were necessary during this audit.
