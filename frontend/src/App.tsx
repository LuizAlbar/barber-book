import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookingPage } from './pages/BookingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/booking/:barbershopId" element={<BookingPage />} />
          <Route path="/" element={
            <div className="home">
              <h1>BarberBook</h1>
              <p>Sistema de Agendamento Online</p>
              <p>Para acessar, use o link fornecido pela sua barbearia.</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;