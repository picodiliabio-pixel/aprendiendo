const questions = [
  {
    id: 'mood',
    domain: 'depresion',
    label: 'Ánimo bajo, tristeza o sensación de vacío la mayor parte del día.',
    source: 'Depresión / PHQ-A',
  },
  {
    id: 'interest',
    domain: 'depresion',
    label: 'Poco interés o poco placer en actividades que antes disfrutabas.',
    source: 'Depresión / PHQ-A',
  },
  {
    id: 'sleep',
    domain: 'depresion',
    label: 'Problemas para dormir, dormir demasiado o despertar sin descanso.',
    source: 'Sueño y energía',
  },
  {
    id: 'energy',
    domain: 'depresion',
    label: 'Cansancio, baja energía o dificultad para iniciar tareas escolares.',
    source: 'Funcionamiento',
  },
  {
    id: 'worth',
    domain: 'depresion',
    label: 'Sentirte culpable, inútil o como si fueras una carga para otros.',
    source: 'Autoconcepto',
  },
  {
    id: 'focus',
    domain: 'depresion',
    label: 'Dificultad para concentrarte, recordar instrucciones o tomar decisiones.',
    source: 'Atención / neuropsicología',
  },
  {
    id: 'worry',
    domain: 'ansiedad',
    label: 'Preocupación excesiva que cuesta controlar.',
    source: 'Ansiedad / GAD-7',
  },
  {
    id: 'nerves',
    domain: 'ansiedad',
    label: 'Nervios, tensión, inquietud o sensación de estar en alerta.',
    source: 'Ansiedad / GAD-7',
  },
  {
    id: 'relax',
    domain: 'ansiedad',
    label: 'Dificultad para relajarte o descansar mentalmente.',
    source: 'Regulación',
  },
  {
    id: 'fear',
    domain: 'ansiedad',
    label: 'Miedo a que algo malo ocurra, ataques de pánico o evitación de situaciones.',
    source: 'Ansiedad / SCARED',
  },
  {
    id: 'body',
    domain: 'ansiedad',
    label: 'Síntomas físicos por estrés: dolor de estómago, cabeza, palpitaciones o falta de aire.',
    source: 'Somatización',
  },
  {
    id: 'school',
    domain: 'funcionamiento',
    label: 'El malestar afecta asistencia, notas, convivencia, autocuidado o relaciones.',
    source: 'Impacto escolar',
  },
  {
    id: 'safety',
    domain: 'seguridad',
    label: 'Pensamientos de hacerte daño, desaparecer o no querer vivir.',
    source: 'Seguridad',
  },
];

const choices = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad' },
  { value: 3, label: 'Casi todos los días' },
];

const questionsContainer = document.querySelector('#questions');
const form = document.querySelector('#screeningForm');
const results = document.querySelector('#results');

function renderQuestions() {
  questionsContainer.innerHTML = questions
    .map(
      (question, index) => `
        <fieldset class="question-card">
          <legend>${index + 1}. ${question.label}</legend>
          <span class="question-card__meta">${question.source}</span>
          <div class="options">
            ${choices
              .map(
                (choice) => `
                  <label class="option-pill">
                    <input type="radio" name="${question.id}" value="${choice.value}" required />
                    <span>${choice.label}</span>
                  </label>
                `,
              )
              .join('')}
          </div>
        </fieldset>
      `,
    )
    .join('');
}

function getLevel(score, maxScore) {
  const ratio = score / maxScore;

  if (ratio >= 0.67) return { label: 'Alto', className: 'high' };
  if (ratio >= 0.42) return { label: 'Moderado', className: 'moderate' };
  if (ratio >= 0.2) return { label: 'Leve', className: 'mild' };
  return { label: 'Bajo', className: 'low' };
}

