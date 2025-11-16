import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { barbershopService } from '../services/api';
import { BookingForm } from '../components/BookingForm';

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

export function BookingPage() {
  const { barbershopId } = useParams<{ barbershopId: string }>();
  const [searchParams] = useSearchParams();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extrair token da URL e configurar no serviço
    const token = searchParams.get('token');
    if (token) {
      // Configurar token no axios
      barbershopService.setAuthToken(token);
    }
    
    if (barbershopId) {
      loadBarbershop();
    }
  }, [barbershopId, searchParams]);

  const loadBarbershop = async () => {
    try {
      setLoading(true);
      const data = await barbershopService.getById(barbershopId!);
      setBarbershop(data);
    } catch (error) {
      console.error('Erro ao carregar barbearia:', error);
      setError('Barbearia não encontrada');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error || !barbershop) {
    return (
      <div className="error">
        <h2>Ops! 😔</h2>
        <p>{error || 'Barbearia não encontrada'}</p>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <header className="barbershop-header">
        <h1>{barbershop.name}</h1>
        <p className="address">
          📍 {barbershop.fullAddress}, {barbershop.neighborhood}
          {barbershop.referencePoint && ` - ${barbershop.referencePoint}`}
        </p>
      </header>

      <div className="booking-container">
        <div className="barbershop-info">
          <h3>Nossos Serviços</h3>
          <div className="services-list">
            {barbershop.services.map(service => (
              <div key={service.id} className="service-item">
                <span className="service-name">{service.name}</span>
                <span className="service-price">R$ {service.price.toFixed(2)}</span>
                <span className="service-duration">{service.timeTaken}min</span>
              </div>
            ))}
          </div>

          <h3>Nossos Barbeiros</h3>
          <div className="barbers-list">
            {barbershop.employees.map(employee => (
              <div key={employee.id} className="barber-item">
                👨‍💼 {employee.user.name}
              </div>
            ))}
          </div>

          {barbershop.barberSchedules.length > 0 && (
            <>
              <h3>Horário de Funcionamento</h3>
              <div className="schedule-info">
                <p>🕐 {barbershop.barberSchedules[0].openTime} às {barbershop.barberSchedules[0].closeTime}</p>
              </div>
            </>
          )}
        </div>

        <div className="booking-form-container">
          <BookingForm barbershop={barbershop} />
        </div>
      </div>
    </div>
  );
}