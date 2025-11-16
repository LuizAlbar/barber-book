import { useState, useEffect } from 'react';
import { availabilityService, appointmentService } from '../services/api';

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

interface BookingFormProps {
  barbershop: Barbershop;
}

export function BookingForm({ barbershop }: BookingFormProps) {
  const [form, setForm] = useState<CreateAppointmentRequest>({
    clientName: '',
    clientContact: '',
    employeeId: '',
    serviceId: '',
    datetime: ''
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedService = barbershop.services.find(s => s.id === form.serviceId);
  const selectedEmployee = barbershop.employees.find(e => e.id === form.employeeId);

  useEffect(() => {
    if (form.employeeId && form.serviceId && selectedDate) {
      loadAvailableSlots();
    }
  }, [form.employeeId, form.serviceId, selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      const slots = await availabilityService.getAvailableSlots(
        barbershop.id,
        form.employeeId,
        form.serviceId,
        selectedDate
      );
      setAvailableSlots(slots);
      setSelectedSlot('');
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    try {
      const datetime = new Date(`${selectedDate}T${selectedSlot}:00`).toISOString();
      await appointmentService.create({
        ...form,
        datetime
      });
      setSuccess(true);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (success) {
    return (
      <div className="success-message">
        <h2>✅ Agendamento Confirmado!</h2>
        <p>Seu agendamento foi criado com sucesso.</p>
        <div className="appointment-details">
          <p><strong>Cliente:</strong> {form.clientName}</p>
          <p><strong>Contato:</strong> {form.clientContact}</p>
          <p><strong>Barbeiro:</strong> {selectedEmployee?.user.name}</p>
          <p><strong>Serviço:</strong> {selectedService?.name}</p>
          <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
          <p><strong>Horário:</strong> {selectedSlot}</p>
          <p><strong>Preço:</strong> R$ {selectedService?.price.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h2>Agendar Horário</h2>
      
      <div className="form-group">
        <label>Nome Completo:</label>
        <input
          type="text"
          value={form.clientName}
          onChange={(e) => setForm({...form, clientName: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Telefone:</label>
        <input
          type="tel"
          value={form.clientContact}
          onChange={(e) => setForm({...form, clientContact: e.target.value})}
          placeholder="(11) 99999-9999"
          required
        />
      </div>

      <div className="form-group">
        <label>Barbeiro:</label>
        <select
          value={form.employeeId}
          onChange={(e) => setForm({...form, employeeId: e.target.value})}
          required
        >
          <option value="">Selecione um barbeiro</option>
          {barbershop.employees.map(employee => (
            <option key={employee.id} value={employee.id}>
              {employee.user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Serviço:</label>
        <select
          value={form.serviceId}
          onChange={(e) => setForm({...form, serviceId: e.target.value})}
          required
        >
          <option value="">Selecione um serviço</option>
          {barbershop.services.map(service => (
            <option key={service.id} value={service.id}>
              {service.name} - R$ {service.price.toFixed(2)} ({service.timeTaken}min)
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Data:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={getTomorrowDate()}
          required
        />
      </div>

      {availableSlots.length > 0 && (
        <div className="form-group">
          <label>Horário Disponível:</label>
          <div className="time-slots">
            {availableSlots.map(slot => (
              <button
                key={slot}
                type="button"
                className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.employeeId && form.serviceId && selectedDate && availableSlots.length === 0 && (
        <p className="no-slots">Nenhum horário disponível para esta data.</p>
      )}

      <button 
        type="submit" 
        disabled={loading || !selectedSlot}
        className="submit-button"
      >
        {loading ? 'Agendando...' : 'Confirmar Agendamento'}
      </button>
    </form>
  );
}