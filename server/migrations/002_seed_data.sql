INSERT INTO cafes (name, address, city) VALUES
  ('Greater Goods', '2501 E 6th St', 'Austin'),
  ('Houndstooth Coffee', '4200 N Lamar Blvd', 'Austin'),
  ('Stouthaus Coffee', '123 Main St', 'College Station');

INSERT INTO drinks (cafe_id, drink_type, rating, notes, logged_at) VALUES
  (1, 'Cortado', 4.5, 'Smooth and balanced', '2024-12-15 10:30:00'),
  (1, 'Espresso', 5.0, 'Incredible fruity notes', '2024-12-16 09:15:00'),
  (2, 'Latte', 4.0, 'Good milk texture', '2024-12-17 14:20:00');
