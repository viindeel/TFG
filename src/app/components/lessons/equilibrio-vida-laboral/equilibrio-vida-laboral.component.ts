import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EscenarioNegociacion {
  pregunta: string;
  descripcion: string;
  opciones: {
    texto: string;
    resultado: string;
    siguienteEscenario?: number;
    consecuencia: string;
  }[];
}

@Component({
  selector: 'app-equilibrio-vida-laboral',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equilibrio-vida-laboral.component.html',
  styleUrl: './equilibrio-vida-laboral.component.scss'
})
export class EquilibrioVidaLaboralComponent implements OnInit {
  escenarios: EscenarioNegociacion[] = [
    {
      pregunta: 'Tienes una reunión importante con un cliente clave, pero tu hijo tiene un evento escolar. ¿Qué haces?',
      descripcion: 'Debes equilibrar tus responsabilidades laborales y familiares.',
      opciones: [
        { texto: 'Cancelar el evento escolar y priorizar la reunión.', resultado: 'Mal', siguienteEscenario: 1, consecuencia: 'Avanzas en el trabajo, pero descuidas tu vida familiar.' },
        { texto: 'Asistir al evento escolar y reprogramar la reunión.', resultado: 'Bien', siguienteEscenario: 2, consecuencia: 'Mantienes un equilibrio y fortaleces tus relaciones.' },
        { texto: 'Delegar la reunión a un colega y asistir al evento.', resultado: 'Neutral', siguienteEscenario: 3, consecuencia: 'Aseguras la reunión, pero pierdes control directo.' }
      ]
    },
    {
      pregunta: 'Tu jefe te pide que trabajes horas extras todos los días. ¿Cómo respondes?',
      descripcion: 'El trabajo extra afecta tu tiempo personal y tu bienestar.',
      opciones: [
        { texto: 'Aceptar sin quejarte para impresionar a tu jefe.', resultado: 'Mal', siguienteEscenario: 4, consecuencia: 'Avanzas en el trabajo, pero te agotas y descuidas tu vida personal.' },
        { texto: 'Negociar un horario flexible y establecer límites.', resultado: 'Bien', siguienteEscenario: 5, consecuencia: 'Mantienes un equilibrio y cuidas tu bienestar.' },
        { texto: 'Buscar otro trabajo con mejor equilibrio.', resultado: 'Neutral', siguienteEscenario: 6, consecuencia: 'Aseguras tu bienestar, pero cambias de entorno laboral.' }
      ]
    },
    {
      pregunta: 'Sientes que no tienes tiempo para tus hobbies. ¿Qué haces?',
      descripcion: 'Es importante dedicar tiempo a actividades que disfrutas.',
      opciones: [
        { texto: 'Dejar de lado los hobbies para enfocarte en el trabajo.', resultado: 'Mal', siguienteEscenario: 7, consecuencia: 'Avanzas en el trabajo, pero pierdes tu pasión y bienestar.' },
        { texto: 'Programar tiempo para los hobbies en tu agenda.', resultado: 'Bien', siguienteEscenario: 8, consecuencia: 'Mantienes tu pasión y reduces el estrés.' },
        { texto: 'Buscar hobbies que puedas hacer en el trabajo.', resultado: 'Neutral', siguienteEscenario: 9, consecuencia: 'Aprovechas el tiempo, pero reduces la desconexión del trabajo.' }
      ]
    },
    {
      pregunta: 'Estás de vacaciones y recibes una llamada de trabajo urgente. ¿Qué haces?',
      descripcion: 'Las vacaciones son para desconectar del trabajo y recargar energías.',
      opciones: [
        { texto: 'Responder la llamada y resolver el problema.', resultado: 'Mal', siguienteEscenario: 10, consecuencia: 'Avanzas en el trabajo, pero no descansas.' },
        { texto: 'Explicar que estás de vacaciones y pedir que te contacten después.', resultado: 'Bien', siguienteEscenario: 11, consecuencia: 'Disfrutas tus vacaciones y vuelves con energía.' },
        { texto: 'Ignorar la llamada y disfrutar tus vacaciones.', resultado: 'Neutral', siguienteEscenario: 12, consecuencia: 'Descansas, pero podrías perder una oportunidad laboral.' }
      ]
    },
    {
      pregunta: 'Sientes que no tienes tiempo para hacer ejercicio. ¿Qué haces?',
      descripcion: 'El ejercicio es importante para tu salud física y mental.',
      opciones: [
        { texto: 'Dejar de hacer ejercicio para ganar tiempo.', resultado: 'Mal', siguienteEscenario: 13, consecuencia: 'Ganas tiempo, pero pierdes salud.' },
        { texto: 'Programar tiempo para hacer ejercicio en tu agenda.', resultado: 'Bien', siguienteEscenario: 14, consecuencia: 'Mejoras tu salud y bienestar.' },
        { texto: 'Hacer ejercicio durante las horas de trabajo.', resultado: 'Neutral', siguienteEscenario: 15, consecuencia: 'Aprovechas el tiempo, pero reduces la productividad laboral.' }
      ]
    },
    {
      pregunta: 'Tu pareja se queja de que pasas demasiado tiempo en el trabajo. ¿Qué haces?',
      descripcion: 'Es importante mantener una buena relación con tu pareja.',
      opciones: [
        { texto: 'Ignorar las quejas y seguir trabajando.', resultado: 'Mal', siguienteEscenario: 16, consecuencia: 'Avanzas en el trabajo, pero dañas tu relación.' },
        { texto: 'Dedicar más tiempo a tu pareja y negociar un equilibrio.', resultado: 'Bien', siguienteEscenario: 17, consecuencia: 'Fortaleces tu relación y encuentras un equilibrio.' },
        { texto: 'Llevar a tu pareja al trabajo para pasar tiempo juntos.', resultado: 'Neutral', siguienteEscenario: 18, consecuencia: 'Pasas tiempo con tu pareja, pero mezclas trabajo y vida personal.' }
      ]
    },
    // ... más escenarios
  ];

  escenarioActual!: EscenarioNegociacion;
  indiceEscenario = 0;
  juegoTerminado = false;
  resultadoFinal = '';
  consecuenciaSeleccionada = '';

  constructor() { }

  ngOnInit() {
    this.escenarioActual = this.escenarios[0];
  }

  seleccionarOpcion(opcion: any) {
    this.resultadoFinal = opcion.resultado === 'Bien' ? '¡Excelente! Has encontrado el equilibrio.' :
      opcion.resultado === 'Mal' ? '¡Cuidado! Estás perdiendo el equilibrio.' :
        'Has tomado una decisión neutral. Evalúa las consecuencias.';
    this.consecuenciaSeleccionada = opcion.consecuencia;
    if (opcion.siguienteEscenario !== undefined) {
      this.indiceEscenario = opcion.siguienteEscenario;
      this.escenarioActual = this.escenarios[this.indiceEscenario];
    } else {
      this.juegoTerminado = true;
    }
  }

  avanzarEscenario() {
    this.resultadoFinal = '';
    this.consecuenciaSeleccionada = '';
    if (this.indiceEscenario < this.escenarios.length - 1) {
      this.indiceEscenario++;
      this.escenarioActual = this.escenarios[this.indiceEscenario];
    } else {
      this.juegoTerminado = true;
    }
  }

  reiniciarJuego() {
    this.indiceEscenario = 0;
    this.escenarioActual = this.escenarios[0];
    this.juegoTerminado = false;
    this.resultadoFinal = '';
    this.consecuenciaSeleccionada = '';
  }
}