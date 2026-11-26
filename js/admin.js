document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const logoutBtn = document.getElementById('admin-logout-btn');

  const modal = document.getElementById('portal-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  let allParticipantes = [];
  let allInscripciones = [];
  let allProgreso = [];
  let allIntentos = [];
  let allCertificados = [];
  let filteredRows = [];

  function openModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.hidden = false;
  }

  function closeModal() {
    modal.hidden = true;
  }

  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', closeModal);

  // Poblar filtro de cursos desde PORTAL_CURSOS
  const courseFilter = document.getElementById('filter-course');
  if (courseFilter && typeof PORTAL_CURSOS !== 'undefined') {
    PORTAL_CURSOS.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.titulo;
      courseFilter.appendChild(opt);
    });
  }

  // Verificar sesión activa de administrador en Supabase Auth
  async function checkAdminSession() {
    if (!isSupabaseConfigured()) {
      const errEl = document.getElementById('admin-login-error');
      errEl.textContent = '⚠️ Configura primero VATOHA_SUPABASE_URL y VATOHA_SUPABASE_ANON_KEY en js/supabase-config.js.';
      errEl.hidden = false;
      return;
    }

    const { data } = await supabaseClient.auth.getSession();
    if (data && data.session) {
      showDashboard();
      await loadAdminData();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
    logoutBtn.hidden = true;
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    logoutBtn.hidden = false;
  }

  document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const errEl = document.getElementById('admin-login-error');
    const btn = document.getElementById('btn-admin-login');

    errEl.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Verificando credenciales...';

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showDashboard();
      await loadAdminData();
    } catch (err) {
      errEl.textContent = `❌ Acceso denegado: ${err.message}`;
      errEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Iniciar sesión administrativa →';
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    showLogin();
  });

  document.getElementById('btn-refresh-admin')?.addEventListener('click', loadAdminData);

  // Cargar toda la información desde Supabase
  async function loadAdminData() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:24px;">Cargando registros desde Supabase...</td></tr>';

    const [resPart, resInsc, resProg, resInt, resCert] = await Promise.all([
      supabaseClient.from('participantes').select('*').order('ultimo_acceso', { ascending: false }),
      supabaseClient.from('inscripciones').select('*').order('fecha_ingreso', { ascending: false }),
      supabaseClient.from('progreso_modulos').select('*').order('orden_modulo', { ascending: true }),
      supabaseClient.from('intentos_quiz').select('*').order('fecha_presentacion', { ascending: false }),
      supabaseClient.from('certificados').select('*')
    ]);

    allParticipantes = resPart.data || [];
    allInscripciones = resInsc.data || [];
    allProgreso = resProg.data || [];
    allIntentos = resInt.data || [];
    allCertificados = resCert.data || [];

    renderKpis();
    applyFilters();
  }

  function renderKpis() {
    const kpiContainer = document.getElementById('admin-kpis');
    const totalPart = allParticipantes.length;
    const totalInsc = allInscripciones.length;
    const totalFinalizados = allInscripciones.filter((i) => i.estado_finalizacion === 'Finalizado').length;
    const totalCerts = allCertificados.length;

    const notasValidas = allInscripciones
      .map((i) => Number(i.promedio_general))
      .filter((n) => n > 0);
    const promedioGlobal = notasValidas.length
      ? (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(1)
      : '0.0';

    kpiContainer.innerHTML = `
      <div class="admin-kpi-card">
        <span>Participantes Únicos</span>
        <strong>${totalPart}</strong>
      </div>
      <div class="admin-kpi-card">
        <span>Inscripciones a Cursos</span>
        <strong>${totalInsc}</strong>
      </div>
      <div class="admin-kpi-card">
        <span>Cursos Aprobados</span>
        <strong>${totalFinalizados}</strong>
      </div>
      <div class="admin-kpi-card">
        <span>Promedio General</span>
        <strong>${promedioGlobal} / 5.0</strong>
      </div>
      <div class="admin-kpi-card">
        <span>Certificados Emitidos</span>
        <strong>${totalCerts}</strong>
      </div>
    `;
  }

  function applyFilters() {
    const query = (document.getElementById('filter-search')?.value || '').trim().toLowerCase();
    const courseVal = document.getElementById('filter-course')?.value || '';
    const statusVal = document.getElementById('filter-status')?.value || '';

    const partMap = new Map(allParticipantes.map((p) => [p.cedula, p]));
    const certMap = new Map(allCertificados.map((c) => [c.inscripcion_id, c]));

    filteredRows = allInscripciones
      .map((insc) => {
        const part = partMap.get(insc.cedula) || { nombre_completo: 'Sin nombre', cedula: insc.cedula };
        const modulos = allProgreso.filter((pm) => pm.inscripcion_id === insc.id);
        const intentos = allIntentos.filter((iq) => iq.inscripcion_id === insc.id);
        const cert = certMap.get(insc.id) || null;
        const tieneReprobados = intentos.some((iq) => !iq.aprobado);

        return {
          insc,
          part,
          modulos,
          intentos,
          cert,
          tieneReprobados
        };
      })
      .filter((row) => {
        const matchesQuery =
          !query ||
          row.part.nombre_completo.toLowerCase().includes(query) ||
          row.insc.cedula.includes(query);
        const matchesCourse = !courseVal || row.insc.curso_id === courseVal;
        const matchesStatus =
          !statusVal ||
          (statusVal === 'Reprobado'
            ? row.tieneReprobados
            : row.insc.estado_finalizacion === statusVal);
        return matchesQuery && matchesCourse && matchesStatus;
      });

    renderTable();
  }

  function renderTable() {
    const tbody = document.getElementById('admin-table-body');
    const countLabel = document.getElementById('admin-rows-count');
    if (countLabel) countLabel.textContent = `${filteredRows.length} registro(s)`;

    if (filteredRows.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--muted);">No hay registros que coincidan con los filtros seleccionados.</td></tr>';
      return;
    }

    tbody.innerHTML = filteredRows
      .map((row, idx) => {
        const fecha = new Date(row.insc.fecha_ingreso).toLocaleDateString('es-CO');
        const modBadges = row.modulos
          .map((m) => {
            const nota = Number(m.mejor_nota);
            if (m.intentos_totales === 0) {
              return `<span class="grade-chip none">M${m.orden_modulo}: Pend.</span>`;
            }
            const cls = m.aprobado ? 'pass' : 'fail';
            return `<span class="grade-chip ${cls}">M${m.orden_modulo}: ${nota.toFixed(1)}</span>`;
          })
          .join('');

        const estadoBadge =
          row.insc.estado_finalizacion === 'Finalizado'
            ? '<span class="mod-status-badge approved">APROBADO ✓</span>'
            : '<span class="mod-status-badge pending">EN PROGRESO</span>';

        const certText = row.cert
          ? `<code>${row.cert.codigo_certificado}</code>`
          : '<span style="color:var(--muted);">No emitido</span>';

        return `
          <tr>
            <td><strong>${row.insc.cedula}</strong></td>
            <td>${row.part.nombre_completo}</td>
            <td>${row.insc.curso_titulo}</td>
            <td>${fecha}</td>
            <td><strong>${row.insc.porcentaje_avance}%</strong></td>
            <td>${modBadges}</td>
            <td><strong>${Number(row.insc.promedio_general).toFixed(1)} / 5.0</strong></td>
            <td>${estadoBadge}</td>
            <td>${certText}</td>
            <td>
              <button type="button" class="anexo-btn dark" style="padding:6px 12px;font-size:0.78rem;" data-view-history="${idx}">
                Ver (${row.intentos.length})
              </button>
            </td>
          </tr>
        `;
      })
      .join('');

    tbody.querySelectorAll('[data-view-history]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = filteredRows[Number(btn.dataset.viewHistory)];
        if (!row) return;
        openAttemptHistoryModal(row);
      });
    });
  }

  function openAttemptHistoryModal(row) {
    if (row.intentos.length === 0) {
      openModal(
        `Historial • ${row.part.nombre_completo} (C.C. ${row.insc.cedula})`,
        '<p>Este participante aún no ha presentado evaluaciones en este curso.</p>'
      );
      return;
    }

    const html = `
      <p style="margin-top:0;"><strong>Curso:</strong> ${row.insc.curso_titulo}</p>
      <div class="lesson-table-wrap">
        <table class="lesson-table admin-table">
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Intento</th>
              <th>Fecha</th>
              <th>Correctas / Total</th>
              <th>Desempeño</th>
              <th>Nota (1-5)</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            ${row.intentos
              .map(
                (it) => `
              <tr>
                <td>${it.modulo_numero}</td>
                <td>#${it.numero_intento}</td>
                <td>${new Date(it.fecha_presentacion).toLocaleString('es-CO')}</td>
                <td>${it.respuestas_correctas} / ${it.total_preguntas} (Inc: ${it.respuestas_incorrectas})</td>
                <td>${it.porcentaje_desempeno}%</td>
                <td><strong>${Number(it.nota).toFixed(1)}</strong></td>
                <td>${
                  it.aprobado
                    ? '<span class="mod-status-badge approved">APROBADO</span>'
                    : '<span class="mod-status-badge locked" style="background:#fee2e2;color:#991b1b;">REPROBADO</span>'
                }</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    openModal(`Historial de Intentos • ${row.part.nombre_completo} (C.C. ${row.insc.cedula})`, html);
  }

  document.getElementById('filter-search')?.addEventListener('input', applyFilters);
  document.getElementById('filter-course')?.addEventListener('change', applyFilters);
  document.getElementById('filter-status')?.addEventListener('change', applyFilters);

  // =========================================================================
  // EXPORTACIÓN REAL A EXCEL (.xlsx) CON SHEETJS
  // =========================================================================
  document.getElementById('btn-export-excel')?.addEventListener('click', () => {
    if (typeof XLSX === 'undefined') {
      alert('No se pudo cargar la librería de Excel.');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Hoja 1: Consolidado de Participantes y Notas por Módulo
    const hojaConsolidado = filteredRows.map((row) => {
      const m1 = row.modulos.find((m) => m.orden_modulo === 1);
      const m2 = row.modulos.find((m) => m.orden_modulo === 2);
      const m3 = row.modulos.find((m) => m.orden_modulo === 3);

      return {
        Cedula: row.insc.cedula,
        Nombre_Completo: row.part.nombre_completo,
        Curso: row.insc.curso_titulo,
        Fecha_Ingreso: new Date(row.insc.fecha_ingreso).toLocaleDateString('es-CO'),
        Porcentaje_Avance: `${row.insc.porcentaje_avance}%`,
        Nota_Modulo_1: m1 && m1.intentos_totales > 0 ? Number(m1.mejor_nota) : 'Pendiente',
        Nota_Modulo_2: m2 && m2.intentos_totales > 0 ? Number(m2.mejor_nota) : 'Pendiente',
        Nota_Modulo_3: m3 && m3.intentos_totales > 0 ? Number(m3.mejor_nota) : 'Pendiente',
        Promedio_General: Number(row.insc.promedio_general),
        Estado_Curso: row.insc.estado_finalizacion,
        Total_Intentos: row.intentos.length,
        Codigo_Certificado: row.cert ? row.cert.codigo_certificado : 'No emitido'
      };
    });

    const ws1 = XLSX.utils.json_to_sheet(hojaConsolidado);
    XLSX.utils.book_append_sheet(wb, ws1, 'Consolidado_Capacitacion');

    // Hoja 2: Historial Detallado de Intentos
    const partMap = new Map(allParticipantes.map((p) => [p.cedula, p.nombre_completo]));
    const hojaIntentos = allIntentos.map((it) => ({
      Cedula: it.cedula,
      Nombre_Completo: partMap.get(it.cedula) || '',
      Curso_ID: it.curso_id,
      Modulo: it.modulo_numero,
      Numero_Intento: it.numero_intento,
      Fecha_Presentacion: new Date(it.fecha_presentacion).toLocaleString('es-CO'),
      Respuestas_Correctas: it.respuestas_correctas,
      Respuestas_Incorrectas: it.respuestas_incorrectas,
      Total_Preguntas: it.total_preguntas,
      Porcentaje_Desempeno: `${it.porcentaje_desempeno}%`,
      Nota_Escala_1_a_5: Number(it.nota),
      Estado: it.aprobado ? 'APROBADO' : 'REPROBADO'
    }));

    const ws2 = XLSX.utils.json_to_sheet(hojaIntentos);
    XLSX.utils.book_append_sheet(wb, ws2, 'Historial_Intentos');

    const fechaArchivo = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Reporte_Capacitacion_VATOHA_${fechaArchivo}.xlsx`);
  });

  checkAdminSession();
});