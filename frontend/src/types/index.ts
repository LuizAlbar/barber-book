export interface Barbershop {
  id: string;
  name: string;
  fullAddress: string;
  neighborhood: string;
  referencePoint?: string;
  services: Service[];
  employees: Employee[];
  barberSchedules: BarberSchedule[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  timeTaken: number;
}

export interface Employee {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
  };
}

export interface BarberSchedule {
  id: string;
  daysOfWeek: string;
  openTime: string;
  closeTime: string;
  breakingTimes: BreakingTime[];
}

export interface BreakingTime {
  id: string;
  startingTime: string;
  endingTime: string;
}

export interface CreateAppointmentRequest {
  clientName: string;
  clientContact: string;
  employeeId: string;
  serviceId: string;
  datetime: string;
}