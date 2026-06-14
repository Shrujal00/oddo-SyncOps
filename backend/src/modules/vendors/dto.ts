export interface CreateVendorDto {
  name: string;
  email?: string;
  phone?: string;
  productIds?: string[];
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

export interface VendorProductDto {
  id: string;
  name: string;
  sku: string;
}

export interface VendorResponseDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  products: VendorProductDto[];
}

export interface VendorListResponseDto {
  vendors: VendorResponseDto[];
  total: number;
  page: number;
  limit: number;
}
