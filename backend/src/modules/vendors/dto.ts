export interface CreateVendorDto {
  name: string;
  email?: string;
  phone?: string;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

export interface VendorResponseDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface VendorListResponseDto {
  vendors: VendorResponseDto[];
  total: number;
}
