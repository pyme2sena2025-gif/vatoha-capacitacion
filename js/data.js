const PORTAL_CURSOS = [
  {
    id: 'liderazgo-motivacion',
    categoria: 'Habilidades Directivas',
    titulo: '¿Qué es el liderazgo? Liderazgo y Motivación',
    modalidad: 'e-learning',
    descripcion:
      'Fortalecer las habilidades de liderazgo mediante la motivación, la toma de decisiones responsables y la delegación efectiva, brindando herramientas para guiar y acompañar equipos de trabajo.',
        video: {
      titulo: 'Video introductorio del curso',
      url: 'assets/modulo1.mp4'
    },
    modulos: [
      {
        id: 'lid-m1',
        numero: 'MÓDULO 1',
        titulo: 'Liderazgo y motivación',
        duracion: '2 horas',
        video: {
          titulo: ' Liderazgo positivo en el trabajo',
          url: 'assets/modulo1.1.mp4'
          // Si prefieres usar un archivo guardado en tu carpeta assets/, escribe:
          // url: 'assets/video-modulo1.mp4'
        },
        temas: [
          'Introducción y enfoque del liderazgo positivo',
          'Características de un líder positivo',
          'Herramientas prácticas para motivar al equipo'
        ],
        conceptos: [
          {
            titulo: 'Introducción y enfoque del tema',
            texto:
              'El liderazgo consiste en influir positivamente en los demás, brindándoles conocimientos, apoyo y soluciones para alcanzar sus objetivos. La motivación surge cuando el líder inspira a su equipo con su actitud, confianza, respeto y comunicación.',
            cita: '“Un buen líder impulsa el crecimiento de su equipo y promueve soluciones ante diferentes situaciones.”',
            video: {
              titulo: 'Video introductorio: Liderazgo y motivación',
              url: 'assets/Modulo1.2.mp4'
            }
          },
          {
            titulo: 'Características de un líder positivo',
            texto: 'Quien ejerce un liderazgo positivo mantiene conductas coherentes en el día a día:',
            lista: [
              'Mantiene una actitud respetuosa y optimista.',
              'Reconoce los logros y esfuerzos de los trabajadores.',
              'Escucha las opiniones y propuestas del equipo.',
              'Promueve la confianza y el compañerismo.',
              'Brinda apoyo ante las dificultades.',
              'Motiva mediante el ejemplo y la comunicación.'
            ],
            video: {
              titulo: 'Video introductorio: Liderazgo y motivación',
              url: 'assets/modulo1.3.mp4'
            }
          },
          {
            titulo: 'Herramientas prácticas para motivar al equipo',
            texto: 'Aplica estas seis herramientas en la gestión diaria con tu grupo de trabajo:',
            tabla: {
              columnas: ['Herramienta', 'Aplicación', 'Ejemplo práctico'],
              filas: [
                [
                  'Reconocimiento',
                  'Valorar los logros, el esfuerzo y las iniciativas de cada integrante para fortalecer la confianza y el sentido de pertenencia.',
                  'Felicitar a una persona por alcanzar una meta o contribuir al resultado del equipo.'
                ],
                [
                  'Comunicación positiva',
                  'Transmitir ideas e instrucciones con claridad, respeto y empatía, escuchando con atención.',
                  'Explicar una actividad de forma precisa y confirmar que todos comprendieron sus responsabilidades.'
                ],
                [
                  'Participación',
                  'Involucrar al equipo en la generación de ideas y decisiones relacionadas con su trabajo.',
                  'Consultar las propuestas de los trabajadores antes de organizar un proyecto.'
                ],
                [
                  'Trabajo en equipo',
                  'Promover la cooperación y distribuir responsabilidades según las habilidades de cada persona.',
                  'Coordinar tareas y ofrecer ayuda a un compañero cuando lo necesite.'
                ],
                [
                  'Retroalimentación',
                  'Ofrecer observaciones oportunas y respetuosas que reconozcan aciertos y orienten mejoras.',
                  'Destacar un buen resultado y sugerir una acción concreta para mejorar el siguiente proceso.'
                ],
                [
                  'Desarrollo personal',
                  'Brindar oportunidades de aprendizaje, nuevos retos y acompañamiento profesional.',
                  'Motivar la participación en una capacitación o asignar una nueva responsabilidad con orientación.'
                ]
              ]
            },
            video: {
              titulo: 'Video: Herramientas para motivar al equipo',
              url: 'assets/modulo1.4.mp4'
            }
          }
        ],
        actividad:
          'Selecciona dos herramientas de la tabla y describe una acción concreta que aplicarás esta semana con tu equipo de trabajo.',
        conclusion:
          'El liderazgo positivo transforma el ambiente laboral cuando combina ejemplo, escucha activa y reconocimiento oportuno.',
        quiz: [
          {
            pregunta: '1. ¿Qué es el liderazgo positivo?',
            opciones: [
              'Dar órdenes sin escuchar al equipo.',
              'Guiar y motivar a las personas mediante el respeto y la confianza.',
              'Controlar todas las actividades de los trabajadores.',
              'Evitar que los trabajadores participen en las decisiones.'
            ],
            correcta: 1
          },
          {
            pregunta: '2. ¿Qué acción demuestra que un líder reconoce el esfuerzo de su equipo?',
            opciones: [
              'Ignorar los resultados obtenidos.',
              'Señalar únicamente los errores.',
              'Reconocer los logros y destacar las capacidades de los trabajadores.',
              'Asignar más responsabilidades sin orientación.'
            ],
            correcta: 2
          },
          {
            pregunta: '3. ¿Cuál es una característica de un buen líder?',
            opciones: [
              'Mantener una comunicación respetuosa.',
              'Imponer siempre sus opiniones.',
              'Evitar escuchar propuestas.',
              'Desconfiar de su equipo.'
            ],
            correcta: 0
          },
          {
            pregunta: '4. ¿Cómo influye la motivación en el ambiente laboral?',
            opciones: [
              'Genera competencia negativa.',
              'Disminuye la participación.',
              'Aumenta los conflictos.',
              'Fortalece el compromiso y el trabajo en equipo.'
            ],
            correcta: 3
          },
          {
            pregunta: '5. ¿Qué debe hacer un líder cuando un trabajador presenta una dificultad?',
            opciones: [
              'Ignorar la situación.',
              'Brindar apoyo y orientación.',
              'Culpar al trabajador.',
              'Evitar que participe en nuevas actividades.'
            ],
            correcta: 1
          }
        ]
      },
      {
        id: 'lid-m2',
        numero: 'MÓDULO 2',
        titulo: 'Toma de decisiones responsables',
        duracion: '2 horas',
        video: {
              titulo: 'Toma de decisiones responsables',
              url: 'assets/modulo1.2.1.mp4'
            },
        temas: [
          'Importancia de decidir con responsabilidad',
          'Herramientas prácticas de análisis',
          'Pasos para tomar una decisión responsable'
        ],
        conceptos: [
          {
            titulo: '¿Por qué es importante tomar decisiones responsables?',
            texto:
              'Consiste en analizar situaciones, evaluar alternativas y elegir la mejor opción considerando cómo afecta al equipo y a la organización:',
            lista: [
              'Permite solucionar problemas de manera oportuna.',
              'Favorece el cumplimiento de los objetivos.',
              'Promueve la confianza entre los integrantes del equipo.',
              'Ayuda a prevenir errores y conflictos.',
              'Fortalece la responsabilidad y el compromiso laboral.'
            ],
            video: {
              titulo: 'Toma de decisiones responsables',
              url: 'assets/modulo1.2.2.mp4'
            }
          },
          {
            titulo: 'Herramientas prácticas para decidir',
            texto: 'Utiliza esta guía antes de tomar decisiones que impacten la operación:',
            tabla: {
              columnas: ['Herramienta', '¿Cómo aplicarla?', 'Ejemplo práctico'],
              filas: [
                [
                  'Identificación del problema',
                  'Reconocer con claridad qué situación necesita una decisión y cuáles son sus causas.',
                  'Detectar retrasos frecuentes en las actividades del equipo.'
                ],
                [
                  'Análisis de alternativas',
                  'Revisar distintas opciones y comparar cuál puede ofrecer una mejor solución.',
                  'Proponer nuevas formas de distribuir las tareas.'
                ],
                [
                  'Evaluación de consecuencias',
                  'Analizar ventajas, desventajas y posibles riesgos de cada alternativa.',
                  'Valorar cómo afectaría cada solución al tiempo y a la carga de trabajo.'
                ],
                [
                  'Consulta y escucha',
                  'Considerar las opiniones y propuestas de las personas involucradas antes de decidir.',
                  'Escuchar las ideas de los compañeros en una reunión de equipo.'
                ],
                [
                  'Seguimiento',
                  'Comprobar los resultados de la decisión y realizar ajustes cuando sea necesario.',
                  'Revisar si la nueva distribución mejoró el cumplimiento de las tareas.'
                ]
              ]
            },
            video: {
              titulo: 'Toma de decisiones responsables',
              url: 'assets/modulo1.2.3.mp4'
            }
          },
          {
            titulo: 'Pasos para tomar una decisión responsable',
            texto: 'Sigue esta secuencia ordenada frente a cualquier reto operativo:',
            pasos: [
              'Identificar claramente la situación.',
              'Recopilar la información necesaria.',
              'Analizar las posibles soluciones.',
              'Evaluar las consecuencias de cada alternativa.',
              'Elegir la opción más adecuada.',
              'Comunicar la decisión y hacer seguimiento.'
            ],
            video: {
              titulo: 'Video de apoyo: Toma de decisiones',
              url: 'assets/modulo1.2.4.mp4'
            }
          },
        ],
        actividad:
          'Piensa en una dificultad reciente de tu área y aplica los 6 pasos para estructurar una solución responsable y medible.',
        conclusion:
          'Decidir con información, consulta al equipo y seguimiento evita improvisaciones y fortalece la confianza.',
        quiz: [
          {
            pregunta: '1. ¿Qué significa tomar decisiones responsables?',
            opciones: [
              'Elegir rápidamente sin analizar.',
              'Dejar que otras personas decidan siempre.',
              'Analizar alternativas y evaluar sus consecuencias.',
              'Actuar únicamente por emociones.'
            ],
            correcta: 2
          },
          {
            pregunta: '2. ¿Cuál es el primer paso para tomar una decisión?',
            opciones: [
              'Identificar la situación o el problema.',
              'Comunicar la decisión.',
              'Elegir cualquier alternativa.',
              'Asignar responsabilidades.'
            ],
            correcta: 0
          },
          {
            pregunta: '3. ¿Por qué es importante recopilar información antes de decidir?',
            opciones: [
              'Para retrasar las actividades.',
              'Para evitar escuchar opiniones.',
              'Para aumentar las responsabilidades.',
              'Para comprender la situación y reducir posibles errores.'
            ],
            correcta: 3
          },
          {
            pregunta: '4. Un trabajador comete un error. ¿Qué debería hacer su líder?',
            opciones: [
              'Regañarlo frente a sus compañeros.',
              'Analizar lo sucedido y buscar soluciones.',
              'Ignorar el problema.',
              'Evitar asignarle nuevas actividades.'
            ],
            correcta: 1
          },
          {
            pregunta: '5. ¿Qué se debe hacer después de tomar una decisión?',
            opciones: [
              'Olvidar el asunto.',
              'Evitar comunicarla.',
              'Realizar seguimiento y verificar los resultados.',
              'Cambiarla constantemente.'
            ],
            correcta: 2
          }
        ]
      },
      {
        id: 'lid-m3',
        numero: 'MÓDULO 3',
        titulo: 'Delegación y acompañamiento',
        duracion: '2 horas',
        video: {
              titulo: 'Delegación y acompañamiento',
              url: 'assets/Modulo1.3.1.mp4'
            },
        temas: [
          'Beneficios de delegar y acompañar',
          'Herramientas prácticas de delegación',
          'Pasos para delegar correctamente'
        ],
        conceptos: [
          {
            titulo: 'Importancia de la delegación y el acompañamiento',
            texto:
              'Delegar es asignar responsabilidades según las capacidades de cada integrante; acompañar es orientar y resolver inquietudes sin limitar la autonomía:',
            lista: [
              'Distribuye adecuadamente las responsabilidades.',
              'Fortalece la confianza en los trabajadores.',
              'Permite desarrollar nuevas habilidades.',
              'Mejora el trabajo en equipo.',
              'Favorece el cumplimiento de las actividades.',
              'Promueve la autonomía y el crecimiento profesional.'
            ],
            video: {
              titulo: 'Delegación y acompañamiento',
              url: 'assets/modulo1.3.2.mp4'
            },
          },
          {
            titulo: 'Herramientas prácticas',
            texto: 'Elementos clave para que una tarea delegada tenga éxito:',
            tabla: {
              columnas: ['Herramienta', '¿Para qué sirve?', 'Ejemplo práctico'],
              filas: [
                [
                  'Asignación de tareas',
                  'Distribuir actividades según habilidades, conocimientos y capacidades de cada persona.',
                  'Asignar la organización de un informe a quien tenga facilidad para redactar y manejar información.'
                ],
                [
                  'Comunicación clara',
                  'Explicar responsabilidades, instrucciones y resultados esperados.',
                  'Indicar qué tarea debe realizarse, cómo se debe entregar y cuál es el plazo establecido.'
                ],
                [
                  'Establecimiento de objetivos',
                  'Definir metas concretas y tiempos de cumplimiento para orientar al equipo.',
                  'Acordar terminar una actividad antes de una fecha determinada y revisar el avance.'
                ],
                [
                  'Retroalimentación',
                  'Reconocer avances y ofrecer recomendaciones para mejorar el desempeño.',
                  'Felicitar un trabajo bien realizado y sugerir ajustes específicos para la próxima entrega.'
                ],
                [
                  'Seguimiento',
                  'Verificar el desarrollo de actividades, resolver dudas y brindar apoyo oportuno.',
                  'Realizar reuniones breves para revisar avances y apoyar ante posibles dificultades.'
                ]
              ]
            },
            video: {
              titulo: 'Delegación y acompañamiento',
              url: 'assets/modulo1.3.3.mp4'
            },
          },
          {
            titulo: '¿Cómo delegar correctamente?',
            texto: 'Aplica estos 7 pasos cada vez que asignes una responsabilidad:',
            pasos: [
              'Identificar las actividades que se pueden delegar.',
              'Seleccionar a la persona adecuada según sus habilidades.',
              'Explicar claramente la tarea y el resultado esperado.',
              'Proporcionar los recursos y herramientas necesarios.',
              'Establecer tiempos y responsabilidades.',
              'Acompañar el proceso sin limitar la autonomía.',
              'Evaluar los resultados y brindar retroalimentación.'
            ],
            video: {
              titulo: 'Delegación y acompañamiento',
              url: 'assets/modulo1.3.4.mp4'
            }
          },
        ],
        actividad:
          'Identifica una tarea operativa de tu rutina que puedas delegar y redacta el acuerdo claro (responsable, recursos, entregable y fecha de seguimiento).',
        conclusion:
          'Has finalizado el curso de Liderazgo y Motivación. Aprueba este quiz para habilitar tu certificado.',
        quiz: [
          {
            pregunta: '1. ¿Qué es delegar funciones?',
            opciones: [
              'Evitar responsabilidades.',
              'Asignar todas las tareas a una sola persona.',
              'Realizar personalmente todas las actividades.',
              'Asignar responsabilidades según las capacidades de cada trabajador.'
            ],
            correcta: 3
          },
          {
            pregunta: '2. ¿Qué debe tener en cuenta un líder al delegar una actividad?',
            opciones: [
              'Las habilidades y capacidades del trabajador.',
              'Únicamente la antigüedad.',
              'Las preferencias personales del líder.',
              'La cantidad de personas disponibles sin considerar sus funciones.'
            ],
            correcta: 0
          },
          {
            pregunta: '3. ¿Qué significa acompañar a un trabajador?',
            opciones: [
              'Vigilarlo constantemente.',
              'Hacer todas sus actividades.',
              'Brindar orientación, apoyo y seguimiento.',
              'Evitar que tome decisiones.'
            ],
            correcta: 2
          },
          {
            pregunta: '4. ¿Cuál es un beneficio de delegar correctamente?',
            opciones: [
              'Aumentar los conflictos.',
              'Desarrollar habilidades y fortalecer la autonomía.',
              'Disminuir la comunicación.',
              'Generar dependencia del líder.'
            ],
            correcta: 1
          },
          {
            pregunta: '5. ¿Qué debe hacer el líder al finalizar una actividad delegada?',
            opciones: [
              'Ignorar los resultados.',
              'Asignar otra tarea inmediatamente.',
              'Evitar comentarios sobre el trabajo.',
              'Evaluar los resultados y brindar retroalimentación.'
            ],
            correcta: 3
          }
        ]
      }
    ]
  },

  {
    id: 'inteligencia-emocional',
    categoria: 'Bienestar y Desarrollo Personal',
    titulo: 'Inteligencia Emocional',
    modalidad: 'e-learning',
    descripcion:
      'Fortalecer la inteligencia emocional mediante el reconocimiento y comprensión de las emociones, el manejo del estrés y la frustración, y el desarrollo de la autorregulación emocional en el entorno laboral.',
      video: {
              titulo: 'Inteligencia Emocional',
              url: 'assets/modulo2.mp4'
            },
    modulos: [
      {
        id: 'ie-m1',
        numero: 'MÓDULO 1',
        titulo: 'Reconocimiento de emociones',
        duracion: '2 horas',
              video: {
              titulo: 'Inteligencia Emocional',
              url: 'assets/modulo2.1.1.mp4'
            },
        temas: [
          'Componentes de la inteligencia emocional',
          '¿Qué son las emociones y cuáles son los tipos principales?',
          'Cómo reconocer las emociones en el entorno laboral'
        ],
        conceptos: [
          {
            titulo: 'Componentes principales de la inteligencia emocional',
            texto:
              'La inteligencia emocional es la capacidad de reconocer, comprender y gestionar nuestras propias emociones, así como percibir e influir positivamente en las de los demás:',
            lista: [
              'Autoconciencia: identificar qué sientes, por qué surge y cómo influye en tus decisiones.',
              'Autorregulación: manejar impulsos y estados de ánimo de forma saludable sin reaccionar destructivamente.',
              'Motivación: orientar la energía emocional hacia metas, perseverancia y adaptación.',
              'Empatía: percibir y comprender las emociones, perspectivas y necesidades de otras personas.',
              'Habilidades sociales: comunicarse con claridad, resolver conflictos y construir relaciones efectivas.'
            ],
              video: {
              titulo: 'Inteligencia Emocional',
              url: 'assets/modulo2.1.2.mp4'
            },
          },
          {
            titulo: 'Tipos principales de emociones',
            texto:
              'Las emociones son reacciones psicofisiológicas naturales (respuesta física, pensamiento e impulso a la acción). No son buenas ni malas; todas cumplen una función adaptativa:',
            lista: [
              'Alegría: sensación de felicidad, satisfacción y entusiasmo.',
              'Tristeza: aparece ante pérdidas, decepciones o situaciones difíciles.',
              'Enojo: surge cuando sentimos frustración, injusticia o inconformidad.',
              'Miedo: nos alerta ante posibles peligros o situaciones desconocidas.',
              'Sorpresa: aparece ante acontecimientos inesperados.',
              'Asco: reacción de rechazo frente a algo desagradable.'
            ],
            video: {
              titulo: 'Inteligencia Emocional',
              url: 'assets/modulo2.1.3.mp4'
            },
          },
          {
            titulo: '¿Cómo reconocer nuestras emociones en el trabajo?',
            texto:
              'Identificar lo que sentimos mejora la convivencia y evita reacciones impulsivas frente a la presión:',
            pasos: [
              'Identifica lo que sientes: nombra con precisión la emoción que estás experimentando.',
              'Reconoce su origen: identifica qué situación provocó esa emoción.',
              'Observa tus reacciones: presta atención a tus pensamientos y sensaciones físicas.',
              'Acepta tus emociones: comprende que son naturales y cumplen una función.',
              'Expresa lo que sientes: comunica tus emociones de manera adecuada y respetuosa.'
            ],
            video: {
              titulo: 'Inteligencia Emocional',
              url: 'assets/modulo2.1.4.mp4'
            },
          }
        ],
        actividad:
          'Describe una situación laboral reciente de alta presión, identifica la emoción principal que sentiste, su señal física y cómo la gestionaste.',
        conclusion:
          'Reconocer lo que sientes es el primer paso para responder con consciencia en lugar de reaccionar por impulso.',
        quiz: [
          {
            pregunta: '1. ¿Qué es la inteligencia emocional?',
            opciones: [
              'Evitar expresar sentimientos.',
              'Reconocer, comprender y gestionar nuestras emociones y las de los demás.',
              'Controlar las emociones de los compañeros.',
              'Ignorar las situaciones difíciles.'
            ],
            correcta: 1
          },
          {
            pregunta: '2. ¿Cuál de las siguientes es una emoción básica?',
            opciones: [
              'Responsabilidad.',
              'Disciplina.',
              'Empatía.',
              'Alegría.'
            ],
            correcta: 3
          },
          {
            pregunta: '3. ¿Qué significa reconocer nuestras emociones?',
            opciones: [
              'Identificar lo que sentimos y comprender su origen.',
              'Ocultar nuestros sentimientos.',
              'Evitar hablar con los demás.',
              'Reaccionar sin pensar.'
            ],
            correcta: 0
          },
          {
            pregunta: '4. ¿Cómo podemos demostrar empatía en el trabajo?',
            opciones: [
              'Criticando las emociones de los demás.',
              'Ignorando las preocupaciones.',
              'Escuchando y comprendiendo las necesidades de los compañeros.',
              'Imponiendo nuestras opiniones.'
            ],
            correcta: 2
          },
          {
            pregunta: '5. ¿Por qué es importante reconocer las emociones?',
            opciones: [
              'Para evitar relacionarnos con otras personas.',
              'Para mejorar el autocontrol y las relaciones laborales.',
              'Para eliminar todas las emociones.',
              'Para evitar asumir responsabilidades.'
            ],
            correcta: 1
          }
        ]
      },
      {
        id: 'ie-m2',
        numero: 'MÓDULO 2',
        titulo: 'Manejo del estrés y frustración',
        duracion: '2 horas',
        video: {
              titulo: 'Menejo Del Estrés y Frustración',
              url: 'assets/modulo2.2.1.mp4'
            },
        temas: [
          'Diferencia entre estrés y frustración',
          'Herramientas para manejarlos en el ámbito laboral',
          'Recomendaciones prácticas de bienestar'
        ],
        conceptos: [
          {
            titulo: 'La diferencia entre estrés y frustración',
            texto:
              'Aunque suelen aparecer juntos, nacen de mecanismos distintos y requieren claridad mental para afrontarlos:',
            tabla: {
              columnas: ['Concepto', '¿Qué significa?', '¿Cuándo se presenta?'],
              filas: [
                [
                  'Estrés',
                  'Respuesta física y emocional cuando sentimos que las exigencias superan los recursos disponibles.',
                  'Ante el exceso de trabajo, la falta de tiempo, la presión constante o la incertidumbre.'
                ],
                [
                  'Frustración',
                  'Sensación de malestar, impotencia o enojo cuando no logramos lo que esperábamos.',
                  'Cuando algo no sale como planeábamos, encontramos obstáculos o no controlamos un resultado.'
                ]
              ]
            }
          },
          {
            titulo: 'Herramientas para manejarlos en el ámbito laboral',
            texto: 'Aplica estas ocho estrategias prácticas durante tu jornada:',
            tabla: {
              columnas: ['Herramienta', '¿Cómo aplicarla?'],
              filas: [
                ['Respiración consciente', 'Realizar respiraciones profundas para recuperar la calma en momentos de tensión.'],
                ['Organización del tiempo', 'Priorizar las actividades y establecer tiempos para evitar la sobrecarga laboral.'],
                ['Control emocional', 'Reconocer las emociones antes de reaccionar ante una situación difícil.'],
                ['Pensamiento positivo', 'Buscar soluciones y aprender de los errores sin enfocarse solo en los problemas.'],
                ['Pausas activas', 'Realizar pequeños descansos para reducir la tensión física y mental.'],
                ['Comunicación asertiva', 'Expresar las inconformidades y necesidades con respeto y claridad.'],
                ['Resolución de problemas', 'Analizar las dificultades y buscar alternativas para superar los obstáculos.'],
                ['Apoyo del equipo', 'Compartir las preocupaciones y solicitar ayuda cuando sea necesario.']
              ]
            },
            video: {
              titulo: 'Menejo Del Estrés y Frustración',
              url: 'assets/modulo2.2.3.mp4'
            },
          }
        ],
        actividad:
          'Elige tres herramientas de la tabla y define en qué momento del día las aplicarás durante tu jornada.',
        conclusion:
          'Manejar el estrés no significa eliminar los retos, sino mantener la claridad para responder de forma constructiva.',
        quiz: [
          {
            pregunta: '1. ¿Qué es el estrés laboral?',
            opciones: [
              'Una respuesta ante situaciones de presión o sobrecarga laboral.',
              'Una actitud de compañerismo.',
              'Una forma de motivación.',
              'Una herramienta de comunicación.'
            ],
            correcta: 0
          },
          {
            pregunta: '2. ¿Qué es la frustración?',
            opciones: [
              'Una sensación de satisfacción.',
              'Una forma de reconocimiento.',
              'Una reacción ante obstáculos que impiden alcanzar lo esperado.',
              'Una habilidad social.'
            ],
            correcta: 2
          },
          {
            pregunta: '3. ¿Qué herramienta ayuda a recuperar la calma en momentos de tensión?',
            opciones: [
              'Discutir con los compañeros.',
              'Respirar profundamente y realizar una pausa consciente.',
              'Ignorar todas las responsabilidades.',
              'Responder impulsivamente.'
            ],
            correcta: 1
          },
          {
            pregunta: '4. Si tienes muchas actividades pendientes, ¿qué deberías hacer?',
            opciones: [
              'Realizar todas al mismo tiempo.',
              'Ignorar las fechas de entrega.',
              'Evitar solicitar ayuda.',
              'Organizar las tareas y establecer prioridades.'
            ],
            correcta: 3
          },
          {
            pregunta: '5. ¿Cuál es el propósito de las pausas activas?',
            opciones: [
              'Reducir la tensión física y mental.',
              'Aumentar la carga laboral.',
              'Evitar la comunicación.',
              'Retrasar el cumplimiento de las actividades.'
            ],
            correcta: 0
          }
        ]
      },
      {
        id: 'ie-m3',
        numero: 'MÓDULO 3',
        titulo: 'Autorregulación emocional',
        duracion: '2 horas',
        temas: [
          'Estrategias de autorregulación emocional',
          'Pasos para manejar emociones en el trabajo',
          'Equilibrio y respuesta consciente'
        ],
        conceptos: [
          {
            titulo: 'Estrategias para la autorregulación emocional',
            texto:
              'La autorregulación permite controlar nuestras reacciones ante el estrés o los conflictos sin reprimir lo que sentimos:',
            lista: [
              'Control de pensamientos: evitar que las ideas negativas dominen y cambiar el enfoque. Ejemplo: ver una crítica laboral como una oportunidad de mejora.',
              'Reconsideración emocional: reinterpretar una situación desde una perspectiva constructiva. Ejemplo: asumir una tarea fallida como aprendizaje para la próxima vez.',
              'Distanciamiento emocional: tomar unos minutos de distancia antes de responder cuando algo nos altera, evitando que el conflicto escale.'
            ],
            video: {
              titulo: 'Menejo Del Estrés y Frustración',
              url: 'assets/modulo2.3.2.mp4'
            },
          },
          {
            titulo: 'Pasos para manejar las emociones en el ámbito laboral',
            texto: 'Ruta práctica para mantener la calma y comunicarte con respeto:',
            pasos: [
              'Identificar lo que sentimos y comprender qué situación lo provoca.',
              'Hacer una pausa: respirar profundamente antes de reaccionar.',
              'Analizar la situación: distinguir qué podemos controlar y qué soluciones existen.',
              'Controlar nuestras reacciones: evitar levantar la voz o decidir estando alterados.',
              'Comunicarnos asertivamente: expresar opiniones e inconformidades con respeto.',
              'Buscar soluciones enfocadas en resolver la dificultad.',
              'Aprender de cada experiencia e identificar oportunidades de mejora.'
            ],
            cita: '“Autorregularse no es esconder emociones, sino responder de manera consciente, equilibrada y respetuosa.”',

            video: {
              titulo: 'Menejo Del Estrés y Frustración',
              url: 'assets/modulo2.3.3.mp4'
            },
          }
        ],
        actividad:
          'Redacta un ejemplo real de reconsideración emocional: transforma un pensamiento negativo frente a un obstáculo laboral en una frase orientada a la solución.',
        conclusion:
          'Has finalizado el curso de Inteligencia Emocional. Aprueba este quiz para desbloquear tu certificado.',
        quiz: [
          {
            pregunta: '1. ¿En qué consiste la estrategia de "distanciamiento emocional"?',
            opciones: [
              'En dejar de hablar definitivamente con los compañeros.',
              'En tomar unos minutos de distancia antes de responder cuando algo nos altera para analizarlo con tranquilidad.',
              'En negar que estamos molestos o estresados.'
            ],
            correcta: 1
          },
          {
            pregunta: '2. ¿Autorregularse emocionalmente significa reprimir o esconder las emociones?',
            opciones: [
              'Sí, nunca se deben expresar emociones en el trabajo.',
              'No; significa comprenderlas y manejarlas para responder de forma consciente y respetuosa.',
              'Solo aplica para los líderes de área.'
            ],
            correcta: 1
          }
        ]
      }
    ]
  },

  {
    id: 'resolucion-conflictos',
    categoria: 'Convivencia y Trabajo en Equipo',
    titulo: 'Resolución de Conflictos en el Entorno Laboral',
    modalidad: 'e-learning',
    descripcion:
      'Fortalecer las habilidades para la resolución de conflictos mediante la identificación oportuna, la negociación, la mediación y el manejo adecuado de desacuerdos, promoviendo el diálogo y el respeto.',
    modulos: [
      {
        id: 'rc-m1',
        numero: 'MÓDULO 1',
        titulo: 'Identificación de conflictos laborales',
        duracion: '2 horas',
        temas: [
          'Tipos de conflictos laborales',
          'Principales causas y señales de alerta',
          'Cómo identificar un conflicto a tiempo'
        ],
        conceptos: [
          {
            titulo: 'Tipos de conflictos laborales',
            texto:
              'Un conflicto laboral es un desacuerdo entre dos o más trabajadores por diferencias de opiniones, intereses, responsabilidades o formas de trabajar:',
            tabla: {
              columnas: ['Tipo de conflicto', '¿En qué consiste?'],
              filas: [
                ['Interpersonales', 'Diferencias entre compañeros por actitudes u opiniones.'],
                ['Grupales', 'Desacuerdos entre equipos o áreas de trabajo.'],
                ['Organizacionales', 'Problemas relacionados con normas, decisiones o procedimientos.'],
                ['Por responsabilidades', 'Falta de claridad en las tareas asignadas.'],
                ['Por comunicación', 'Información incompleta o mal interpretada.']
              ]
            }
          },
          {
            titulo: '¿Cómo identificar un conflicto?',
            texto: 'Pasos para diagnosticar la situación con objetividad:',
            pasos: [
              'Observar qué está sucediendo sin prejuicios.',
              'Escuchar a las personas involucradas.',
              'Identificar la causa real del desacuerdo.',
              'Diferenciar los hechos comprobables de las suposiciones.',
              'Reconocer cómo afecta al equipo.',
              'Buscar posibles soluciones.'
            ]
          }
        ],
        actividad:
          'Analiza un desacuerdo cotidiano y separa 2 hechos objetivos de 2 suposiciones.',
        conclusion:
          'Identificar un conflicto a tiempo lo convierte en una oportunidad para mejorar procesos y fortalecer al equipo.',
        quiz: [
          {
            pregunta: '1. ¿Qué tipo de conflicto surge por la falta de claridad en las tareas asignadas?',
            opciones: [
              'Conflicto por responsabilidades',
              'Conflicto interpersonal',
              'Conflicto organizacional'
            ],
            correcta: 0
          },
          {
            pregunta: '2. Al analizar un conflicto laboral, ¿qué es fundamental diferenciar?',
            opciones: [
              'Quién tiene mayor jerarquía.',
              'Los hechos comprobables de las suposiciones.',
              'Los rumores de pasillo.'
            ],
            correcta: 1
          }
        ]
      },
      {
        id: 'rc-m2',
        numero: 'MÓDULO 2',
        titulo: 'Negociación y búsqueda de soluciones',
        duracion: '2 horas',
        temas: [
          'Principios de una negociación efectiva',
          'Etapas de la negociación',
          'Herramientas para encontrar soluciones'
        ],
        conceptos: [
          {
            titulo: 'Principios de una negociación efectiva',
            texto:
              'Negociar es dialogar con respeto para construir acuerdos que beneficien a las partes sin imponer opiniones:',
            tabla: {
              columnas: ['Principio', '¿Qué significa?'],
              filas: [
                ['Respeto', 'Valorar las opiniones de los demás.'],
                ['Escucha activa', 'Prestar atención sin interrumpir.'],
                ['Comunicación clara', 'Expresar ideas de manera respetuosa.'],
                ['Flexibilidad', 'Considerar diferentes alternativas.'],
                ['Imparcialidad', 'Escuchar a todas las partes sin favorecer a nadie.'],
                ['Cooperación', 'Trabajar juntos para encontrar soluciones.'],
                ['Compromiso', 'Cumplir los acuerdos establecidos.']
              ]
            }
          },
          {
            titulo: 'Etapas de una negociación',
            texto: 'Sigue esta ruta estructurada para construir acuerdos duraderos:',
            pasos: [
              'Preparación: identificar el problema y sus causas.',
              'Diálogo: escuchar las opiniones de los involucrados.',
              'Identificación de necesidades: comprender qué necesita cada persona.',
              'Propuestas: plantear posibles soluciones mediante lluvia de ideas.',
              'Acuerdos: elegir una alternativa realista que beneficie a las partes.',
              'Seguimiento: verificar que los compromisos se cumplan.'
            ],
            cita: '“Concéntrate en el problema y los intereses comunes, nunca en atacar a las personas.”'
          }
        ],
        actividad:
          'Plantea un acuerdo de trabajo (qué se hará, quién lo hará y cuándo se revisará) para resolver un cuello de botella entre dos puestos.',
        conclusion:
          'Una negociación basada en respeto y escucha activa fortalece las relaciones y organiza el trabajo.',
        quiz: [
          {
            pregunta: '1. ¿En qué debemos concentrarnos para encontrar soluciones durante una negociación?',
            opciones: [
              'En atacar a la persona con la que tenemos diferencias.',
              'En el problema y los intereses comunes.',
              'En imponer nuestra opinión a toda costa.'
            ],
            correcta: 1
          },
          {
            pregunta: '2. ¿Cuál es la última etapa de una negociación efectiva?',
            opciones: [
              'Seguimiento: verificar que los compromisos se cumplan.',
              'Preparación inicial.',
              'Discusión de culpables.'
            ],
            correcta: 0
          }
        ]
      },
      {
        id: 'rc-m3',
        numero: 'MÓDULO 3',
        titulo: 'Mediación y manejo de desacuerdos',
        duracion: '2 horas',
        temas: [
          'Diferencia entre negociación y mediación',
          'Pasos para realizar una mediación laboral',
          'Prevención de conflictos y canales formales'
        ],
        conceptos: [
          {
            titulo: 'Diferencia entre negociación y mediación',
            texto:
              'Cuando las partes no logran acordar directamente, interviene una tercera persona neutral e imparcial:',
            tabla: {
              columnas: ['Negociación', 'Mediación'],
              filas: [
                ['Las personas dialogan directamente.', 'Una persona neutral facilita el diálogo.'],
                ['No necesita un intermediario.', 'Cuenta con una persona mediadora.'],
                ['Los participantes proponen soluciones.', 'La persona mediadora ayuda a encontrar alternativas.'],
                ['Los participantes construyen el acuerdo.', 'Las partes deciden voluntariamente el acuerdo.']
              ]
            }
          },
          {
            titulo: 'Pasos para realizar una mediación y atención prioritaria',
            texto: 'Guía de actuación para el mediador y el equipo:',
            pasos: [
              'Preparar un espacio tranquilo y confidencial para conversar.',
              'Escuchar a cada persona sin interrupciones y mantener imparcialidad.',
              'Identificar el problema principal y las necesidades de cada parte.',
              'Facilitar el diálogo respetuoso y proponer alternativas.',
              'Establecer compromisos claros y verificar su cumplimiento.'
            ],
            cita: '“Importante: Los casos de acoso, violencia, amenazas o discriminación deben comunicarse a los canales formales de la empresa y recibir atención especializada; no deben tratarse como simples desacuerdos.”'
          }
        ],
        actividad:
          'Define dos acciones preventivas que implementarás en tu grupo de trabajo durante el próximo mes.',
        conclusion:
          'Has finalizado el curso de Resolución de Conflictos. Aprueba este quiz para obtener tu certificado.',
        quiz: [
          {
            pregunta: '1. ¿Cuál es la principal diferencia entre negociación y mediación?',
            opciones: [
              'En la mediación interviene una tercera persona neutral que facilita el diálogo sin imponer decisiones.',
              'En la negociación siempre interviene un juez.',
              'No existe ninguna diferencia entre ambas.'
            ],
            correcta: 0
          },
          {
            pregunta: '2. ¿Cómo deben manejarse los casos de acoso, violencia, amenazas o discriminación?',
            opciones: [
              'Como un simple desacuerdo cotidiano entre compañeros.',
              'Comunicándolos a los canales formales de la empresa para que reciban atención especializada.',
              'Ignorándolos para evitar tensión.'
            ],
            correcta: 1
          }
        ]
      }
    ]
  }
];

