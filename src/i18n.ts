export const translations = {
  en: {
    // Nav
    home: 'Home',
    projects: 'Projects',
    blog: 'Blog',
    about: 'About',
    followInstagram: 'Follow Alda on Instagram',

    // Home
    homeIntro1:
      "Currently, I'm a software engineer at " +
      '<a href="https://www.globant.com/" ' +
      'target="_blank" rel="noopener noreferrer">' +
      'Globant</a>,.',
    homeIntro2: 'Working on side projects when free time is ' + 'available',
    // Projects
    projectsTitle: 'Projects',
    pdfSelectorDesc:
      'A desktop tool to rename and organize PDF ' +
      'files quickly and efficiently. Select, ' +
      'rename, and manage your PDF documents ' +
      'with ease.',
    downloadExe: 'Download .exe',
    webVersion: 'Web Version',
    bugReportTitle: 'Report a Bug',
    bugReportDesc:
      'Found an issue with one of the projects? ' +
      'Fill out the form below to let me know.',
    projectLabel: 'Project',
    selectProject: 'Select a project...',
    yourName: 'Your Name',
    email: 'Email',
    bugTitle: 'Bug Title',
    bugTitlePlaceholder: 'Brief description of the issue',
    description: 'Description',
    descriptionPlaceholder:
      'Please describe the bug in detail. Include ' +
      'steps to reproduce, expected behavior, and ' +
      'what actually happened.',
    uploadScreenshot: 'Upload Screenshot (optional)',
    submitBugReport: 'Submit Bug Report',
    thankYouReport:
      "Thank you for your report! I'll look into " + 'it as soon as possible.',
    viewDashboard: 'View Bug Tracker',

    // Dashboard
    dashboardTitle: 'Bug Tracker Dashboard',
    dashboardDesc:
      'Track the status of reported bugs ' + 'across all projects.',
    filterAll: 'All',
    filterOpen: 'Open',
    filterInProgress: 'In Progress',
    filterFixed: 'Fixed',
    statusOpen: 'Open',
    statusInProgress: 'In Progress',
    statusFixed: 'Fixed',
    noBugsFound: 'No bug reports found.',
    reportedBy: 'Reported by',
    totalReports: 'Total Reports',
    openIssues: 'Open Issues',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    backToProjects: 'Back to Projects',

    // Footer
    allRightsReserved: 'All rights reserved.',

    // About
    aboutMe: 'About Me',
  },
  es: {
    // Nav
    home: 'Inicio',
    projects: 'Proyectos',
    blog: 'Blog',
    about: 'Acerca de',
    followInstagram: 'Sigue a Alda en Instagram',

    // Home
    homeIntro1:
      'Actualmente, soy ingeniero de software en ' +
      '<a href="https://www.globant.com/" ' +
      'target="_blank" rel="noopener noreferrer">' +
      'Globant</a>',
    homeIntro2:
      'Trabajando en proyectos personales cuando ' + 'hay tiempo libre,',

    // Projects
    projectsTitle: 'Proyectos',
    pdfSelectorDesc:
      'Una herramienta de escritorio para ' +
      'renombrar y organizar archivos PDF de ' +
      'forma rápida y eficiente. Selecciona, ' +
      'renombra y gestiona tus documentos PDF ' +
      'con facilidad.',
    downloadExe: 'Descargar .exe',
    webVersion: 'Versión Web',
    bugReportTitle: 'Reportar un Error',
    bugReportDesc:
      '¿Encontraste un problema con alguno de ' +
      'los proyectos? Completa el formulario a ' +
      'continuación para informarme.',
    projectLabel: 'Proyecto',
    selectProject: 'Selecciona un proyecto...',
    yourName: 'Tu Nombre',
    email: 'Correo Electrónico',
    bugTitle: 'Título del Error',
    bugTitlePlaceholder: 'Breve descripción del problema',
    description: 'Descripción',
    descriptionPlaceholder:
      'Por favor describe el error en detalle. ' +
      'Incluye los pasos para reproducirlo, el ' +
      'comportamiento esperado y lo que realmente ' +
      'sucedió.',
    uploadScreenshot: 'Subir Captura de Pantalla (opcional)',
    submitBugReport: 'Enviar Reporte de Error',
    thankYouReport:
      '¡Gracias por tu reporte! Lo revisaré ' + 'lo antes posible.',
    viewDashboard: 'Ver Seguimiento de Errores',

    // Dashboard
    dashboardTitle: 'Panel de Seguimiento de Errores',
    dashboardDesc:
      'Sigue el estado de los errores reportados ' + 'en todos los proyectos.',
    filterAll: 'Todos',
    filterOpen: 'Abiertos',
    filterInProgress: 'En Progreso',
    filterFixed: 'Resueltos',
    statusOpen: 'Abierto',
    statusInProgress: 'En Progreso',
    statusFixed: 'Resuelto',
    noBugsFound: 'No se encontraron reportes de errores.',
    reportedBy: 'Reportado por',
    totalReports: 'Reportes Totales',
    openIssues: 'Problemas Abiertos',
    inProgress: 'En Progreso',
    resolved: 'Resueltos',
    backToProjects: 'Volver a Proyectos',

    // Footer
    allRightsReserved: 'Todos los derechos reservados.',

    // About
    aboutMe: 'Sobre Mí',
  },
} as const;

export type Lang = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'];
