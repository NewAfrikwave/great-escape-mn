export interface Lake {
  id: string;
  name: string;
  region: string;
  description: string;
}

export const lakes: Lake[] = [
  {
    id: "prior-lake",
    name: "Prior Lake",
    region: "Scott County",
    description: "A beautiful lake in the south metro, perfect for sunset cruises and family outings.",
  },
  {
    id: "marion-lake",
    name: "Marion Lake",
    region: "Dakota County",
    description: "A scenic lake offering peaceful waters and great views for pontoon experiences.",
  },
  {
    id: "lakeville",
    name: "Lakeville",
    region: "Dakota County",
    description: "Conveniently located lakes in the south metro for easy access to water fun.",
  },
  {
    id: "minnetonka-lake",
    name: "Lake Minnetonka",
    region: "Hennepin / Carver County",
    description: "Minnesota's most iconic lake, known for its size, beauty, and vibrant waterfront lifestyle.",
  },
];

export const serviceAreaSummary =
  "Minnesota lakes including Prior Lake, Marion Lake, Lakeville, Lake Minnetonka, and nearby areas by request.";
