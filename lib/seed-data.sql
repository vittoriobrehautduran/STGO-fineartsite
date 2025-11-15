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

-- Get framing option IDs for linking
DO $$
DECLARE
  frame_classic_id UUID;
  frame_wood_id UUID;
  frame_metal_id UUID;
  frame_none_id UUID;
  product_id UUID;
BEGIN
  -- Get framing option IDs
  SELECT id INTO frame_classic_id FROM framing_options WHERE name = 'Marco Negro Clásico';
  SELECT id INTO frame_wood_id FROM framing_options WHERE name = 'Marco de Madera Natural';
  SELECT id INTO frame_metal_id FROM framing_options WHERE name = 'Marco Metálico Moderno';
  SELECT id INTO frame_none_id FROM framing_options WHERE name = 'Sin Marco';

  -- Insert a sample product
  INSERT INTO products (name, description, base_price, image_url, featured)
  VALUES (
    'Serenidad Costera',
    'Una vista impresionante de un paisaje costero sereno durante la hora dorada, capturando la luz cálida y la atmósfera pacífica de la playa.',
    299,
    '/images/collection/pexels-cao-vi-ton-449370203-15551600.jpg',
    true
  )
  RETURNING id INTO product_id;

  -- Add sizes for the product (in cm)
  INSERT INTO product_sizes (product_id, width, height, unit, price)
  VALUES
    (product_id, 30, 40, 'cm', 299),
    (product_id, 40, 60, 'cm', 399),
    (product_id, 60, 90, 'cm', 599),
    (product_id, 75, 100, 'cm', 799);

  -- Link all framing options to the product
  INSERT INTO product_framing_options (product_id, framing_option_id)
  VALUES
    (product_id, frame_classic_id),
    (product_id, frame_wood_id),
    (product_id, frame_metal_id),
    (product_id, frame_none_id);
END $$;

