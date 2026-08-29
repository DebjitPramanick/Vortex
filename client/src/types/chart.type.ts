export type ApplicationCountByLocation = {
  location: string;
  count: number;
};

export type ApplicationCountByStatus = {
  status: string;
  statusLabel: string;
  count: number;
  fill: string;
};

export type ApplicationCountByDay = {
  date: string;
  label: string;
  count: number;
};
