type Address = {
  country: string;
  streetName: string;
  postalCode?: string;
  locality: string;
  houseNumber?: string;
};

type Period = {
  monthlySalary?: string;
  start: string;
  end: string;
  hourlyRate?: string;
  timeBudget?: string;
};

type CostsByMonth = {
  _applicationId: string;
  periods?: Period[];
  costsByMonth?: { costs: string; month: string }[];
  _updatedDate: string;
  _definitionId: string;
  _createdDate: string;
};

type StatusAggregation = {
  monthlySalary?: string | null;
  _updatedDate: string;
  yearlyVacationDays?: string | null;
  _createdDate: string;
  jobTitle?: string | null;
  _applicationId: string;
  weeklyWorkingHours?: string | null;
  jobType?: string | null;
  _definitionId: string;
  status: string;
};

type QuarterEarnings = {
  earnings: string;
  start: string;
  name: string;
  end: string;
};

type LastThreeMonthsIndividually = {
  month: string;
  utilisationRate: string;
};

type WorkforceUtilisation = {
  _updatedDate: string;
  totalCostPerCustomer?: string;
  _createdDate: string;
  utilisationRateOngoingQuarter?: string;
  monthlyCostDifference?: string;
  utilisationRateLastTwelveMonths?: string;
  timeWorkedPreviousQuarter?: string;
  utilisationRateOverall?: string;
  utilisationRateYearToDate?: string;
  utilisationRatePreviousQuarter?: string;
  _definitionId: string;
  lastThreeMonthsIndividually?: LastThreeMonthsIndividually[];
  quarterEarnings?: QuarterEarnings[];
};

type Employee = {
  birthday?: string;
  firstname: string;
  _mrn: string;
  _createdDate: string;
  jobTitle?: string;
  hourlyRateForProjects?: string;
  costsByMonth?: CostsByMonth;
  _createdBy?: string;
  usedVacationDays?: string;
  potentialEarnings?: string;
  _archived?: string;
  statusAggregation?: StatusAggregation;
  jobType?: string;
  address?: Address;
  hoursPerWeek?: string;
  _updatedDate: string;
  team?: string;
  targetWorkingHours?: string;
  lastname?: string;
  holidayPerYear?: string;
  workforceUtilisation?: WorkforceUtilisation;
  name: string;
  earnedVacationDays?: string;
  _id: string;
  individualTicketDuration?: string;
  searchValue?: string;
  status: string;
  salutation?: string;
  email?: string;
  employmentStatus?: EmploymentStatus;
};

type ExternalEmployee = Employee & {
  salutation?: string;
  email?: string;
};

type EmploymentStatus = {
  _applicationId: string;
  employmentStatus: string;
  _updatedDate: string;
  _definitionId: string;
  _createdDate: string;
};

type Team = {
  _updatedDate: string;
  _mrn: string;
  _createdDate: string;
  name: string;
  _archived?: string;
  _id: string;
  _createdBy?: string;
};

// Type for source-data.json
export type SourceDataType = {
  employees?: Employee;
  externals?: ExternalEmployee;
  teams?: Team[];
};

// Type for Table Column and Row Data
export type TableDataType = {
  person: string;
  past12Months: string;
// Allow dynamic access for month names (e.g., row["August"])
  [key: string]: string;
  netEarningsPrevMonth: string;
};
