export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface CustomerResponseDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface CustomerListResponseDto {
  customers: CustomerResponseDto[];
  total: number;
}
