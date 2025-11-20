export interface Template {
  id: string;
  name: string;
  cards: Array<{
    id: string;
    sourceCategory: string;
  }>;
  createdAt: string;
}
