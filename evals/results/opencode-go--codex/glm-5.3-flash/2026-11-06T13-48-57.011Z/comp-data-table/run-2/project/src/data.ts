export type Employee = {
  id: string;
  name: string;
  role: string;
  team: string;
  projects: number;
  salary: number;
  employedAt: string;
};

export const employees: Employee[] = [
  { id: "employee-01", name: "Ava Mitchell", role: "Product Designer", team: "Growth", projects: 12, salary: 72000, employedAt: "2021-04-12" },
  { id: "employee-02", name: "Liam Novak", role: "Frontend Engineer", team: "Platform", projects: 8, salary: 88000, employedAt: "2019-09-02" },
  { id: "employee-03", name: "Sofia Rossi", role: "Backend Engineer", team: "Payments", projects: 15, salary: 94000, employedAt: "2020-01-27" },
  { id: "employee-04", name: "Noah Becker", role: "Data Analyst", team: "Insights", projects: 6, salary: 67000, employedAt: "2022-06-18" },
  { id: "employee-05", name: "Emma Laurent", role: "Engineering Manager", team: "Platform", projects: 21, salary: 128000, employedAt: "2018-03-05" },
  { id: "employee-06", name: "Oliver Kim", role: "QA Engineer", team: "Payments", projects: 10, salary: 64000, employedAt: "2021-11-08" },
  { id: "employee-07", name: "Mia Petrova", role: "UX Researcher", team: "Growth", projects: 5, salary: 71000, employedAt: "2023-02-14" },
  { id: "employee-08", name: "Ethan Dubois", role: "DevOps Engineer", team: "Infrastructure", projects: 18, salary: 102000, employedAt: "2020-07-21" },
  { id: "employee-09", name: "Zoe Anderson", role: "Mobile Engineer", team: "Platform", projects: 9, salary: 86000, employedAt: "2022-01-30" },
  { id: "employee-10", name: "Lucas Moreau", role: "Technical Writer", team: "Docs", projects: 4, salary: 58000, employedAt: "2023-05-09" },
  { id: "employee-11", name: "Isabella Silva", role: "Product Manager", team: "Growth", projects: 14, salary: 115000, employedAt: "2021-08-16" },
  { id: "employee-12", name: "Henry Walsh", role: "Security Engineer", team: "Infrastructure", projects: 11, salary: 109000, employedAt: "2019-12-01" },
  { id: "employee-13", name: "Amara Okafor", role: "Frontend Engineer", team: "Growth", projects: 13, salary: 91000, employedAt: "2020-10-19" },
  { id: "employee-14", name: "Daniel Iversen", role: "Backend Engineer", team: "Platform", projects: 16, salary: 97000, employedAt: "2022-04-04" },
  { id: "employee-15", name: "Nina Kovac", role: "Data Scientist", team: "Insights", projects: 7, salary: 104000, employedAt: "2023-03-27" },
  { id: "employee-16", name: "Arthur Nguyen", role: "QA Engineer", team: "Docs", projects: 8, salary: 61000, employedAt: "2021-02-23" },
  { id: "employee-17", name: "Chloe Martin", role: "Product Designer", team: "Payments", projects: 9, salary: 76000, employedAt: "2020-05-11" },
  { id: "employee-18", name: "Samuel Adeyemi", role: "Mobile Engineer", team: "Growth", projects: 10, salary: 89000, employedAt: "2022-09-06" },
  { id: "employee-19", name: "Freya Lindqvist", role: "Support Engineer", team: "Infrastructure", projects: 12, salary: 69000, employedAt: "2021-06-15" },
  { id: "employee-20", name: "Jack Thompson", role: "Solution Architect", team: "Platform", projects: 23, salary: 137000, employedAt: "2018-10-22" },
  { id: "employee-21", name: "Lily Chen", role: "Product Designer", team: "Insights", projects: 6, salary: 74000, employedAt: "2023-07-12" },
  { id: "employee-22", name: "Oscar Berg", role: "Backend Engineer", team: "Payments", projects: 17, salary: 99000, employedAt: "2020-03-08" },
  { id: "employee-23", name: "Aria Sanchez", role: "Data Analyst", team: "Growth", projects: 5, salary: 65000, employedAt: "2022-12-05" },
  { id: "employee-24", name: "Leo Fontaine", role: "Frontend Engineer", team: "Docs", projects: 7, salary: 83000, employedAt: "2021-10-30" },
  { id: "employee-25", name: "Maya Robinson", role: "Engineering Manager", team: "Payments", projects: 19, salary: 126000, employedAt: "2019-05-20" },
  { id: "employee-26", name: "Felix Wagner", role: "DevOps Engineer", team: "Platform", projects: 14, salary: 96000, employedAt: "2022-02-17" },
  { id: "employee-27", name: "Hannah Brown", role: "UX Researcher", team: "Payments", projects: 4, salary: 69000, employedAt: "2023-09-25" },
  { id: "employee-28", name: "Aaron Foster", role: "Security Engineer", team: "Infrastructure", projects: 13, salary: 112000, employedAt: "2021-01-11" },
  { id: "employee-29", name: "Ella Parker", role: "Product Manager", team: "Insights", projects: 12, salary: 118000, employedAt: "2020-11-24" },
  { id: "employee-30", name: "Tomasz Nowak", role: "Support Engineer", team: "Docs", projects: 9, salary: 63000, employedAt: "2022-08-02" },
  { id: "employee-31", name: "Clara Fischer", role: "Technical Writer", team: "Platform", projects: 3, salary: 56000, employedAt: "2023-11-14" },
  { id: "employee-32", name: "Omar Ali", role: "Data Scientist", team: "Payments", projects: 8, salary: 106000, employedAt: "2021-05-07" },
  { id: "employee-33", name: "Julia Ricci", role: "QA Engineer", team: "Insights", projects: 11, salary: 66000, employedAt: "2020-09-13" },
  { id: "employee-34", name: "Owen Carter", role: "Solution Architect", team: "Growth", projects: 20, salary: 131000, employedAt: "2019-02-26" },
  { id: "employee-35", name: "Iris van Dijk", role: "Product Designer", team: "Platform", projects: 10, salary: 78000, employedAt: "2021-12-20" },
  { id: "employee-36", name: "Miles Turner", role: "Backend Engineer", team: "Infrastructure", projects: 15, salary: 93000, employedAt: "2022-05-29" },
  { id: "employee-37", name: "Ruby Foster", role: "Data Analyst", team: "Payments", projects: 6, salary: 68000, employedAt: "2023-04-18" },
  { id: "employee-38", name: "Victor Sokolov", role: "Mobile Engineer", team: "Insights", projects: 8, salary: 84000, employedAt: "2020-06-09" },
  { id: "employee-39", name: "Alice Dubois", role: "Engineering Manager", team: "Infrastructure", projects: 22, salary: 132000, employedAt: "2018-08-14" },
  { id: "employee-40", name: "Peter Hall", role: "Frontend Engineer", team: "Payments", projects: 9, salary: 85000, employedAt: "2021-09-03" },
];
