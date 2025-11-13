export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes: ProductSize[];
  framingOptions: FramingOption[];
}

export interface ProductSize {
  id: string;
  width: number;
  height: number;
  unit: "inches" | "cm";
  price: number;
}

export interface FramingOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

