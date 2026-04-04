export type ProjectType = "iot" | "saas";
export type FlowStage = 1 | 2 | 3;

export interface SchemaTableRow {
  [key: string]: string;
}

export interface SchemaOutput {
  projectType: ProjectType;
  mermaidCode: string;
  tableData: SchemaTableRow[];
}

export interface HardwareBomItem {
  name: string;
  role: string;
  warning?: string;
  searchQuery: string;
}

export interface SaasBomItem {
  name: string;
  role: string;
  freeTier: string;
  category: string;
  affiliateUrl?: string;
}

export interface BomOutput {
  bomType: "hardware" | "saas";
  items: Array<HardwareBomItem | SaasBomItem>;
}
