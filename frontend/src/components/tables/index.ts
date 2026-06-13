export interface TableColumn<TRecord> {
  key: keyof TRecord | string;
  label: string;
}
