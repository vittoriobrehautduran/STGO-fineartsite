-- Seed script for initial data
-- Run this in Supabase SQL Editor after running the main schema

-- Insert framing options (reusable across all products)
INSERT INTO framing_options (name, description, price)
VALUES
  ('Marco Negro Clásico', 'Elegante marco de madera negra con vidrio', 150),
  ('Marco de Madera Natural', 'Marco de madera natural cálido con paspartú', 180),
  ('Marco Metálico Moderno', 'Marco metálico plateado elegante', 200),
  ('Sin Marco', 'Solo impresión, sin enmarcado', 0)
ON CONFLICT DO NOTHING;

-- Framing options are now ready to be linked to products
-- Products should be added through the admin panel

