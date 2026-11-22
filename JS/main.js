document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_DONE = 'vatoha_portal_done_v4';
  const STORAGE_USER = 'vatoha_portal_user_v4';

  let completedModules = JSON.parse(localStorage.getItem(STORAGE_DONE) || '{}');
  let userProfile = JSON.parse(localStorage.getItem(STORAGE_USER) || '{"nombre":""}');
  let currentCourse = null;
  let currentModuleIndex = 0;

  const navButtons = document.querySelectorAll('[data-nav]');
  const views = {
    inicio: document.getElementById('view-inicio'),
    cursos: document.getElementById('view-cursos'),
    anexos: document.getElementById('view-anexos')
  };

  const coursesCatalog = document.getElementById('courses-catalog');
  const courseDetailView = document.getElementById('course-detail-view');
  const moduleLessonView = document.getElementById('module-lesson-view');

  const modal = document.getElementById('portal-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Regla de desbloqueo progresivo
  function isModuleUnlocked(course, modIndex) {
    if (modIndex === 0) return true;
    const prevModule = course.modulos[modIndex - 1];
    return Boolean(prevModule && completedModules[prevModule.id]);
  }

  function isCourseCompleted(course) {
    return course.modulos.every((m) => Boolean(completedModules[m.id]));
  }

  // 1. NAVEGACIÓN ENTRE VISTAS
  function switchView(viewName) {
    Object.entries(views).forEach(([key, section]) => {
      if (!section) return;
      const isTarget = key === viewName;
      section.hidden = !isTarget;
      section.classList.toggle('active', isTarget);
    });

    document.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.nav === viewName);
    });

    if (viewName === 'cursos') {
      showCoursesSubView('catalog');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = btn.dataset.nav;
      if (!target || !views[target]) return;
      e.preventDefault();
      switchView(target);
    });
  });

  function showCoursesSubView(sub) {
    coursesCatalog.hidden = sub !== 'catalog';
    courseDetailView.hidden = sub !== 'detail';
    moduleLessonView.hidden = sub !== 'lesson';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 2. CATÁLOGO DE CURSOS
  function updateCounters() {
    const totalCourses = document.getElementById('total-courses-count');
    const totalCompleted = document.getElementById('total-completed-count');
    if (totalCourses) totalCourses.textContent = PORTAL_CURSOS.length;
    if (totalCompleted) {
      totalCompleted.textContent = Object.values(completedModules).filter(Boolean).length;
    }
  }

  function renderCoursesCatalog() {
    const container = document.getElementById('course-rows');
    if (!container) return;

    container.innerHTML = PORTAL_CURSOS.map((curso) => {
      const isVirtual = curso.modalidad === 'e-learning';
      const doneCount = curso.modulos.filter((m) => completedModules[m.id]).length;
      return `
        <article class="course-row-item" data-open-course="${curso.id}" tabindex="0" role="button">
          <div>
            <h3 class="course-row-title">${curso.titulo}</h3>
            <span class="course-row-hint">Haga click 👆 • ${doneCount}/${curso.modulos.length} módulos aprobados</span>
          </div>
          <span class="course-row-arrow" aria-hidden="true">────────►</span>
          <span class="modality-pill ${isVirtual ? 'elearning' : 'presencial'}">${curso.modalidad}</span>
        </article>
      `;
    }).join('');

    container.querySelectorAll('[data-open-course]').forEach((row) => {
      const open = () => openCourseDetail(row.dataset.openCourse);
      row.addEventListener('click', open);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });

    updateCounters();
  }



 // 3. DETALLE DEL CURSO Y CANDADOS POR MÓDULO
  function buildVideoPlayerHtml(videoObj, defaultTitle) {
    if (!videoObj || !videoObj.url) return '';

    const rawUrl = videoObj.url.trim();
    const titulo = videoObj.titulo || defaultTitle;
    const ytMatch = rawUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );

    if (ytMatch && ytMatch[1]) {
      return `
        <div class="lesson-video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/${ytMatch[1]}"
            title="${titulo}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      `;
    }

    return `
      <div class="lesson-video-wrapper">
        <video controls preload="metadata">
          <source src="${rawUrl}" type="video/mp4">
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
    `;
  }

  function renderModuleVideo(mod) {
    if (!mod.video || !mod.video.url) return '';
    const tituloVideo = mod.video.titulo || `Video del ${mod.numero}`;
    return `
      <article class="lesson-concept-card lesson-video-card">
        <span class="mini-pill">MATERIAL AUDIOVISUAL</span>
        <h4>${tituloVideo}</h4>
        ${buildVideoPlayerHtml(mod.video, tituloVideo)}
      </article>
    `;
  }

  function openCourseDetail(courseId) {
    currentCourse = PORTAL_CURSOS.find((c) => c.id === courseId);
    if (!currentCourse) return;

    const doneCount = currentCourse.modulos.filter((m) => completedModules[m.id]).length;
    const pct = Math.round((doneCount / currentCourse.modulos.length) * 100);

    document.getElementById('cd-category').textContent = currentCourse.categoria;
    const cdTitleEl = document.getElementById('cd-title');
    cdTitleEl.textContent = currentCourse.titulo;

    // Crea el recuadro del video justo debajo del título y encima de Progreso
    let cdVideoBox = document.getElementById('cd-video-box');
    if (!cdVideoBox && cdTitleEl) {
      cdVideoBox = document.createElement('div');
      cdVideoBox.id = 'cd-video-box';
      cdVideoBox.className = 'course-intro-video';
      cdTitleEl.insertAdjacentElement('afterend', cdVideoBox);
    }

    if (cdVideoBox) {
      if (currentCourse.video && currentCourse.video.url) {
        cdVideoBox.innerHTML = buildVideoPlayerHtml(currentCourse.video, currentCourse.titulo);
        cdVideoBox.hidden = false;
      } else {
        cdVideoBox.innerHTML = '';
        cdVideoBox.hidden = true;
      }
    }

    document.getElementById('cd-progress').textContent = `${pct}% (${doneCount}/${currentCourse.modulos.length})`;
    document.getElementById('cd-description').textContent = currentCourse.descripcion;

    const listEl = document.getElementById('cd-modules-list');
    listEl.innerHTML = currentCourse.modulos
      .map((mod, idx) => {
        const isDone = Boolean(completedModules[mod.id]);
        const unlocked = isModuleUnlocked(currentCourse, idx);
        const stateClass = isDone ? 'is-done' : unlocked ? '' : 'is-locked';
        const statusLabel = isDone
          ? 'Aprobado ✓'
          : unlocked
          ? 'Disponible 👆'
          : `🔒 Bloqueado (Aprueba ${currentCourse.modulos[idx - 1].numero})`;

        return `
          <div class="module-row-card ${!unlocked ? 'row-locked' : ''}">
            <button type="button" class="module-pill-trigger ${stateClass}" data-open-module="${idx}" ${!unlocked ? 'aria-disabled="true"' : ''}>
              ${mod.numero}
              <small>${statusLabel}</small>
            </button>
            <div class="module-topics-preview">
              <h4>${mod.titulo}</h4>
              <ul>
                ${mod.temas.map((t) => `<li>${t}</li>`).join('')}
              </ul>
              <p class="lock-warning-msg" id="lock-msg-${idx}" hidden>
                ⚠️ Debes aprobar el quiz del <strong>${idx > 0 ? currentCourse.modulos[idx - 1].numero : ''}</strong> para desbloquear este módulo.
              </p>
            </div>
          </div>
        `;
      })
      .join('');

    listEl.querySelectorAll('[data-open-module]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.openModule);
        if (!isModuleUnlocked(currentCourse, idx)) {
          const warn = document.getElementById(`lock-msg-${idx}`);
          if (warn) warn.hidden = false;
          return;
        }
        openModuleLesson(idx);
      });
    });

    showCoursesSubView('detail');
  }

  document.getElementById('back-to-catalog')?.addEventListener('click', () => {
    renderCoursesCatalog();
    showCoursesSubView('catalog');
  });

  // 4. LECCIÓN DEL MÓDULO + QUIZ OBLIGATORIO
  function renderConceptExtras(c) {
    let html = '';

    if (Array.isArray(c.lista) && c.lista.length) {
      html += `<ul class="lesson-bullets">${c.lista.map((item) => `<li>${item}</li>`).join('')}</ul>`;
    }

    if (Array.isArray(c.pasos) && c.pasos.length) {
      html += `<ol class="lesson-steps">${c.pasos.map((step) => `<li>${step}</li>`).join('')}</ol>`;
    }

    if (c.tabla && Array.isArray(c.tabla.columnas) && Array.isArray(c.tabla.filas)) {
      html += `
        <div class="lesson-table-wrap">
          <table class="lesson-table">
            <thead>
              <tr>${c.tabla.columnas.map((col) => `<th>${col}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${c.tabla.filas
                .map((fila) => `<tr>${fila.map((celda) => `<td>${celda}</td>`).join('')}</tr>`)
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    return html;
  }

  function syncFinalStepsLock() {
    const grid = document.getElementById('four-steps-grid');
    const note = document.getElementById('steps-lock-note');
    if (!grid || !note || !currentCourse) return;

    const allDone = isCourseCompleted(currentCourse);
    grid.classList.toggle('steps-disabled', !allDone);
    note.textContent = allDone
      ? '¡Has aprobado todos los módulos! Completa estos 3 pasos para generar tu certificado:'
      : '🔒 Aprueba el quiz de todos los módulos de este curso para desbloquear la encuesta, asistencia y certificado.';
  }

  function renderModuleQuiz(mod, modIndex) {
    const container = document.getElementById('ml-quiz-container');
    if (!container) return;

    const isDone = Boolean(completedModules[mod.id]);
    const hasNext = modIndex + 1 < currentCourse.modulos.length;
    const nextLabel = hasNext
      ? `Continuar al ${currentCourse.modulos[modIndex + 1].numero} →`
      : 'Ir a generar mi Certificado 🎖️';

    container.innerHTML = `
      <div class="quiz-box-header">
        <span class="mini-pill">QUIZ OBLIGATORIO • ${mod.numero}</span>
        <h3>Evaluación de comprensión para avanzar</h3>
        <p>Responde correctamente todas las preguntas para desbloquear ${hasNext ? 'el siguiente módulo' : 'la certificación del curso'}.</p>
      </div>

      <form id="module-quiz-form" class="module-quiz-form">
        ${mod.quiz
          .map(
            (q, qIdx) => `
          <div class="quiz-question-block" data-q-index="${qIdx}">
            <p class="quiz-q-title">${q.pregunta}</p>
            <div class="quiz-options">
              ${q.opciones
                .map(
                  (opt, oIdx) => `
                <label class="quiz-option-label">
                  <input type="radio" name="q_${qIdx}" value="${oIdx}" ${isDone && oIdx === q.correcta ? 'checked' : ''} required>
                  <span>${opt}</span>
                </label>
              `
                )
                .join('')}
            </div>
          </div>
        `
          )
          .join('')}

        <div class="quiz-actions-row">
          <button type="submit" class="complete-module-btn ${isDone ? 'is-done' : ''}" id="submit-module-quiz">
            ${isDone ? 'Quiz aprobado ✓' : 'Validar respuestas y desbloquear ✓'}
          </button>

          <button type="button" class="next-module-btn" id="go-next-module-btn" ${isDone ? '' : 'hidden'}>
            ${nextLabel}
          </button>
        </div>

        <p class="quiz-result-msg" id="module-quiz-feedback" role="status" aria-live="polite">
          ${isDone ? '✅ ¡Módulo aprobado! Ya puedes avanzar.' : ''}
        </p>
      </form>
    `;

    const nextBtn = document.getElementById('go-next-module-btn');
    nextBtn.addEventListener('click', () => {
      if (hasNext) {
        openModuleLesson(modIndex + 1);
      } else {
        document.getElementById('final-steps-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.getElementById('module-quiz-form').addEventListener('submit', (e) => {
      e.preventDefault();
      let allCorrect = true;

      mod.quiz.forEach((q, qIdx) => {
        const block = container.querySelector(`[data-q-index="${qIdx}"]`);
        const selected = container.querySelector(`input[name="q_${qIdx}"]:checked`);
        const isRight = selected && Number(selected.value) === q.correcta;

        block.classList.toggle('q-error', !isRight);
        block.classList.toggle('q-ok', isRight);
        if (!isRight) allCorrect = false;
      });

      const feedback = document.getElementById('module-quiz-feedback');
      const submitBtn = document.getElementById('submit-module-quiz');

      if (allCorrect) {
        completedModules[mod.id] = true;
        localStorage.setItem(STORAGE_DONE, JSON.stringify(completedModules));
        updateCounters();
        syncFinalStepsLock();

        submitBtn.classList.add('is-done');
        submitBtn.textContent = 'Quiz aprobado ✓';
        nextBtn.hidden = false;
        feedback.className = 'quiz-result-msg success';
        feedback.textContent = hasNext
          ? `✅ ¡Excelente! Aprobaste el quiz y desbloqueaste el ${currentCourse.modulos[modIndex + 1].numero}.`
          : '✅ ¡Felicitaciones! Aprobaste todos los módulos del curso. Ya puedes generar tu certificado abajo.';
      } else {
        feedback.className = 'quiz-result-msg error';
        feedback.textContent = '❌ Revisa las preguntas marcadas en rojo e inténtalo de nuevo para poder avanzar.';
      }
    });
  }

function renderModuleVideo(mod) {
    if (!mod.video || !mod.video.url) return '';

    const rawUrl = mod.video.url.trim();
    const tituloVideo = mod.video.titulo || `Video del ${mod.numero}`;
    let playerHtml = '';

    // Detecta automáticamente si es un enlace de YouTube (normal, corto o embed)
    const ytMatch = rawUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );

    if (ytMatch && ytMatch[1]) {
      playerHtml = `
        <div class="lesson-video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/${ytMatch[1]}"
            title="${tituloVideo}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      `;
    } else {
      // Si es un archivo local (ej. assets/video-modulo1.mp4)
      playerHtml = `
        <div class="lesson-video-wrapper">
          <video controls preload="metadata">
            <source src="${rawUrl}" type="video/mp4">
            Tu navegador no soporta la reproducción de video HTML5.
          </video>
        </div>
      `;
    }

    return `
      <article class="lesson-concept-card lesson-video-card">
        <span class="mini-pill">MATERIAL AUDIOVISUAL</span>
        <h4>${tituloVideo}</h4>
        ${playerHtml}
      </article>
    `;
  }

function openModuleLesson(modIndex) {
    if (!currentCourse) return;
    if (!isModuleUnlocked(currentCourse, modIndex)) return;

    currentModuleIndex = modIndex;
    const mod = currentCourse.modulos[modIndex];
    if (!mod) return;

    document.getElementById('ml-number').textContent = mod.numero;
    document.getElementById('ml-course-name').textContent = currentCourse.titulo;
    document.getElementById('ml-duration').textContent = `Duración: ${mod.duracion}`;
    document.getElementById('ml-title').textContent = mod.titulo;

    document.getElementById('ml-cards').innerHTML =
      renderModuleVideo(mod) +
      mod.conceptos
        .map(
          (c) => `
          <article class="lesson-concept-card">
            <h4>${c.titulo}</h4>
            <p>${c.texto}</p>
            ${renderConceptExtras(c)}
            ${c.video ? buildVideoPlayerHtml(c.video, c.titulo) : ''}
            ${c.cita ? `<blockquote class="lesson-quote">${c.cita}</blockquote>` : ''}
          </article>
        `
        )
        .join('');

    document.getElementById('ml-activity').innerHTML = `
      <p><strong>Consigna práctica:</strong> ${mod.actividad}</p>
      <textarea class="activity-notes" placeholder="Escribe aquí tus notas o respuestas de la actividad..."></textarea>
    `;

    document.getElementById('ml-conclusion').textContent = mod.conclusion;
    document.getElementById('ml-download-btn').onclick = () => descargarFicha(currentCourse, mod);

    renderModuleQuiz(mod, modIndex);
    syncFinalStepsLock();
    showCoursesSubView('lesson');
  }

  document.getElementById('back-to-course')?.addEventListener('click', () => {
    if (currentCourse) openCourseDetail(currentCourse.id);
  });

  function descargarFicha(course, mod) {
    const conceptosHtml = mod.conceptos
      .map((c) => {
        let extra = '';
        if (c.lista) extra += `<ul>${c.lista.map((i) => `<li>${i}</li>`).join('')}</ul>`;
        if (c.pasos) extra += `<ol>${c.pasos.map((i) => `<li>${i}</li>`).join('')}</ol>`;
        if (c.tabla) {
          extra += `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;margin:10px 0;font-size:13px;">
            <thead><tr style="background:#0f5c5c;color:#fff;">${c.tabla.columnas.map((col) => `<th>${col}</th>`).join('')}</tr></thead>
            <tbody>${c.tabla.filas.map((f) => `<tr>${f.map((td) => `<td>${td}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>`;
        }
        return `<div class="box"><h3>${c.titulo}</h3><p>${c.texto}</p>${extra}${c.cita ? `<em>${c.cita}</em>` : ''}</div>`;
      })
      .join('');

    const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${mod.numero} - ${mod.titulo}</title>
<style>body{font-family:Arial,sans-serif;max-width:780px;margin:36px auto;padding:0 20px;color:#102a2e;line-height:1.6}
.top{border-bottom:3px solid #0f5c5c;padding-bottom:12px;margin-bottom:20px}.tag{color:#0f5c5c;font-weight:bold;font-size:13px}
.box{background:#eef9f6;padding:14px 18px;border-left:4px solid #38c6d9;margin:14px 0;border-radius:6px}</style></head>
<body><div class="top"><div class="tag">VATOHA INGENIERÍA S.A.S. • NIT 901.479.098-6</div>
<h1>${mod.numero}: ${mod.titulo}</h1><p>Curso: ${course.titulo} (${mod.duracion})</p></div>
${conceptosHtml}
<h3>Actividad Práctica</h3><p>${mod.actividad}</p>
<h3>Conclusión</h3><p>${mod.conclusion}</p></body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VATOHA-${mod.id}-material.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 5. VISTA ANEXOS
  function renderAnexos() {
    const grid = document.getElementById('anexos-grid');
    if (!grid) return;

    grid.innerHTML = PORTAL_ANEXOS.map(
      (anx) => `
      <article class="anexo-row">
        <strong>${anx.titulo}</strong>
        <span aria-hidden="true">─────►</span>
        <button type="button" class="anexo-btn ${anx.botonTipo === 'dark' ? 'dark' : ''}" data-open-anexo="${anx.id}">
          Haga click
        </button>
      </article>
    `
    ).join('');

    grid.querySelectorAll('[data-open-anexo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const anx = PORTAL_ANEXOS.find((a) => a.id === btn.dataset.openAnexo);
        if (!anx) return;
        openModal(
          `${anx.codigo} • ${anx.titulo}`,
          `
          <p>${anx.resumen}</p>
          <ul>${anx.puntos.map((p) => `<li>${p}</li>`).join('')}</ul>
          <p><small>Documento institucional de <strong>VATOHA Ingeniería S.A.S.</strong> (NIT 901.479.098-6).</small></p>
          <button type="button" class="complete-module-btn" onclick="window.print()">Imprimir / Guardar PDF 🖨️</button>
        `
        );
      });
    });
  }

  // 6. MODALES DE CIERRE (Encuesta, Asistencia, Certificado)
  function openModal(title, htmlContent) {
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlContent;
    modal.hidden = false;
  }

  function closeModal() {
    modal.hidden = true;
  }

  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', closeModal);

  document.querySelectorAll('[data-step-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (currentCourse && !isCourseCompleted(currentCourse) && btn.closest('#four-steps-grid')) {
        return;
      }

      const type = btn.dataset.stepModal;
      const courseName = currentCourse ? currentCourse.titulo : 'Programa de Formación Empresarial';

      if (type === 'encuesta') {
        openModal(
          '1. Encuesta de Satisfacción',
          `
          <p>¿Cómo calificas la claridad del contenido y las herramientas prácticas de <strong>${courseName}</strong>?</p>
          <div style="display:flex;gap:12px;margin:16px 0;flex-wrap:wrap;">
            <button type="button" class="pill-btn" data-rate="Excelente">😄 Excelente</button>
            <button type="button" class="pill-btn" data-rate="Bueno">🙂 Bueno</button>
            <button type="button" class="pill-btn" data-rate="Por mejorar">😐 Por mejorar</button>
          </div>
          <p id="survey-msg" style="font-weight:700;color:#0f5c5c;"></p>
        `
        );
        modalBody.querySelectorAll('[data-rate]').forEach((b) => {
          b.addEventListener('click', () => {
            document.getElementById('survey-msg').textContent = `¡Gracias por tu calificación (${b.dataset.rate})! Tu opinión nos ayuda a mejorar.`;
          });
        });
      }

      if (type === 'asistencia') {
        const hoy = new Date().toISOString().split('T')[0];
        openModal(
          '2. Registro de Asistencia - Capacitación',
          `
          <form id="attendance-form">
            <div class="modal-field">
              <label>Fecha</label>
              <input type="date" value="${hoy}" required>
            </div>
            <div class="modal-field">
              <label>Nombre completo (se usará en tu certificado)</label>
              <input type="text" id="att-fullname" value="${userProfile.nombre || ''}" placeholder="Ej. Ángela Ducuara" required>
            </div>
            <div class="modal-field">
              <label>Cargo o Empresa</label>
              <input type="text" placeholder="Ej. VATOHA Ingeniería S.A.S." required>
            </div>
            <button type="submit" class="complete-module-btn">Registrar asistencia ✓</button>
            <p id="att-msg" style="font-weight:700;color:#0f5c5c;margin-top:12px;"></p>
          </form>
        `
        );
        document.getElementById('attendance-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const fullName = document.getElementById('att-fullname').value.trim();
          userProfile.nombre = fullName;
          localStorage.setItem(STORAGE_USER, JSON.stringify(userProfile));
          document.getElementById('att-msg').textContent = `¡Asistencia registrada para ${fullName}! Ahora abre el paso 3 para ver tu certificado.`;
        });
      }

      if (type === 'certificado') {
        const nombreCert = userProfile.nombre || 'Participante VATOHA';
        openModal(
          '3. Certificado de Reconocimiento',
          `
          <div class="cert-preview">
            <p style="margin:0;font-weight:800;color:#0f5c5c;letter-spacing:.08em;">VATOHA INGENIERÍA S.A.S. • NIT 901.479.098-6</p>
            <h4>CERTIFICADO DE RECONOCIMIENTO</h4>
            <p style="margin:4px 0;">OTORGADO A:</p>
            <div class="cert-name" id="cert-display-name">${nombreCert}</div>
            <p>Por su participación y compromiso al completar satisfactoriamente el curso:<br><strong>${courseName}</strong></p>
          </div>
          <div class="modal-field" style="margin-top:16px;">
            <label>Editar nombre en el certificado:</label>
            <input type="text" id="cert-edit-input" value="${nombreCert}">
          </div>
          <button type="button" class="complete-module-btn" onclick="window.print()">Imprimir / Guardar Certificado en PDF 🖨️</button>
        `
        );
        document.getElementById('cert-edit-input')?.addEventListener('input', (e) => {
          const val = e.target.value.trim() || 'Participante VATOHA';
          userProfile.nombre = val;
          localStorage.setItem(STORAGE_USER, JSON.stringify(userProfile));
          document.getElementById('cert-display-name').textContent = val;
        });
      }
    });
  });

  renderCoursesCatalog();
  renderAnexos();
});