const PORTAL_ANEXOS = [
  {
    id: 'diagnostico',
    titulo: 'Instrumento Diagnóstico de Necesidades',
    botonTipo: 'dark',
    codigo: 'FOR-CAP-01',
    resumen:
      'Herramienta estructurada para identificar brechas de conocimiento técnico y de habilidades humanas (Liderazgo, Inteligencia Emocional y Resolución de Conflictos) por área.',
    puntos: [
      'Evaluación por cargo y nivel de criticidad operativa.',
      'Priorización trimestral de temas para líderes y equipos.',
      'Consolidación de solicitudes de capacitación.'
    ]
  },
  {
    id: 'politicas',
    titulo: 'Políticas de Capacitación',
    botonTipo: 'cyan',
    codigo: 'POL-CAP-02',
    resumen:
      'Lineamientos institucionales de VATOHA Ingeniería S.A.S. que garantizan el acceso equitativo a la formación continua y la certificación interna.',
    puntos: [
      'Cobertura del 100% del personal vinculado y en inducción.',
      'Asignación de espacios protegidos para formación virtual y presencial.',
      'Evaluación de eficacia y transferencia al puesto de trabajo.'
    ]
  },
  {
    id: 'normograma',
    titulo: 'Normograma de Capacitación',
    botonTipo: 'cyan',
    codigo: 'MAT-LEG-03',
    resumen:
      'Matriz de requisitos legales y técnicos aplicables en Seguridad y Salud en el Trabajo (Decreto 1072 de 2015, Resolución 0312) y bienestar laboral.',
    puntos: [
      'Inducción y reinducción anual obligatoria.',
      'Formación en convivencia laboral, liderazgo y prevención psicosocial.',
      'Actualización periódica según cambios normativos.'
    ]
  },
  {
    id: 'flujograma',
    titulo: 'Flujograma y Matriz de Capacitación',
    botonTipo: 'dark',
    codigo: 'PRO-CAP-04',
    resumen:
      'Secuencia paso a paso desde la detección de necesidades hasta la evaluación de eficacia y archivo de certificados.',
    puntos: [
      '1. Diagnóstico → 2. Planeación y cronograma → 3. Ejecución.',
      '4. Registro de asistencia y evaluación → 5. Certificación.',
      'Matriz cruzada de cursos obligatorios y complementarios por rol.'
    ]
  },
  {
    id: 'cronograma',
    titulo: 'Cronograma de Capacitación',
    botonTipo: 'cyan',
    codigo: 'CRO-CAP-05',
    resumen:
      'Planificación anual por trimestres con intensidad horaria, modalidad e-learning y responsables de ejecución.',
    puntos: [
      'Ciclo 1: Liderazgo, Motivación y Delegación Efectiva.',
      'Ciclo 2: Inteligencia Emocional y Autorregulación.',
      'Ciclo 3: Resolución de Conflictos, Negociación y Mediación.'
    ]
  },
  {
    id: 'cartilla',
    titulo: 'Cartilla Cursos Complementarios',
    botonTipo: 'cyan',
    codigo: 'CAR-CAP-06',
    resumen:
      'Guía rápida de programas disponibles en modalidad virtual 24/7 para el fortalecimiento del talento humano.',
    puntos: [
      'Liderazgo positivo y toma de decisiones responsables.',
      'Reconocimiento emocional y manejo del estrés.',
      'Comunicación asertiva y mediación laboral.'
    ]
  }
];