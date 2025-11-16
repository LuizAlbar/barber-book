import axios from 'axios';

interface Barbershop {
  id: string;
  name: string;
  fullAddress: string;
  neighborhood: string;
  referencePoint?: string;
  services: Service[];
  employees: Employee[];
  barberSchedules: BarberSchedule[];
}

interface Service {
  id: string;
  name: string;
  price: number;
  timeTaken: number;
}

interface Employee {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
  };
}

interface BarberSchedule {
  id: string;
  daysOfWeek: string;
  openTime: string;
  closeTime: string;
  breakingTimes: BreakingTime[];
}

interface BreakingTime {
  id: string;
  startingTime: string;
  endingTime: string;
}

interface CreateAppointmentRequest {
  clientName: string;
  clientContact: string;
  employeeId: string;
  serviceId: string;
  datetime: string;
}

const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Função para configurar token de autenticação
const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const barbershopService = {
  getById: async (id: string): Promise<Barbershop> => {
    const response = await api.get(`/barbershops/public/${id}`);
    return response.data.barbershop;
  },
  setAuthToken
};

export const availabilityService = {
  getAvailableSlots: async (
    barbershopId: string,
    employeeId: string,
    serviceId: string,
    date: string
  ): Promise<string[]> => {
    const response = await api.get(`/availability/${barbershopId}/slots`, {
      params: { employeeId, serviceId, date }
    });
    return response.data.availableSlots;
  }
};

export const appointmentService = {
  create: async (appointment: CreateAppointmentRequest) => {
    const response = await api.post('/appointments', appointment);
    return response.data;
  }
};