function recommendation(overallLevel, hasSafetyAlert) {
  if (hasSafetyAlert) {
    return [
      'Activar de inmediato el protocolo de seguridad: acompañamiento permanente de un adulto responsable.',
      'Contactar orientación escolar, familia/acudiente y servicios de urgencias o línea de crisis local.',
      'Retirar medios de riesgo y acordar un plan de protección mientras llega ayuda profesional.',
    ];
  }

  if (overallLevel === 'Alto') {
    return [
      'Solicitar valoración prioritaria con psicología clínica, psiquiatría infantil/adolescente o servicio de salud.',
      'Construir un plan de apoyo escolar: ajustes temporales, seguimiento semanal y comunicación con acudientes.',
      'Monitorear sueño, alimentación, asistencia, aislamiento, irritabilidad y consumo de sustancias.',
    ];
  }

  if (overallLevel === 'Moderado') {
    return [
      'Programar entrevista con orientación escolar o profesional de salud mental en los próximos días.',
      'Acordar hábitos protectores: sueño regular, actividad física, pausas, reducción de pantallas nocturnas y apoyo social.',
      'Reaplicar el tamizaje en 2 a 4 semanas o antes si el malestar aumenta.',
    ];
  }

  if (overallLevel === 'Leve') {
    return [
      'Conversar con un adulto de confianza y observar si los síntomas persisten o aumentan.',
      'Fortalecer rutinas de sueño, estudio, alimentación, movimiento y conexión con pares seguros.',
      'Buscar orientación si aparece deterioro escolar, aislamiento o tristeza/ansiedad sostenida.',
    ];
  }

  return [
    'Mantener hábitos protectores y redes de apoyo.',
    'Usar el resultado como línea base, no como diagnóstico.',
    'Pedir ayuda si aparecen ideas de daño, deterioro funcional o malestar persistente.',
  ];
}

function scoreForm(formData) {
  const totals = questions.reduce(
    (accumulator, question) => {
      const value = Number(formData.get(question.id));
      accumulator[question.domain] += value;
      accumulator.total += value;
      return accumulator;
    },
    { depresion: 0, ansiedad: 0, funcionamiento: 0, seguridad: 0, total: 0 },
  );

  const depressionLevel = getLevel(totals.depresion, 18);
  const anxietyLevel = getLevel(totals.ansiedad, 15);
  const functioningLevel = getLevel(totals.funcionamiento, 3);
  const overallLevel = getLevel(totals.total, 39);
  const safetyAlert = totals.seguridad > 0;
  const actionLevel = safetyAlert ? 'Alerta de seguridad' : overallLevel.label;

  return {
    totals,
    depressionLevel,
    anxietyLevel,
    functioningLevel,
    overallLevel: { ...overallLevel, label: actionLevel },
    safetyAlert,
  };
}

function renderResults(data, formData) {
  const plan = recommendation(data.overallLevel.label, data.safetyAlert);
  const grade = formData.get('grade');
  const age = formData.get('age');
  const support = formData.get('support');

  results.hidden = false;
  results.className = `results ${data.safetyAlert ? 'safety' : data.overallLevel.className}`;
  results.innerHTML = `
    <p class="eyebrow">Resultado orientativo</p>
    <h2>${data.overallLevel.label}</h2>
    <p>
      Estudiante de ${age} años, grado ${grade}. Acompañamiento reportado: ${support}.
      Este resultado no diagnostica; prioriza la conversación y la valoración profesional cuando corresponda.
    </p>
    <div class="result-grid">
      <div class="score-card">
        <span>Depresión</span>
        <strong>${data.totals.depresion}/18</strong>
        <p>Nivel ${data.depressionLevel.label}</p>
      </div>
      <div class="score-card">
        <span>Ansiedad</span>
        <strong>${data.totals.ansiedad}/15</strong>
        <p>Nivel ${data.anxietyLevel.label}</p>
      </div>
      <div class="score-card">
        <span>Impacto escolar</span>
        <strong>${data.totals.funcionamiento}/3</strong>
        <p>Nivel ${data.functioningLevel.label}</p>
      </div>
    </div>
    <div class="plan">
      <h3>Plan sugerido</h3>
      <ul>${plan.map((item) => `<li>${item}</li>`).join('')}</ul>
    </div>
  `;
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

renderQuestions();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = scoreForm(formData);
  renderResults(data, formData);
});

form.addEventListener('reset', () => {
  results.hidden = true;
  results.innerHTML = '';
});
