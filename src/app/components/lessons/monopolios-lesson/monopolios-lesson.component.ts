import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monopolios-lesson',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monopolios-lesson.component.html',
  styleUrl: './monopolios-lesson.component.scss'
})
export class MonopoliosLessonComponent {
  preguntas = [
    {
      pregunta: 'Eres el único proveedor de agua en la ciudad. ¿Qué haces?',
      descripcion: 'La ciudad depende de ti para el agua potable.',
      opciones: [
        { texto: 'Subir los precios al máximo.', resultado: 'Mal' },
        { texto: 'Mantener precios justos y reinvertir en infraestructura.', resultado: 'Bien' },
        { texto: 'Vender la empresa al mejor postor.', resultado: 'Neutral' }
      ]
    },
    {
      pregunta: 'Un competidor quiere entrar al mercado. ¿Cómo reaccionas?',
      descripcion: 'Un nuevo competidor podría desafiar tu monopolio.',
      opciones: [
        { texto: 'Bajar los precios para expulsarlo.', resultado: 'Mal' },
        { texto: 'Innovar y mejorar tus servicios.', resultado: 'Bien' },
        { texto: 'Comprar al competidor.', resultado: 'Neutral' }
      ]
    },
    {
      pregunta: 'El gobierno quiere regular tus precios. ¿Qué haces?',
      descripcion: 'El gobierno busca proteger a los consumidores.',
      opciones: [
        { texto: 'Luchar contra la regulación.', resultado: 'Mal' },
        { texto: 'Colaborar con el gobierno para encontrar un equilibrio.', resultado: 'Bien' },
        { texto: 'Ignorar la regulación.', resultado: 'Neutral' }
      ]
    },
    {
      pregunta: 'Tienes la oportunidad de expandir tu monopolio a otros mercados. ¿Qué haces?',
      descripcion: 'La expansión podría aumentar tus ganancias.',
      opciones: [
        { texto: 'Expandirte agresivamente.', resultado: 'Mal' },
        { texto: 'Expandirte de forma sostenible y responsable.', resultado: 'Bien' },
        { texto: 'No expandirte.', resultado: 'Neutral' }
      ]
    },
    {
      pregunta: 'Los consumidores se quejan de la falta de innovación. ¿Qué haces?',
      descripcion: 'La falta de competencia puede llevar a la falta de innovación.',
      opciones: [
        { texto: 'Ignorar las quejas.', resultado: 'Mal' },
        { texto: 'Invertir en investigación y desarrollo.', resultado: 'Bien' },
        { texto: 'Reducir los costos para aumentar las ganancias.', resultado: 'Neutral' }
      ]
    },
    {
        pregunta: 'Tu empresa ha sido acusada de prácticas anticompetitivas. ¿Qué haces?',
        descripcion: 'Las acusaciones podrían dañar tu reputación.',
        opciones: [
          { texto: 'Negar las acusaciones y luchar legalmente.', resultado: 'Neutral' },
          { texto: 'Aceptar la responsabilidad y colaborar con las autoridades.', resultado: 'Bien' },
          { texto: 'Culpar a la competencia.', resultado: 'Mal' }
        ]
      },
      {
        pregunta: 'Un nuevo competidor está ganando terreno rápidamente. ¿Cómo respondes?',
        descripcion: 'Tu cuota de mercado está en riesgo.',
        opciones: [
          { texto: 'Iniciar una guerra de precios.', resultado: 'Mal' },
          { texto: 'Mejorar la calidad y el servicio al cliente.', resultado: 'Bien' },
          { texto: 'Comprar al competidor para eliminar la amenaza.', resultado: 'Neutral' }
        ]
      },
      {
        pregunta: 'El gobierno te ofrece un subsidio para expandir tu infraestructura. ¿Qué haces?',
        descripcion: 'El subsidio podría beneficiar a la comunidad.',
        opciones: [
          { texto: 'Aceptar el subsidio y expandir la infraestructura.', resultado: 'Bien' },
          { texto: 'Rechazar el subsidio y mantener el control total.', resultado: 'Neutral' },
          { texto: 'Utilizar el subsidio para otros fines.', resultado: 'Mal' }
        ]
      },
      {
        pregunta: 'Los consumidores están preocupados por el impacto ambiental de tu empresa. ¿Qué haces?',
        descripcion: 'La sostenibilidad es importante para la imagen de tu empresa.',
        opciones: [
          { texto: 'Ignorar las preocupaciones.', resultado: 'Mal' },
          { texto: 'Implementar prácticas sostenibles y comunicarlas transparentemente.', resultado: 'Bien' },
          { texto: 'Contratar una empresa de relaciones públicas para mejorar tu imagen.', resultado: 'Neutral' }
        ]
      },
      {
        pregunta: 'Tu empresa tiene la oportunidad de influir en las regulaciones del mercado. ¿Qué haces?',
        descripcion: 'El lobbying puede ser una herramienta poderosa.',
        opciones: [
          { texto: 'Influir en las regulaciones para beneficiar a tu empresa.', resultado: 'Mal' },
          { texto: 'Colaborar con el gobierno para crear regulaciones justas.', resultado: 'Bien' },
          { texto: 'Mantenerte al margen de la política.', resultado: 'Neutral' }
        ]
      }
    // Añade más preguntas y opciones aquí
  ];

  preguntaActual = this.preguntas[0];
  indicePregunta = 0;
  juegoTerminado = false;
  resultadoFinal = '';
  mostrarResultado = false; // Nueva variable para controlar la visibilidad del resultado

  seleccionarOpcion(resultado: string) {
    if (resultado === 'Bien') {
      this.resultadoFinal = '¡Excelente! Has manejado el monopolio de forma responsable.';
    } else if (resultado === 'Mal') {
      this.resultadoFinal = '¡Cuidado! Tus acciones podrían perjudicar a los consumidores.';
    } else {
      this.resultadoFinal = 'Has tomado una decisión neutral. Evalúa las consecuencias a largo plazo.';
    }
    this.mostrarResultado = true; // Mostrar el resultado después de la selección
  }

  avanzarPregunta() {
    this.mostrarResultado = false; // Ocultar el resultado antes de avanzar
    if (this.indicePregunta < this.preguntas.length - 1) {
      this.indicePregunta++;
      this.preguntaActual = this.preguntas[this.indicePregunta];
    } else {
      this.juegoTerminado = true;
    }
  }

  reiniciarJuego() {
    this.indicePregunta = 0;
    this.preguntaActual = this.preguntas[this.indicePregunta];
    this.juegoTerminado = false;
    this.resultadoFinal = '';
    this.mostrarResultado = false; 
  }
}