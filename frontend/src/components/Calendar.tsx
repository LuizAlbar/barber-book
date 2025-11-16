import { useState } from 'react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showNextMonth, setShowNextMonth] = useState(false);

  const today = new Date();
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const displayMonth = showNextMonth ? nextMonth : currentMonth;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias vazios no início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    return formatDate(date) === formatDate(today);
  };

  const isPast = (date: Date) => {
    return date < today && !isToday(date);
  };

  const isSelected = (date: Date) => {
    return formatDate(date) === selectedDate;
  };

  const renderMonth = (monthDate: Date) => {
    const days = getDaysInMonth(monthDate);
    const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
      <div className="calendar-month">
        <div className="month-header">
          {showNextMonth && (
            <button className="nav-arrow" onClick={() => setShowNextMonth(false)}>
              ‹
            </button>
          )}
          <h3 className="month-title">{monthName}</h3>
          {!showNextMonth && (
            <button className="nav-arrow" onClick={() => setShowNextMonth(true)}>
              ›
            </button>
          )}
        </div>
        <div className="weekdays">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="days-grid">
          {days.map((date, index) => (
            <div key={index} className="day-cell">
              {date && (
                <button
                  className={`day-button ${isPast(date) ? 'past' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                  onClick={() => !isPast(date) && onDateSelect(formatDate(date))}
                  disabled={isPast(date)}
                >
                  {date.getDate()}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar">
      {renderMonth(displayMonth)}
    </div>
  );
}