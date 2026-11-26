document.addEventListener('DOMContentLoaded', () => {
  const SESSION_KEY = 'vatoha_active_session_v1';

  // Estado activo de la sesión (solo guarda cédula/nombre activo; el progreso real vive en Supabase)
  let activeSession = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  let activeInscripcion = null;
  let activeProgreso = []; // Lista de progreso_modulos desde Supabase
  let activeCertificado = null;
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

  // =========================================================================
  // 0. UTILIDADES DE SESIÓN Y ESTADO DESDE SUPABASE
  // =========================================================================
  function saveSessionMeta(meta) {
    activeSession = meta;
    if (meta) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(meta));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
    renderSessionBar();
  }

  function renderSessionBar() {
    const bar = document.getElementById('participant-session-bar');
    if (!bar) return;

    if (!activeSession || !activeSession.cedula) {
      bar.hidden = true;
      return;
    }

    bar.hidden = false;
    document.getElementById('session-user-name').textContent = activeSession.nombre;
    document.getElementById('session-user-cc').textContent = activeSession.cedula;

    const courseWrap = document.getElementById('session-course-wrap');
    const courseSep = document.getElementById('session-course-sep');
    if (currentCourse) {
      courseWrap.hidden = false;
      courseSep.hidden = false;
      document.getElementById('session-course-name').textContent = currentCourse.titulo;
    } else {
      courseWrap.hidden = true;
      courseSep.hidden = true;
    }
  }

  document.getElementById('btn-logout-participant')?.addEventListener('click', () => {
    saveSessionMeta(null);
    activeInscripcion = null;
    activeProgreso = [];
    activeCertificado = null;
    currentCourse = null;
    updateCounters();
    renderCoursesCatalog();
    showCoursesSubView('catalog');
  });

  function getModuleProgress(moduloId) {
    return activeProgreso.find((p) => p.modulo_id === moduloId) || null;
  }

  function isModuleApproved(moduloId) {
    const prog = getModuleProgress(moduloId);
    return Boolean(prog && prog.aprobado === true && Number(prog.mejor_nota) >= 3.0);
  }

  function isModuleUnlocked(course, modIndex) {
    if (!activeSession || !activeInscripcion) return false;
    if (modIndex === 0) return true;
    const prevMod = course.modulos[modIndex - 1];
    return Boolean(prevMod && isModuleApproved(prevMod.id));
  }

  function isCourseCompleted(course) {
    if (!course || !activeInscripcion) return false;
    return course.modulos.every((m) => isModuleApproved(m.id));
  }

  function formatDateCO(isoString) {
    if (!isoString) return new Date().toLocaleDateString('es-CO');
    return new Date(isoString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // =========================================================================
  // 1. NAVEGACIÓN ENTRE VISTAS
  // =========================================================================
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
    renderSessionBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // 2. MODAL DE REGISTRO OBLIGATORIO Y CONEXIÓN A SUPABASE
  // =========================================================================
  function openRegistrationModal(preselectedCourseId = '') {
    if (!isSupabaseConfigured()) {
      openModal(
        '⚠️ Configuración de Base de Datos Pendiente',
        `
        <p>Para habilitar el registro permanente de participantes, pega tu <strong>SUPABASE_URL</strong> y <strong>SUPABASE_ANON_KEY</strong> en el archivo <code>js/supabase-config.js</code>.</p>
        <p>Consulta las instrucciones de configuración en la guía de despliegue.</p>
      `
      );
      return;
    }

    const hoy = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const targetCourseId = preselectedCourseId || (activeSession && activeSession.cursoId) || PORTAL_CURSOS[0].id;

    openModal(
      'Registro Obligatorio de Participante',
      `
      <p style="margin-top:0;color:var(--muted);font-size:0.92rem;">
        Completa tus datos para iniciar el curso o recuperar tu avance guardado anteriormente con tu cédula.
      </p>
      <form id="participant-register-form">
        <div class="modal-field">
          <label for="reg-nombre">Nombre completo *</label>
          <input
            type="text"
            id="reg-nombre"
            value="${activeSession?.nombre || ''}"
            placeholder="Ej. Ángela María Ducuara"
            minlength="3"
            required
          >
        </div>

        <div class="modal-field">
          <label for="reg-cedula">Número de cédula (sin puntos ni espacios) *</label>
          <input
            type="text"
            id="reg-cedula"
            inputmode="numeric"
            pattern="[0-9]{5,12}"
            value="${activeSession?.cedula || ''}"
            placeholder="Ej. 1020456789"
            required
          >
        </div>

        <div class="modal-field">
          <label for="reg-fecha">Fecha de ingreso (automática)</label>
          <input type="text" id="reg-fecha" value="${hoy}" readonly style="background:#f3f7f7;color:var(--muted);">
        </div>

        <div class="modal-field">
          <label for="reg-curso">Curso que vas a realizar *</label>
          <select id="reg-curso" required>
            ${PORTAL_CURSOS.map(
              (c) => `<option value="${c.id}" ${c.id === targetCourseId ? 'selected' : ''}>${c.titulo}</option>`
            ).join('')}
          </select>
        </div>

        <p id="reg-error-msg" class="quiz-result-msg error" style="margin-bottom:12px;" hidden></p>

        <button type="submit" class="complete-module-btn" id="btn-submit-register" style="width:100%;">
          Ingresar al curso y cargar progreso →
        </button>
      </form>
    `
    );

    const cedulaInput = document.getElementById('reg-cedula');
    cedulaInput?.addEventListener('input', () => {
      cedulaInput.value = cedulaInput.value.replace(/[^0-9]/g, '');
    });

    document.getElementById('participant-register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('reg-error-msg');
      const submitBtn = document.getElementById('btn-submit-register');

      const nombre = document.getElementById('reg-nombre').value.trim();
      const cedula = document.getElementById('reg-cedula').value.replace(/[^0-9]/g, '');
      const cursoId = document.getElementById('reg-curso').value;
      const cursoObj = PORTAL_CURSOS.find((c) => c.id === cursoId);

      errEl.hidden = true;

      if (nombre.length < 3) {
        errEl.textContent = '⚠️ Por favor ingresa tu nombre completo.';
        errEl.hidden = false;
        return;
      }

      if (!/^\d{5,12}$/.test(cedula)) {
        errEl.textContent = '⚠️ Ingresa un número de cédula válido (entre 5 y 12 dígitos numéricos).';
        errEl.hidden = false;
        return;
      }

      if (!cursoObj) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Conectando con la base de datos...';

      try {
        await authenticateAndLoadCourse(cedula, nombre, cursoObj);
        closeModal();
        switchView('cursos');
        openCourseDetail(cursoObj.id);
      } catch (err) {
        errEl.textContent = `❌ ${err.message || 'No se pudo completar el registro. Verifica tu conexión.'}`;
        errEl.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Ingresar al curso y cargar progreso →';
      }
    });
  }

  async function authenticateAndLoadCourse(cedula, nombre, cursoObj) {
    const modulosPayload = cursoObj.modulos.map((m) => ({
      id: m.id,
      numero: m.numero,
      titulo: m.titulo
    }));

    const { data, error } = await supabaseClient.rpc('iniciar_sesion_capacitacion', {
      p_cedula: cedula,
      p_nombre: nombre,
      p_curso_id: cursoObj.id,
      p_curso_titulo: cursoObj.titulo,
      p_modulos: modulosPayload
    });

    if (error) throw error;

    activeInscripcion = data.inscripcion;
    activeProgreso = Array.isArray(data.progreso) ? data.progreso : [];
    activeCertificado = data.certificado || null;
    currentCourse = cursoObj;

    saveSessionMeta({
      cedula: data.participante.cedula,
      nombre: data.participante.nombre_completo,
      cursoId: cursoObj.id
    });

    updateCounters();
    renderCoursesCatalog();
  }

  document.getElementById('btn-open-register-direct')?.addEventListener('click', () => {
    openRegistrationModal();
  });

  // =========================================================================
  // 3. CATÁLOGO DE CURSOS
  // =========================================================================
  function updateCounters() {
    const totalCourses = document.getElementById('total-courses-count');
    const totalCompleted = document.getElementById('total-completed-count');
    if (totalCourses) totalCourses.textContent = PORTAL_CURSOS.length;
    if (totalCompleted) {
      const approvedCount = activeProgreso.filter((p) => p.aprobado && Number(p.mejor_nota) >= 3.0).length;
      totalCompleted.textContent = approvedCount;
    }
  }

  function renderCoursesCatalog() {
    const container = document.getElementById('course-rows');
    if (!container) return;

    container.innerHTML = PORTAL_CURSOS.map((curso) => {
      const isVirtual = curso.modalidad === 'e-learning';
      const isCurrentSessionCourse = activeInscripcion && activeInscripcion.curso_id === curso.id;
      const doneCount = isCurrentSessionCourse
        ? curso.modulos.filter((m) => isModuleApproved(m.id)).length
        : 0;

      const hintText = isCurrentSessionCourse
        ? `Sesión activa (${activeSession.nombre}) • ${doneCount}/${curso.modulos.length} módulos aprobados`
        : 'Haga click 👆 para registrarse o continuar con su cédula';

      return `
        <article class="course-row-item" data-open-course="${curso.id}" tabindex="0" role="button">
          <div>
            <h3 class="course-row-title">${curso.titulo}</h3>
            <span class="course-row-hint">${hintText}</span>
          </div>
          <span class="course-row-arrow" aria-hidden="true">────────►</span>
          <span class="modality-pill ${isVirtual ? 'elearning' : 'presencial'}">${curso.modalidad}</span>
        </article>
      `;
    }).join('');

    container.querySelectorAll('[data-open-course]').forEach((row) => {
      const handleSelect = async () => {
        const courseId = row.dataset.openCourse;
        const cursoObj = PORTAL_CURSOS.find((c) => c.id === courseId);
        if (!cursoObj) return;

        // Obligatorio: exigir registro previo antes de ingresar a cualquier curso
        if (!activeSession || !activeSession.cedula) {
          openRegistrationModal(courseId);
          return;
        }

        // Si ya tiene cédula activa pero cambia a otro curso, sincronizar inscripción en Supabase
        if (!activeInscripcion || activeInscripcion.curso_id !== courseId) {
          try {
            await authenticateAndLoadCourse(activeSession.cedula, activeSession.nombre, cursoObj);
            openCourseDetail(courseId);
          } catch (err) {
            openRegistrationModal(courseId);
          }
          return;
        }

        openCourseDetail(courseId);
      };

      row.addEventListener('click', handleSelect);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      });
    });

    updateCounters();
  }

  // =========================================================================
  // 4. REPRODUCTOR DE VIDEO Y DETALLE DEL CURSO
  // =========================================================================
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
    if (!activeSession || !activeSession.cedula) {
      openRegistrationModal(courseId);
      return;
    }

    currentCourse = PORTAL_CURSOS.find((c) => c.id === courseId);
    if (!currentCourse) return;

    const doneCount = currentCourse.modulos.filter((m) => isModuleApproved(m.id)).length;
    const pct = Math.round((doneCount / currentCourse.modulos.length) * 100);

    document.getElementById('cd-category').textContent = currentCourse.categoria;
    const cdTitleEl = document.getElementById('cd-title');
    cdTitleEl.textContent = currentCourse.titulo;

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

    const certShortcut = document.getElementById('cd-certificate-shortcut');
    if (certShortcut) {
      certShortcut.hidden = !isCourseCompleted(currentCourse);
    }

    const listEl = document.getElementById('cd-modules-list');
    listEl.innerHTML = currentCourse.modulos
      .map((mod, idx) => {
        const modProg = getModuleProgress(mod.id);
        const isDone = isModuleApproved(mod.id);
        const unlocked = isModuleUnlocked(currentCourse, idx);
        const notaText = modProg && Number(modProg.mejor_nota) > 0 ? ` • Nota: ${Number(modProg.mejor_nota).toFixed(1)}` : '';

        const stateClass = isDone ? 'is-done' : unlocked ? '' : 'is-locked';
        const statusLabel = isDone
          ? `Aprobado (${Number(modProg.mejor_nota).toFixed(1)}/5.0) ✓`
          : unlocked
          ? `Pendiente${notaText} 👆`
          : `🔒 Bloqueado (Aprueba ${currentCourse.modulos[idx - 1].numero})`;

        const badgeHtml = isDone
          ? `<span class="mod-status-badge approved">APROBADO • ${Number(modProg.mejor_nota).toFixed(1)}</span>`
          : unlocked
          ? `<span class="mod-status-badge pending">PENDIENTE${notaText}</span>`
          : `<span class="mod-status-badge locked">BLOQUEADO</span>`;

        return `
          <div class="module-row-card ${!unlocked ? 'row-locked' : ''}">
            <button type="button" class="module-pill-trigger ${stateClass}" data-open-module="${idx}" ${!unlocked ? 'aria-disabled="true"' : ''}>
              ${mod.numero}
              <small>${statusLabel}</small>
            </button>
            <div class="module-topics-preview">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
                <h4 style="margin:0;">${mod.titulo}</h4>
                ${badgeHtml}
              </div>
              <ul>
                ${mod.temas.map((t) => `<li>${t}</li>`).join('')}
              </ul>
              <p class="lock-warning-msg" id="lock-msg-${idx}" hidden>
                ⚠️ Debes aprobar la evaluación del <strong>${idx > 0 ? currentCourse.modulos[idx - 1].numero : ''}</strong> con nota mínima de <strong>3.0</strong> para desbloquear este módulo.
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

  // =========================================================================
  // 5. LECCIÓN DEL MÓDULO Y EVALUACIÓN AUTOMÁTICA (ESCALA 1.0 A 5.0)
  // =========================================================================
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

    if (c.video && c.video.url) {
      html += buildVideoPlayerHtml(c.video, c.titulo);
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
      ? '✅ ¡Has aprobado todos los módulos con nota ≥ 3.0! Completa estos 3 pasos para descargar tu certificado PDF:'
      : '🔒 Aprueba todos los módulos del curso (nota mínima 3.0 / 5.0 en cada uno) para habilitar la encuesta y el certificado PDF.';
  }

  function renderGradeScorecardHtml(res, modProg, hasNext, nextModuleNum) {
    const nota = Number(res.nota).toFixed(1);
    const aprobado = res.aprobado;
    const statusClass = aprobado ? 'score-approved' : 'score-failed';
    const tituloEstado = aprobado
      ? `¡MÓDULO APROBADO! (${nota} / 5.0)`
      : `MÓDULO REPROBADO (${nota} / 5.0)`;

    const mensajeDetalle = aprobado
      ? hasNext
        ? `Has alcanzado la nota mínima de 3.0. El <strong>${nextModuleNum}</strong> ya se encuentra desbloqueado.`
        : 'Has aprobado todos los módulos obligatorios del curso. Ya puedes generar y descargar tu <strong>Certificado PDF</strong>.'
      : 'La nota mínima para aprobar es <strong>3.0</strong>. Revisa el material del módulo y vuelve a presentar la evaluación.';

    return `
      <div class="grade-scorecard ${statusClass}">
        <div class="grade-scorecard-header">
          <span class="grade-badge">${aprobado ? 'APROBADO ✓' : 'REPROBADO ✕'}</span>
          <h4>${tituloEstado}</h4>
          <p>${mensajeDetalle}</p>
        </div>
        <div class="grade-metrics-grid">
          <div class="grade-metric-item">
            <span>Nota obtenida</span>
            <strong>${nota} / 5.0</strong>
          </div>
          <div class="grade-metric-item">
            <span>Correctas</span>
            <strong style="color:#0f766e;">${res.correctas} de ${res.total}</strong>
          </div>
          <div class="grade-metric-item">
            <span>Incorrectas</span>
            <strong style="color:#b42318;">${res.incorrectas}</strong>
          </div>
          <div class="grade-metric-item">
            <span>Desempeño</span>
            <strong>${res.porcentaje}%</strong>
          </div>
          <div class="grade-metric-item">
            <span>Intento N°</span>
            <strong>#${res.numero_intento}</strong>
          </div>
        </div>
      </div>
    `;
  }

  function renderModuleQuiz(mod, modIndex) {
    const container = document.getElementById('ml-quiz-container');
    if (!container) return;

    const modProg = getModuleProgress(mod.id);
    const isDone = isModuleApproved(mod.id);
    const hasNext = modIndex + 1 < currentCourse.modulos.length;
    const nextModule = hasNext ? currentCourse.modulos[modIndex + 1] : null;
    const nextLabel = hasNext
      ? `Continuar al ${nextModule.numero} →`
      : 'Ir a descargar mi Certificado PDF 🎖️';

    const previousSavedBanner =
      modProg && Number(modProg.intentos_totales) > 0
        ? `
        <div class="saved-progress-strip ${isDone ? 'is-ok' : 'is-warn'}">
          <span>
            Estado guardado en la nube: <strong>${isDone ? 'APROBADO' : 'PENDIENTE DE APROBACIÓN'}</strong> •
            Mejor nota: <strong>${Number(modProg.mejor_nota).toFixed(1)} / 5.0</strong> •
            Intentos realizados: <strong>${modProg.intentos_totales}</strong>
          </span>
        </div>
      `
        : '';

    container.innerHTML = `
      <div class="quiz-box-header">
        <span class="mini-pill">EVALUACIÓN OBLIGATORIA • ${mod.numero}</span>
        <h3>Evaluación de comprensión (Escala 1.0 a 5.0)</h3>
        <p>Nota mínima de aprobación: <strong>3.0 / 5.0</strong>. Todas las respuestas se califican automáticamente y se guardan en tu historial.</p>
        ${previousSavedBanner}
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
                  <input type="radio" name="q_${qIdx}" value="${oIdx}" required>
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

        <div id="quiz-scorecard-slot"></div>

        <div class="quiz-actions-row">
          <button type="submit" class="complete-module-btn ${isDone ? 'is-done' : ''}" id="submit-module-quiz">
            ${isDone ? 'Presentar nuevo intento ✓' : 'Enviar evaluación y calificar ✓'}
          </button>

          <button type="button" class="next-module-btn" id="go-next-module-btn" ${isDone ? '' : 'hidden'}>
            ${nextLabel}
          </button>
        </div>

        <p class="quiz-result-msg" id="module-quiz-feedback" role="status" aria-live="polite"></p>
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

    document.getElementById('module-quiz-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const feedback = document.getElementById('module-quiz-feedback');
      const submitBtn = document.getElementById('submit-module-quiz');
      const scorecardSlot = document.getElementById('quiz-scorecard-slot');

      const respuestasSeleccionadas = [];
      for (let qIdx = 0; qIdx < mod.quiz.length; qIdx++) {
        const selected = container.querySelector(`input[name="q_${qIdx}"]:checked`);
        if (!selected) {
          feedback.className = 'quiz-result-msg error';
          feedback.textContent = '⚠️ Responde todas las preguntas antes de enviar la evaluación.';
          return;
        }
        respuestasSeleccionadas.push(Number(selected.value));
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Calificando y guardando en Supabase...';
      feedback.textContent = '';

      try {
        const { data, error } = await supabaseClient.rpc('registrar_intento_quiz', {
          p_cedula: activeSession.cedula,
          p_curso_id: currentCourse.id,
          p_modulo_id: mod.id,
          p_respuestas: respuestasSeleccionadas
        });

        if (error) throw error;

        // Actualizar estado en memoria con la respuesta oficial del servidor
        activeInscripcion = data.inscripcion;
        activeProgreso = Array.isArray(data.progreso) ? data.progreso : activeProgreso;
        const res = data.resultado;

        updateCounters();
        syncFinalStepsLock();

        const updatedModProg = getModuleProgress(mod.id);
        scorecardSlot.innerHTML = renderGradeScorecardHtml(
          res,
          updatedModProg,
          hasNext,
          nextModule ? nextModule.numero : ''
        );

        if (res.aprobado || isModuleApproved(mod.id)) {
          submitBtn.classList.add('is-done');
          submitBtn.textContent = 'Módulo aprobado (Repetir evaluación) ✓';
          nextBtn.hidden = false;
          feedback.className = 'quiz-result-msg success';
          feedback.textContent = `✅ Resultado guardado en la base de datos. Nota: ${Number(res.nota).toFixed(1)} / 5.0.`;
        } else {
          submitBtn.classList.remove('is-done');
          submitBtn.textContent = 'Reintentar evaluación ↻';
          nextBtn.hidden = true;
          feedback.className = 'quiz-result-msg error';
          feedback.textContent = `❌ Obtuviste ${Number(res.nota).toFixed(1)} / 5.0 (mínimo 3.0). Puedes volver a intentarlo ahora mismo.`;
        }

        scorecardSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (err) {
        feedback.className = 'quiz-result-msg error';
        feedback.textContent = `❌ Error al guardar evaluación: ${err.message}`;
        submitBtn.textContent = 'Enviar evaluación y calificar ✓';
      } finally {
        submitBtn.disabled = false;
      }
    });
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

  // =========================================================================
  // 6. GENERACIÓN DE CERTIFICADO REAL EN PDF (jsPDF + REGISTRO EN SUPABASE)
  // =========================================================================
  function loadLogoAsDataUrl(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function downloadCertificatePDF(certData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter' // 279.4 x 215.9 mm
    });

    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // Fondo sutil crema/blanco
    doc.setFillColor(250, 253, 252);
    doc.rect(0, 0, W, H, 'F');

    // Doble marco institucional VATOHA (#0f5c5c y #38c6d9)
    doc.setDrawColor(15, 92, 92);
    doc.setLineWidth(2.2);
    doc.rect(10, 10, W - 20, H - 20);

    doc.setDrawColor(56, 198, 217);
    doc.setLineWidth(0.8);
    doc.rect(14, 14, W - 28, H - 28);

    // Banda superior decorativa
    doc.setFillColor(15, 92, 92);
    doc.rect(14, 14, W - 28, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('VATOHA INGENIERÍA S.A.S.  •  NIT 901.479.098-6  •  PROGRAMA DE FORMACIÓN EMPRESARIAL', W / 2, 21.5, {
      align: 'center'
    });

    // Logo de VATOHA (si está disponible en assets/logo-vatoha.png)
    const logoDataUrl = await loadLogoAsDataUrl('assets/logo-vatoha.png');
    let cursorY = 34;
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', W / 2 - 22, cursorY, 44, 16);
      cursorY += 22;
    } else {
      doc.setTextColor(15, 92, 92);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('VATOHA INGENIERÍA S.A.S.', W / 2, cursorY + 8, { align: 'center' });
      cursorY += 16;
    }

    // Título principal
    doc.setTextColor(15, 92, 92);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('CERTIFICADO DE APROBACIÓN', W / 2, cursorY + 6, { align: 'center' });

    doc.setDrawColor(56, 198, 217);
    doc.setLineWidth(1);
    doc.line(W / 2 - 55, cursorY + 10, W / 2 + 55, cursorY + 10);

    // Subtítulo otorgado a
    doc.setTextColor(75, 99, 102);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Se otorga el presente reconocimiento a:', W / 2, cursorY + 20, { align: 'center' });

    // Nombre completo del participante
    doc.setTextColor(16, 42, 46);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(String(certData.nombre_completo).toUpperCase(), W / 2, cursorY + 32, { align: 'center' });

    // Cédula
    doc.setTextColor(15, 92, 92);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Identificado(a) con C.C. ${certData.cedula}`, W / 2, cursorY + 40, { align: 'center' });

    // Texto de aprobación del curso
    doc.setTextColor(55, 75, 78);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(
      'Por haber cursado y aprobado satisfactoriamente todas las evaluaciones del programa:',
      W / 2,
      cursorY + 51,
      { align: 'center' }
    );

    // Nombre del curso
    doc.setTextColor(15, 92, 92);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    const courseLines = doc.splitTextToSize(String(certData.curso_titulo).toUpperCase(), W - 70);
    doc.text(courseLines, W / 2, cursorY + 61, { align: 'center' });

    const afterCourseY = cursorY + 61 + courseLines.length * 7;

    // Resultado de aprobación y fecha
    doc.setFillColor(238, 249, 246);
    doc.setDrawColor(190, 226, 222);
    doc.roundedRect(W / 2 - 85, afterCourseY + 2, 170, 14, 3, 3, 'FD');

    doc.setTextColor(15, 92, 92);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(
      `RESULTADO: APROBADO  •  NOTA FINAL: ${Number(certData.nota_final).toFixed(1)} / 5.0  •  FECHA: ${formatDateCO(certData.fecha_emision)}`,
      W / 2,
      afterCourseY + 10.5,
      { align: 'center' }
    );

    // Pie de firma e Identificador Único
    const footerY = H - 24;
    doc.setDrawColor(15, 92, 92);
    doc.setLineWidth(0.5);
    doc.line(32, footerY - 8, 105, footerY - 8);
    doc.setTextColor(16, 42, 46);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('DIRECCIÓN DE TALENTO HUMANO Y SST', 68.5, footerY - 3, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('VATOHA Ingeniería S.A.S.', 68.5, footerY + 1.5, { align: 'center' });

    doc.setTextColor(15, 92, 92);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`ID ÚNICO CERTIFICADO: ${certData.codigo_certificado}`, W - 24, footerY - 3, { align: 'right' });
    doc.setTextColor(95, 115, 118);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Verificable en el Portal Oficial de Capacitación VATOHA', W - 24, footerY + 1.5, { align: 'right' });

    const safeFileCurso = certData.curso_id.replace(/[^a-z0-9-]/gi, '_');
    doc.save(`Certificado_VATOHA_${certData.cedula}_${safeFileCurso}.pdf`);
  }

  // =========================================================================
  // 7. ANEXOS Y MODALES DE CIERRE
  // =========================================================================
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

  // Verificación pública de certificados en la vista Anexos
  document.getElementById('btn-verify-certificate')?.addEventListener('click', () => {
    openModal(
      'Validación Oficial de Certificados',
      `
      <p>Ingresa el <strong>código único del certificado</strong> (ej. <code>VAT-2026-XXXXXX</code>) o el <strong>número de cédula</strong> del participante:</p>
      <form id="verify-cert-form" style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
        <input type="text" id="verify-query-input" placeholder="Código o cédula..." style="flex:1;min-width:200px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;" required>
        <button type="submit" class="complete-module-btn">Consultar 🔍</button>
      </form>
      <div id="verify-cert-results"></div>
    `
    );

    document.getElementById('verify-cert-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = document.getElementById('verify-query-input').value.trim();
      const box = document.getElementById('verify-cert-results');
      box.innerHTML = '<p>Consultando base de datos...</p>';

      try {
        const { data, error } = await supabaseClient.rpc('validar_certificado_publico', { p_consulta: q });
        if (error) throw error;

        if (!data || data.length === 0) {
          box.innerHTML = '<p class="quiz-result-msg error">No se encontraron certificados emitidos con ese código o cédula.</p>';
          return;
        }

        box.innerHTML = data
          .map(
            (c) => `
          <div class="lesson-concept-card" style="margin-bottom:12px;">
            <span class="mini-pill">CERTIFICADO VÁLIDO ✓ • ${c.codigo_certificado}</span>
            <h4 style="font-family:var(--font-sans);font-size:1.1rem;margin-top:8px;">${c.nombre_completo} (C.C. ${c.cedula})</h4>
            <p style="margin:4px 0;"><strong>Curso:</strong> ${c.curso_titulo}</p>
            <p style="margin:0;font-size:0.88rem;color:var(--muted);">
              Nota final: <strong>${Number(c.nota_final).toFixed(1)} / 5.0</strong> • Emitido el ${formatDateCO(c.fecha_emision)}
            </p>
          </div>
        `
          )
          .join('');
      } catch (err) {
        box.innerHTML = `<p class="quiz-result-msg error">Error al validar: ${err.message}</p>`;
      }
    });
  });

  // Pasos finales del curso (Encuesta, Resumen de Notas y Certificado PDF)
  document.querySelectorAll('[data-step-modal]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!currentCourse || !activeSession) return;

      if (!isCourseCompleted(currentCourse)) {
        openModal(
          '🔒 Requisitos Pendientes',
          '<p>Debes aprobar todos los módulos del curso con una nota mínima de <strong>3.0 / 5.0</strong> antes de acceder a este paso.</p>'
        );
        return;
      }

      const type = btn.dataset.stepModal;

      if (type === 'encuesta') {
        openModal(
          '1. Encuesta de Satisfacción',
          `
          <p>Participante: <strong>${activeSession.nombre}</strong> (C.C. ${activeSession.cedula})</p>
          <p>¿Cómo calificas la calidad y aplicabilidad de <strong>${currentCourse.titulo}</strong>?</p>
          <div style="display:flex;gap:12px;margin:16px 0;flex-wrap:wrap;">
            <button type="button" class="pill-btn" data-rate="Excelente">😄 Excelente</button>
            <button type="button" class="pill-btn" data-rate="Bueno">🙂 Bueno</button>
            <button type="button" class="pill-btn" data-rate="Por mejorar">😐 Por mejorar</button>
          </div>
          <p id="survey-msg" style="font-weight:700;color:#0f5c5c;"></p>
        `
        );

        modalBody.querySelectorAll('[data-rate]').forEach((b) => {
          b.addEventListener('click', async () => {
            const msg = document.getElementById('survey-msg');
            msg.textContent = 'Guardando calificación...';
            try {
              const { error } = await supabaseClient.rpc('guardar_encuesta_satisfaccion', {
                p_cedula: activeSession.cedula,
                p_curso_id: currentCourse.id,
                p_calificacion: b.dataset.rate
              });
              if (error) throw error;
              msg.textContent = `✅ ¡Gracias! Tu valoración (${b.dataset.rate}) quedó registrada en Supabase.`;
            } catch (err) {
              msg.textContent = `❌ Error: ${err.message}`;
            }
          });
        });
      }

      if (type === 'resumen') {
        const filas = activeProgreso
          .map(
            (p) => `
          <tr>
            <td>${p.modulo_numero}: ${p.modulo_titulo}</td>
            <td><strong>${Number(p.mejor_nota).toFixed(1)} / 5.0</strong></td>
            <td>${p.intentos_totales}</td>
            <td>${p.aprobado ? '✅ Aprobado' : '❌ Pendiente'}</td>
          </tr>
        `
          )
          .join('');

        openModal(
          '2. Resumen Oficial de Notas y Avance',
          `
          <p><strong>Participante:</strong> ${activeSession.nombre} • <strong>C.C.</strong> ${activeSession.cedula}</p>
          <p><strong>Curso:</strong> ${currentCourse.titulo} • <strong>Avance:</strong> ${activeInscripcion.porcentaje_avance}%</p>
          <div class="lesson-table-wrap">
            <table class="lesson-table">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Mejor Nota</th>
                  <th>Intentos</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
            </table>
          </div>
          <p style="margin-top:12px;"><strong>Promedio General:</strong> ${Number(activeInscripcion.promedio_general).toFixed(1)} / 5.0 (${activeInscripcion.estado_finalizacion})</p>
        `
        );
      }

      if (type === 'certificado') {
        openModal(
          '3. Certificado Oficial de Capacitación',
          '<p>Generando y verificando tu certificado oficial en la base de datos...</p>'
        );

        try {
          const { data: certData, error } = await supabaseClient.rpc('emitir_certificado_oficial', {
            p_cedula: activeSession.cedula,
            p_curso_id: currentCourse.id
          });

          if (error) throw error;
          activeCertificado = certData;

          openModal(
            '3. Certificado Oficial de Capacitación',
            `
            <div class="cert-preview">
              <p style="margin:0;font-weight:800;color:#0f5c5c;letter-spacing:.08em;">VATOHA INGENIERÍA S.A.S. • NIT 901.479.098-6</p>
              <h4>CERTIFICADO DE APROBACIÓN</h4>
              <p style="margin:4px 0;">OTORGADO A:</p>
              <div class="cert-name">${certData.nombre_completo}</div>
              <p style="margin:4px 0;font-weight:700;color:#0f5c5c;">C.C. ${certData.cedula}</p>
              <p>Por aprobar satisfactoriamente el curso:<br><strong>${certData.curso_titulo}</strong></p>
              <p style="font-size:0.88rem;color:#0f5c5c;font-weight:700;">
                Nota Final: ${Number(certData.nota_final).toFixed(1)} / 5.0 • Fecha: ${formatDateCO(certData.fecha_emision)}<br>
                ID Certificado: <code>${certData.codigo_certificado}</code>
              </p>
            </div>
            <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap;">
              <button type="button" class="complete-module-btn" id="btn-download-pdf-cert" style="flex:1;">
                Descargar Certificado en PDF 📄
              </button>
            </div>
          `
          );

          document.getElementById('btn-download-pdf-cert')?.addEventListener('click', () => {
            downloadCertificatePDF(certData);
          });
        } catch (err) {
          openModal(
            'No es posible generar el certificado',
            `<p class="quiz-result-msg error">❌ ${err.message}</p>`
          );
        }
      }
    });
  });

  // =========================================================================
  // 8. VIDEOS DE LA VISTA INICIO (inicio1.mp4 a inicio5.mp4)
  // =========================================================================
  function mountHomeVideos() {
    const HOME_VIDEOS = {
      monitor: { titulo: 'Capacitación empresarial VATOHA', url: 'assets/inicio1.mp4' },
      intro: { titulo: 'Introducción al programa de capacitación', url: 'assets/inicio2.mp4' },
      just: { titulo: 'Por qué es clave capacitar al equipo', url: 'assets/inicio3.mp4' },
      obj: { titulo: 'Objetivo de la formación VATOHA', url: 'assets/inicio4.mp4' },
      alcance: { titulo: 'Alcance del programa de capacitación', url: 'assets/inicio5.mp4' }
    };

    const screenContent = document.querySelector('.screen-content');
    if (screenContent && HOME_VIDEOS.monitor.url) {
      screenContent.innerHTML = `
        ${buildVideoPlayerHtml(HOME_VIDEOS.monitor, HOME_VIDEOS.monitor.titulo)}
        <button type="button" class="screen-cta" id="monitor-go-cursos">
          Ir a los cursos disponibles →
        </button>
      `;
      document.getElementById('monitor-go-cursos')?.addEventListener('click', () => {
        switchView('cursos');
      });
    }

    const introGrid = document.querySelector('.intro-grid');
    if (introGrid && HOME_VIDEOS.intro.url) {
      const box = document.createElement('div');
      box.className = 'intro-video-slot';
      box.innerHTML = buildVideoPlayerHtml(HOME_VIDEOS.intro, HOME_VIDEOS.intro.titulo);
      introGrid.appendChild(box);
    }

    const justContainer = document.querySelector('#justificacion .container');
    if (justContainer && HOME_VIDEOS.just.url) {
      const box = document.createElement('div');
      box.className = 'justification-video-slot';
      box.innerHTML = buildVideoPlayerHtml(HOME_VIDEOS.just, HOME_VIDEOS.just.titulo);
      justContainer.appendChild(box);
    }

    const objGrid = document.querySelector('.objective-grid');
    if (objGrid && HOME_VIDEOS.obj.url) {
      const box = document.createElement('div');
      box.className = 'objective-video-slot';
      box.innerHTML = buildVideoPlayerHtml(HOME_VIDEOS.obj, HOME_VIDEOS.obj.titulo);
      objGrid.appendChild(box);
    }

    const alcanceContainer = document.querySelector('#alcance .container');
    const ctaStrip = alcanceContainer?.querySelector('.home-cta-strip');
    if (alcanceContainer && HOME_VIDEOS.alcance.url) {
      const box = document.createElement('div');
      box.className = 'alcance-video-slot';
      box.innerHTML = buildVideoPlayerHtml(HOME_VIDEOS.alcance, HOME_VIDEOS.alcance.titulo);
      if (ctaStrip) {
        alcanceContainer.insertBefore(box, ctaStrip);
      } else {
        alcanceContainer.appendChild(box);
      }
    }
  }

  // =========================================================================
  // 9. INICIALIZACIÓN Y RESTAURACIÓN AUTOMÁTICA DE SESIÓN
  // =========================================================================
  async function initApp() {
    mountHomeVideos();
    renderAnexos();

    if (activeSession && activeSession.cedula && isSupabaseConfigured()) {
      const savedCourse = PORTAL_CURSOS.find((c) => c.id === activeSession.cursoId) || PORTAL_CURSOS[0];
      try {
        await authenticateAndLoadCourse(activeSession.cedula, activeSession.nombre, savedCourse);
      } catch (e) {
        saveSessionMeta(null);
      }
    }

    renderSessionBar();
    renderCoursesCatalog();
  }

  initApp();
});