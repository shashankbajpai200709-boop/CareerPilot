/* CareerPilot uses React state only: records reset when this page is refreshed. */
const h = React.createElement;
const { useState, useEffect } = React;

const NAV = [
  { id: 'dashboard', label: 'Overview', icon: '◫' },
  { id: 'skills', label: 'Skills', icon: '◇' },
  { id: 'learning', label: 'Learning', icon: '↗' },
  { id: 'applications', label: 'Applications', icon: '▤' },
  { id: 'interview', label: 'Interview prep', icon: '✓' },
];
const STATUSES = ['Applied', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Withdrawn'];
const emptyForms = { skills: { name: '', level: 'Beginner' }, learning: { title: '', date: '', duration: '', completed: false }, applications: { company: '', role: '', date: '', status: 'Applied' }, interview: { title: '', completed: false } };
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Demo-only credentials and fictional records are deliberately kept in memory.
const ACCOUNTS = [
  { id: 'student', name: 'Student Demo', email: 'student@careerpilot.demo', password: 'Student@123', role: 'Student workspace' },
  { id: 'second', name: 'Second Demo', email: 'admin@careerpilot.demo', password: 'Admin@123', role: 'Second demo workspace' },
];
const DEMO_DATA = {
  student: {
    skills: [
      { id: 's-1', name: 'JavaScript', level: 'Intermediate' },
      { id: 's-2', name: 'User research', level: 'Beginner' },
      { id: 's-3', name: 'Communication', level: 'Advanced' },
      { id: 's-4', name: 'React', level: 'Intermediate' },
    ],
    learning: [
      { id: 'l-1', title: 'React component patterns', date: '2026-11-17', duration: '50', completed: true },
      { id: 'l-2', title: 'Portfolio case study outline', date: '2026-11-19', duration: '35', completed: false },
      { id: 'l-3', title: 'Accessibility fundamentals', date: '2026-11-15', duration: '40', completed: true },
    ],
    applications: [
      { id: 'a-1', company: 'Juniper Studio (fictional)', role: 'Product Design Intern', date: '2026-11-18', status: 'Interview Scheduled' },
      { id: 'a-2', company: 'Northstar Labs (fictional)', role: 'Frontend Intern', date: '2026-11-12', status: 'Applied' },
    ],
    tasks: [
      { id: 't-1', title: 'Practice a project walkthrough', completed: true },
      { id: 't-2', title: 'Prepare questions for the team', completed: false },
      { id: 't-3', title: 'Review JavaScript fundamentals', completed: false },
    ],
  },
  second: {
    skills: [
      { id: 's-11', name: 'Python', level: 'Advanced' },
      { id: 's-12', name: 'Data storytelling', level: 'Intermediate' },
      { id: 's-13', name: 'SQL', level: 'Intermediate' },
    ],
    learning: [
      { id: 'l-11', title: 'Exploratory data analysis', date: '2026-11-18', duration: '65', completed: true },
      { id: 'l-12', title: 'Dashboard design principles', date: '2026-11-20', duration: '30', completed: false },
    ],
    applications: [
      { id: 'a-11', company: 'Cedar Analytics (fictional)', role: 'Data Analyst Intern', date: '2026-11-14', status: 'Applied' },
      { id: 'a-12', company: 'Fieldnote Research (fictional)', role: 'Research Assistant', date: '2026-11-09', status: 'Rejected' },
    ],
    tasks: [
      { id: 't-11', title: 'Review SQL joins and window functions', completed: true },
      { id: 't-12', title: 'Practice explaining a data project', completed: true },
      { id: 't-13', title: 'Prepare questions about mentorship', completed: false },
    ],
  },
};
const cloneData = value => JSON.parse(JSON.stringify(value));

function Button({ children, kind = 'secondary-btn', ...props }) { return h('button', { className: kind, ...props }, children); }
function EmptyState({ title, copy, action }) { return h('div', { className: 'empty-state' }, h('div', { className: 'empty-icon', 'aria-hidden': true }, '＋'), h('h3', null, title), h('p', null, copy), action || null); }
function PageHeading({ eyebrow, title, subtitle, action }) { return h('div', { className: 'page-heading' }, h('div', null, h('div', { className: 'eyebrow' }, eyebrow), h('h1', null, title), h('p', { className: 'subheading' }, subtitle)), action || null); }
function Field({ label, value, onChange, type = 'text', options, required = true, min, placeholder, error }) {
  const control = options
    ? h('select', { className: 'field-select', value, onChange: e => onChange(e.target.value), required }, options.map(x => h('option', { key: x, value: x }, x)))
    : h('input', { className: 'field-input', type, value, onChange: e => onChange(e.target.value), required, min, placeholder });
  return h('div', { className: 'field' }, h('label', null, label), control, error ? h('span', { className: 'field-error' }, error) : null);
}
function FormPanel({ title, fields, values, setValues, onSubmit, onCancel, editing }) {
  return h('form', { className: 'form-card', onSubmit: e => { e.preventDefault(); onSubmit(); } },
    h('h2', { className: 'form-title' }, editing ? `Edit ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`),
    h('div', { className: 'form-grid' }, fields.map(field => h(Field, { key: field.key, ...field, value: values[field.key], onChange: val => setValues(prev => ({ ...prev, [field.key]: val })) }))),
    h('div', { className: 'form-actions' }, h(Button, { type: 'button', onClick: onCancel }, 'Cancel'), h(Button, { type: 'submit', kind: 'primary-btn' }, editing ? 'Save changes' : `Add ${title.toLowerCase()}`))
  );
}
function TableEmpty({ copy }) { return h('div', { className: 'empty-panel' }, h('div', null, h('div', { className: 'empty-icon' }, '＋'), h('p', { className: 'empty-title' }, 'Nothing here yet'), h('p', { className: 'empty-copy' }, copy))); }
function ConfirmDialog({ config, onClose }) {
  useEffect(() => {
    if (!config) return;
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [config, onClose]);
  if (!config) return null;
  return h('div', { className: 'dialog-backdrop', role: 'presentation', onMouseDown: event => { if (event.target === event.currentTarget) onClose(); } },
    h('section', { className: 'confirm-dialog', role: 'alertdialog', 'aria-modal': true, 'aria-labelledby': 'confirm-title' },
      h('div', { className: `dialog-mark ${config.destructive ? 'danger-mark' : ''}` }, config.destructive ? '!' : '↻'),
      h('h2', { id: 'confirm-title' }, config.title), h('p', null, config.message),
      h('div', { className: 'dialog-actions' }, h(Button, { onClick: onClose }, 'Cancel'), h(Button, { kind: config.destructive ? 'danger-confirm-btn' : 'primary-btn', onClick: config.onConfirm }, config.confirmText || 'Confirm'))));
}

function App() {
  // Each module owns a local React state array. No records are written to browser storage.
  const [session, setSession] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [datasets, setDatasets] = useState(() => cloneData(DEMO_DATA));
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [removing, setRemoving] = useState('');
  const [page, setPage] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [skills, setSkills] = useState([]);
  const [learning, setLearning] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All statuses');
  const [skillFilter, setSkillFilter] = useState('All proficiency');
  const [learningFilter, setLearningFilter] = useState('All activity');
  const [taskFilter, setTaskFilter] = useState('All tasks');
  const [query, setQuery] = useState('');
  const [forms, setForms] = useState(emptyForms);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { document.body.dataset.theme = theme; }, [theme]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2500); return () => clearTimeout(timer); }, [toast]);
  // Keep each signed-in demo account isolated while all working records stay in React state.
  useEffect(() => {
    if (!session) return;
    setDatasets(current => ({ ...current, [session.id]: { skills, learning, applications, tasks } }));
  }, [session, skills, learning, applications, tasks]);
  const notify = message => setToast(message);
  const loadAccount = account => {
    const cleanUser = { id: account.id, name: account.name, email: account.email, role: account.role };
    const saved = cloneData(datasets[account.id] || DEMO_DATA[account.id]);
    setSession(cleanUser); setSkills(saved.skills); setLearning(saved.learning); setApplications(saved.applications); setTasks(saved.tasks);
    setPage('dashboard'); setFilter('All statuses'); setSkillFilter('All proficiency'); setLearningFilter('All activity'); setTaskFilter('All tasks'); setQuery('');
    setForms(emptyForms); setFormOpen(false); setEditing(null); setAccountMenuOpen(false); setLoginError('');
    setEmailInput(account.email); setPasswordInput('');
  };
  const signIn = (email, password) => {
    const account = ACCOUNTS.find(item => item.email === email.trim().toLowerCase() && item.password === password);
    if (!account) { setLoginError('That email and password do not match a demo account. Try one of the demo access buttons below.'); return; }
    loadAccount(account);
  };
  const signOut = () => {
    setSession(null); setSkills([]); setLearning([]); setApplications([]); setTasks([]); setPage('dashboard');
    setAccountMenuOpen(false); setPasswordInput(''); setLoginError('');
  };
  const resetDemoData = () => {
    if (!session) return;
    const restored = cloneData(DEMO_DATA[session.id]);
    setDatasets(current => ({ ...current, [session.id]: restored }));
    setSkills(restored.skills); setLearning(restored.learning); setApplications(restored.applications); setTasks(restored.tasks);
    setForms(emptyForms); setFormOpen(false); setEditing(null); setQuery(''); setFilter('All statuses'); setSkillFilter('All proficiency'); setLearningFilter('All activity'); setTaskFilter('All tasks');
    setConfirmDialog(null); setAccountMenuOpen(false); notify(`${session.name} demo data has been restored.`);
  };
  const requestReset = () => {
    setAccountMenuOpen(false);
    setConfirmDialog({ title: 'Reset demo data?', message: `This restores the original fictional records for ${session.name} and removes changes made in this session.`, confirmText: 'Reset demo data', onConfirm: resetDemoData });
  };
  const setForm = (kind, updater) => setForms(current => ({ ...current, [kind]: typeof updater === 'function' ? updater(current[kind]) : updater }));
  const beginAdd = kind => { setEditing(null); setForm(kind, { ...emptyForms[kind] }); setFormOpen(true); };
  const beginEdit = (kind, record) => { setEditing({ kind, id: record.id }); setForm(kind, { ...record }); setFormOpen(true); };
  const cancelForm = () => { setFormOpen(false); setEditing(null); };
  // Keep validation and create/update behavior consistent across all four record types.
  const saveRecord = (kind, list, setter, requiredKeys, success) => {
    const data = forms[kind];
    if (requiredKeys.some(key => !String(data[key] ?? '').trim())) { notify('Please complete all required fields.'); return; }
    if (kind === 'learning' && Number(data.duration) <= 0) { notify('Duration must be greater than zero.'); return; }
    if (editing && editing.kind === kind) setter(list.map(record => record.id === editing.id ? { ...data, id: record.id } : record));
    else setter([...list, { ...data, id: uid() }]);
    cancelForm(); notify(success);
  };
  const remove = (list, setter, record, noun) => {
    const removalKey = `${noun}-${record.id}`;
    setConfirmDialog({ title: `Delete ${noun}?`, message: `This will permanently remove “${record.name || record.title || record.company || record.role}” from this demo account until the demo data is reset.`, confirmText: `Delete ${noun}`, destructive: true, onConfirm: () => {
      setConfirmDialog(null); setRemoving(removalKey);
      window.setTimeout(() => { setter(list.filter(x => x.id !== record.id)); setRemoving(''); notify(`${noun[0].toUpperCase() + noun.slice(1)} deleted.`); }, 180);
    } });
  };
  const changePage = id => { setPage(id); setQuery(''); cancelForm(); };
  const activeApplications = applications.filter(a => !['Rejected', 'Withdrawn'].includes(a.status)).length;
  const completedActivities = learning.filter(a => a.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const prepProgress = tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0;
  const currentLabel = NAV.find(n => n.id === page)?.label || 'Overview';

  function LoginScreen() {
    return h('main', { className: 'login-shell' },
      h('section', { className: 'login-story' },
        h('div', { className: 'brand login-brand' }, h('div', { className: 'brand-mark' }, 'cp'), h('div', null, h('div', { className: 'brand-name' }, 'CareerPilot'), h('div', { className: 'brand-caption' }, 'Career, with direction'))),
        h('div', { className: 'login-story-copy' }, h('div', { className: 'eyebrow' }, 'A clearer path forward'), h('h1', null, 'Make room for the career you’re building.'), h('p', null, 'One considered workspace for the skills, learning, applications and conversations that move you forward.'), h('div', { className: 'login-story-rule' }), h('div', { className: 'login-story-caption' }, 'ENVIRONMENT', h('span', null, 'Fictional people and organizations. No information leaves this browser session.'))),
        h('div', { className: 'login-story-footer' }, 'CareerPilot · Student career workspace')),
      h('section', { className: 'login-main' }, h('div', { className: 'login-card' },
        h('div', { className: 'login-card-eyebrow' }, 'WELCOME TO CAREERPILOT'), h('h2', null, 'Sign in to your workspace'), h('p', { className: 'login-intro' }, 'Use one of the demo accounts to explore the product.'),
        h('form', { className: 'login-form', onSubmit: e => { e.preventDefault(); signIn(emailInput, passwordInput); } },
          h('div', { className: 'field' }, h('label', { htmlFor: 'login-email' }, 'Email address'), h('input', { id: 'login-email', className: 'field-input', type: 'email', autoComplete: 'username', required: true, value: emailInput, onChange: e => setEmailInput(e.target.value), placeholder: 'you@example.com' })),
          h('div', { className: 'field' }, h('label', { htmlFor: 'login-password' }, 'Password'), h('input', { id: 'login-password', className: 'field-input', type: 'password', autoComplete: 'current-password', required: true, value: passwordInput, onChange: e => setPasswordInput(e.target.value), placeholder: 'Enter your password' })),
          loginError && h('div', { className: 'login-error', role: 'alert' }, loginError),
          h(Button, { type: 'submit', kind: 'primary-btn login-submit' }, 'Sign in　→')),
        h('div', { className: 'login-divider' }, h('span'), 'OR OPEN A DEMO ACCOUNT', h('span')),
        h('div', { className: 'demo-account-list' }, ACCOUNTS.map(account => h('button', { key: account.id, type: 'button', className: 'demo-account', onClick: () => loadAccount(account) }, h('span', { className: 'demo-avatar' }, account.id === 'student' ? 'S' : 'D'), h('span', { className: 'demo-account-copy' }, h('strong', null, `Continue as ${account.name}`), h('small', null, account.email)), h('span', { className: 'demo-arrow' }, '→')))),
        h('p', { className: 'login-disclaimer' }, 'Demo access is for product exploration only. This is not production-secure authentication.'))));
  }

  function Header() {
    const date = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
    return h('header', { className: 'topbar' },
      h('div', { className: 'breadcrumbs' }, 'CareerPilot　/　', h('b', null, currentLabel)),
      h('div', { className: 'top-actions' },
        h('span', { className: 'today' }, date),
        h('button', { className: 'theme-toggle', onClick: () => setTheme(t => t === 'light' ? 'dark' : 'light'), 'aria-label': `Switch to ${theme === 'light' ? 'dark' : 'light'} theme` }, theme === 'light' ? '◐　Dark mode' : '☼　Light mode'),
        h('div', { className: 'account-control' },
          h('button', { className: `account-trigger ${accountMenuOpen ? 'open' : ''}`, onClick: () => setAccountMenuOpen(value => !value), 'aria-expanded': accountMenuOpen, 'aria-label': `Account menu for ${session.name}` },
            h('span', { className: 'account-avatar' }, session.name === 'Student Demo' ? 'S' : 'D'),
            h('span', { className: 'account-trigger-name' }, session.name), h('span', { className: 'account-caret' }, '⌄')),
          accountMenuOpen && h('div', { className: 'account-menu' },
            h('div', { className: 'account-menu-heading' }, h('strong', null, session.name), h('span', null, session.email)),
            h('div', { className: 'account-menu-label' }, 'Switch demo workspace'),
            ...ACCOUNTS.filter(account => account.id !== session.id).map(account => h('button', { key: account.id, className: 'account-menu-item', onClick: () => loadAccount(account) }, h('span', { className: 'account-menu-avatar' }, account.id === 'student' ? 'S' : 'D'), h('span', null, account.name), h('span', { className: 'menu-arrow' }, '→'))),
            h('div', { className: 'account-menu-divider' }),
            h('button', { className: 'account-menu-item reset-item', onClick: requestReset }, h('span', { className: 'menu-line-icon' }, '↻'), h('span', null, 'Reset demo data')),
            h('button', { className: 'account-menu-item logout-item', onClick: signOut }, h('span', { className: 'menu-line-icon' }, '↗'), h('span', null, 'Sign out'))))));
  }
  function Sidebar() {
    return h('aside', { className: 'sidebar' }, h('div', { className: 'brand' }, h('div', { className: 'brand-mark' }, 'cp'), h('div', null, h('div', { className: 'brand-name' }, 'CareerPilot'), h('div', { className: 'brand-caption' }, 'Career workspace'))), h('div', { className: 'nav-label' }, 'Workspace'), h('nav', { className: 'nav-list', 'aria-label': 'Main navigation' }, NAV.map(item => h('button', { key: item.id, className: `nav-item ${page === item.id ? 'active' : ''}`, onClick: () => changePage(item.id) }, h('span', { className: 'nav-icon', 'aria-hidden': true }, item.icon), item.label))), h('div', { className: 'sidebar-bottom' }, h('div', { className: 'side-note' }, h('span', { className: 'demo-label' }, 'WORKSPACE'), h('strong', null, 'Fictional sample records'), 'Demo organizations and opportunities are illustrative only.'), h('div', { className: 'side-footer' }, 'CareerPilot · Demo edition')));
  }
  function Metric({ label, value, icon, foot }) { return h('div', { className: 'metric-card' }, h('div', { className: 'metric-top' }, label, h('span', { className: 'metric-icon', 'aria-hidden': true }, icon)), h('div', { className: 'metric-value' }, h('span', { key: String(value), className: 'metric-value-enter' }, value)), h('div', { className: 'metric-foot' }, foot)); }
  // Dashboard values are derived directly from the module arrays above.
  function Dashboard() {
    const recent = [...learning.map(x => ({ name: x.title, meta: `Learning · ${x.date}`, done: x.completed })), ...applications.map(x => ({ name: `${x.role} · ${x.company}`, meta: `Application · ${x.date}`, done: x.status === 'Offer Received' }))].slice(-4).reverse();
    const pendingTasks = tasks.filter(task => !task.completed);
    const levels = ['Beginner', 'Intermediate', 'Advanced'].map(level => ({ label: level, count: skills.filter(skill => skill.level === level).length }));
    const quickItems = [{ id: 'skills', label: 'Manage your skills', icon: '◇' }, { id: 'learning', label: 'Log a learning activity', icon: '↗' }, { id: 'applications', label: 'Track an application', icon: '▤' }, { id: 'interview', label: 'Prepare for interviews', icon: '✓' }];
    const recentContent = recent.length
      ? h('div', { className: 'activity-list' }, recent.map((item, i) => h('div', { className: 'activity-row', key: `${i}-${item.name}`, style: { '--row-order': i } },
        h('span', { className: 'activity-dot' }), h('div', { className: 'activity-main' }, h('div', { className: 'activity-name' }, item.name), h('div', { className: 'activity-meta' }, item.meta)), h('span', { className: `status-pill ${item.done ? 'done' : 'pending'}` }, item.done ? 'Complete' : 'In progress'))))
      : h('div', { className: 'empty-panel' }, h('div', null, h('div', { className: 'empty-icon' }, '＋'), h('p', { className: 'empty-title' }, 'Nothing here yet'), h('p', { className: 'empty-copy' }, 'Your learning and application activity will show up here as you add it.'), h(Button, { kind: 'quiet-btn', onClick: () => changePage('learning') }, 'Log a learning activity →')));
    const skillContent = skills.length
      ? h('div', { className: 'skill-distribution' }, levels.map(item => {
        const share = item.count / skills.length * 100;
        return h('div', { className: 'skill-level-row', key: item.label }, h('div', { className: 'skill-level-heading' }, h('span', null, item.label), h('span', null, item.count)), h('div', { className: 'skill-track' }, h('span', { style: { width: `${share}%` } })));
      }))
      : h('div', { className: 'dashboard-empty-copy' }, 'Add skills to see your current proficiency mix.');
    const taskContent = pendingTasks.length
      ? h('div', { className: 'dashboard-task-list' }, pendingTasks.slice(0, 3).map((task, index) => h('div', { className: 'dashboard-task-row', key: task.id, style: { '--row-order': index } }, h('span', { className: 'task-open-dot' }), h('span', null, task.title))))
      : h('div', { className: 'dashboard-empty-copy' }, 'No pending preparation tasks. Add a step when you’re ready.');
    return h(React.Fragment, null,
      h(PageHeading, { eyebrow: 'Your career, in progress', title: 'Overview', subtitle: 'A clear view of the steps you’re taking toward your next opportunity.' }),
      h('section', { className: 'metric-grid', 'aria-label': 'Career metrics' }, Metric({ label: 'Total skills', value: skills.length, icon: '◇', foot: 'Skills you’re building' }), Metric({ label: 'Learning completed', value: completedActivities, icon: '↗', foot: `${learning.length} total activities` }), Metric({ label: 'Active applications', value: activeApplications, icon: '▤', foot: 'In progress or offer received' }), Metric({ label: 'Interview preparation', value: `${prepProgress}%`, icon: '✓', foot: `${completedTasks} of ${tasks.length} tasks complete` })),
      h('div', { className: 'dashboard-grid' },
        h('section', { className: 'panel' }, h('div', { className: 'panel-head' }, h('h2', { className: 'panel-title' }, 'Recent activity'), h('span', { className: 'panel-meta' }, recent.length ? `${recent.length} items` : 'Your latest updates')), recentContent),
        h('section', { className: 'panel' }, h('div', { className: 'panel-head' }, h('h2', { className: 'panel-title' }, 'Quick access'), h('span', { className: 'panel-meta' }, 'Keep moving')), h('div', { className: 'quick-list' }, quickItems.map(x => h('button', { key: x.id, className: 'quick-item', onClick: () => changePage(x.id) }, h('span', { className: 'quick-symbol' }, x.icon), h('span', { className: 'quick-text' }, x.label), h('span', { className: 'quick-arrow' }, '→')))))),
      h('div', { className: 'dashboard-lower-grid' },
        h('section', { className: 'panel' }, h('div', { className: 'panel-head' }, h('div', null, h('h2', { className: 'panel-title' }, 'Skills overview'), h('span', { className: 'panel-meta' }, `${skills.length} tracked skills`)), h(Button, { kind: 'quiet-btn', onClick: () => changePage('skills') }, 'View skills →')), skillContent),
        h('section', { className: 'panel' }, h('div', { className: 'panel-head' }, h('div', null, h('h2', { className: 'panel-title' }, 'Interview next steps'), h('span', { className: 'panel-meta' }, pendingTasks.length ? `${pendingTasks.length} tasks to prepare` : 'You’re up to date')), h(Button, { kind: 'quiet-btn', onClick: () => changePage('interview') }, 'Open checklist →')), taskContent)));
  }

  function actionButtons(kind, item, list, setter, noun) { return h('div', { className: 'row-actions' }, h(Button, { kind: 'quiet-btn', onClick: () => beginEdit(kind, item), 'aria-label': `Edit ${noun}` }, 'Edit'), h(Button, { kind: 'danger-btn', onClick: () => remove(list, setter, item, noun), 'aria-label': `Delete ${noun}` }, 'Delete')); }
  function SkillsPage() {
    const value = forms.skills;
    const fields = [{ key: 'name', label: 'Skill name', placeholder: 'e.g. Skill you want to track' }, { key: 'level', label: 'Proficiency', options: ['Beginner', 'Intermediate', 'Advanced'] }];
    const shown = skills.filter(skill => skill.name.toLowerCase().includes(query.trim().toLowerCase()) && (skillFilter === 'All proficiency' || skill.level === skillFilter));
    return h(React.Fragment, null,
      h(PageHeading, { eyebrow: 'Your toolkit', title: 'Skills', subtitle: 'Keep a considered record of the skills you’re developing.', action: !formOpen && h(Button, { kind: 'primary-btn', onClick: () => beginAdd('skills') }, '＋ Add skill') }),
      formOpen && h(FormPanel, { title: 'skill', fields, values: value, setValues: fn => setForm('skills', fn), onSubmit: () => saveRecord('skills', skills, setSkills, ['name'], editing ? 'Skill updated.' : 'Skill added.'), onCancel: cancelForm, editing: !!editing }),
      h('div', { className: 'module-toolbar' }, h('span', { className: 'result-count' }, `${shown.length} of ${skills.length} skills`), h('input', { className: 'search-input', type: 'search', value: query, onChange: e => setQuery(e.target.value), placeholder: 'Search skills', 'aria-label': 'Search skills' }), h('select', { className: 'filter-select', value: skillFilter, onChange: e => setSkillFilter(e.target.value), 'aria-label': 'Filter skills by proficiency' }, ['All proficiency', 'Beginner', 'Intermediate', 'Advanced'].map(level => h('option', { key: level }, level)))),
      shown.length ? h('div', { className: 'list-card' }, shown.map(skill => h('div', { className: `list-row ${removing === `skill-${skill.id}` ? 'row-removing' : 'row-enter'}`, key: skill.id }, h('div', { className: 'quick-symbol' }, '◇'), h('div', { className: 'list-content' }, h('div', { className: 'list-title' }, skill.name), h('div', { className: 'list-meta' }, 'Proficiency')), h('span', { className: 'tag' }, skill.level), actionButtons('skills', skill, skills, setSkills, 'skill'))))
        : h(EmptyState, { title: skills.length ? 'No matching skills.' : 'No skills in this workspace.', copy: skills.length ? 'Try another search term.' : 'Add a skill to keep your strengths and areas of growth in view.', action: !skills.length && h(Button, { kind: 'secondary-btn', onClick: () => beginAdd('skills') }, '＋ Add your first skill') }));
  }
  function LearningPage() {
    const value = forms.learning;
    const fields = [{ key: 'title', label: 'Activity title', placeholder: 'What did you work on?' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'duration', label: 'Duration (minutes)', type: 'number', min: '1', placeholder: 'e.g. 45' }];
    const shown = learning.filter(item => item.title.toLowerCase().includes(query.trim().toLowerCase()) && (learningFilter === 'All activity' || (learningFilter === 'Completed' ? item.completed : !item.completed)));
    const totalMinutes = learning.reduce((total, item) => total + Number(item.duration || 0), 0);
    return h(React.Fragment, null,
      h(PageHeading, { eyebrow: 'Keep learning', title: 'Learning tracker', subtitle: 'Record focused practice, courses, projects and the time you put in.', action: !formOpen && h(Button, { kind: 'primary-btn', onClick: () => beginAdd('learning') }, '＋ Add activity') }),
      formOpen && h(FormPanel, { title: 'activity', fields, values: value, setValues: fn => setForm('learning', fn), onSubmit: () => saveRecord('learning', learning, setLearning, ['title', 'date', 'duration'], editing ? 'Activity updated.' : 'Activity added.'), onCancel: cancelForm, editing: !!editing }),
      h('div', { className: 'module-toolbar' }, h('span', { className: 'result-count' }, `${shown.length} activities · ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m logged`), h('input', { className: 'search-input', type: 'search', value: query, onChange: e => setQuery(e.target.value), placeholder: 'Search learning', 'aria-label': 'Search learning activities' }), h('select', { className: 'filter-select', value: learningFilter, onChange: e => setLearningFilter(e.target.value), 'aria-label': 'Filter learning activities' }, ['All activity', 'In progress', 'Completed'].map(item => h('option', { key: item }, item)))),
      shown.length ? h('div', { className: 'list-card' }, shown.map((item, index) => h('div', { className: `list-row ${removing === `activity-${item.id}` ? 'row-removing' : 'row-enter'}`, key: item.id, style: { '--row-order': index } }, h('button', { className: `check-button ${item.completed ? 'checked' : ''}`, onClick: () => setLearning(learning.map(x => x.id === item.id ? { ...x, completed: !x.completed } : x)), 'aria-label': item.completed ? 'Mark incomplete' : 'Mark complete' }, item.completed ? '✓' : ''), h('div', { className: 'list-content' }, h('div', { className: `list-title ${item.completed ? 'struck' : ''}` }, item.title), h('div', { className: 'list-meta' }, `${item.date} · ${item.duration} minutes`)), h('span', { className: `status-pill ${item.completed ? 'done' : 'pending'}` }, item.completed ? 'Completed' : 'In progress'), actionButtons('learning', item, learning, setLearning, 'activity'))))
        : h(EmptyState, { title: learning.length ? 'No matching activities.' : 'Start tracking your learning activities.', copy: learning.length ? 'Adjust your search or status filter.' : 'Log a study session or project to see your learning progress take shape.', action: !learning.length && h(Button, { kind: 'secondary-btn', onClick: () => beginAdd('learning') }, '＋ Add an activity') }));
  }
  function ApplicationsPage() {
    const value = forms.applications;
    const fields = [{ key: 'company', label: 'Company', placeholder: 'Company name' }, { key: 'role', label: 'Role', placeholder: 'Role or internship title' }, { key: 'date', label: 'Application date', type: 'date' }, { key: 'status', label: 'Status', options: STATUSES }];
    const shown = applications.filter(item => (filter === 'All statuses' || item.status === filter) && `${item.company} ${item.role}`.toLowerCase().includes(query.trim().toLowerCase()));
    return h(React.Fragment, null, h(PageHeading, { eyebrow: 'Opportunities', title: 'Applications', subtitle: 'Keep your applications organized from submission to outcome.', action: !formOpen && h(Button, { kind: 'primary-btn', onClick: () => beginAdd('applications') }, '＋ Add application') }), formOpen && h(FormPanel, { title: 'application', fields, values: value, setValues: fn => setForm('applications', fn), onSubmit: () => saveRecord('applications', applications, setApplications, ['company', 'role', 'date', 'status'], editing ? 'Application updated.' : 'Application added.'), onCancel: cancelForm, editing: !!editing }), h('section', { className: 'panel data-panel' }, h('div', { className: 'table-toolbar' }, h('span', { className: 'result-count' }, `${shown.length} ${shown.length === 1 ? 'application' : 'applications'}`), h('input', { className: 'search-input', type: 'search', value: query, onChange: e => setQuery(e.target.value), placeholder: 'Search company or role', 'aria-label': 'Search applications' }), h('label', { className: 'sr-only', htmlFor: 'status-filter' }, 'Filter applications by status'), h('select', { id: 'status-filter', className: 'filter-select', value: filter, onChange: e => setFilter(e.target.value) }, ['All statuses', ...STATUSES].map(status => h('option', { key: status }, status)))), shown.length ? h('div', { className: 'table-wrap' }, h('table', null, h('thead', null, h('tr', null, ['Company & role', 'Applied on', 'Status', ''].map(x => h('th', { key: x }, x)))), h('tbody', null, shown.map(item => h('tr', { key: item.id, className: removing === `application-${item.id}` ? 'row-removing' : '' }, h('td', null, h('div', { className: 'table-primary' }, item.company), h('div', { className: 'table-secondary' }, item.role)), h('td', null, item.date), h('td', null, h('span', { className: `status-pill ${item.status === 'Offer Received' ? 'done' : item.status === 'Interview Scheduled' ? 'pending' : ''}` }, item.status)), h('td', null, actionButtons('applications', item, applications, setApplications, 'application'))))))) : h(TableEmpty, { copy: applications.length ? 'No applications match this search and status.' : 'Your applications will appear here once you add one.' })));
  }
  function InterviewPage() {
    const value = forms.interview;
    const fields = [{ key: 'title', label: 'Preparation task', placeholder: 'What do you want to prepare?' }];
    const shown = tasks.filter(item => item.title.toLowerCase().includes(query.trim().toLowerCase()) && (taskFilter === 'All tasks' || (taskFilter === 'Complete' ? item.completed : !item.completed)));
    return h(React.Fragment, null, h(PageHeading, { eyebrow: 'Show up prepared', title: 'Interview preparation', subtitle: 'Break preparation into manageable steps and track them as you go.', action: !formOpen && h(Button, { kind: 'primary-btn', onClick: () => beginAdd('interview') }, '＋ Add task') }), h('section', { className: 'panel progress-panel' }, h('div', { className: 'progress-top' }, h('div', null, h('div', { className: 'progress-number' }, `${prepProgress}%`), h('div', { className: 'progress-note' }, tasks.length ? `${completedTasks} of ${tasks.length} preparation tasks completed` : 'Add a task to begin tracking your preparation')), h('span', { className: 'panel-meta' }, 'Preparation progress')), h('div', { className: 'progress-track', role: 'progressbar', 'aria-valuenow': prepProgress, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': 'Interview preparation progress' }, h('div', { className: 'progress-fill', style: { width: `${prepProgress}%` } }))), formOpen && h(FormPanel, { title: 'task', fields, values: value, setValues: fn => setForm('interview', fn), onSubmit: () => saveRecord('interview', tasks, setTasks, ['title'], editing ? 'Task updated.' : 'Task added.'), onCancel: cancelForm, editing: !!editing }), h('div', { className: 'module-toolbar' }, h('span', { className: 'result-count' }, `${shown.length} tasks shown`), h('input', { className: 'search-input', type: 'search', value: query, onChange: e => setQuery(e.target.value), placeholder: 'Search preparation', 'aria-label': 'Search preparation tasks' }), h('select', { className: 'filter-select', value: taskFilter, onChange: e => setTaskFilter(e.target.value), 'aria-label': 'Filter interview tasks' }, ['All tasks', 'Pending', 'Complete'].map(item => h('option', { key: item }, item)))), shown.length ? h('div', { className: 'list-card' }, shown.map((item, index) => h('div', { className: `list-row ${removing === `task-${item.id}` ? 'row-removing' : 'row-enter'}`, key: item.id, style: { '--row-order': index } }, h('button', { className: `check-button ${item.completed ? 'checked' : ''}`, onClick: () => setTasks(tasks.map(x => x.id === item.id ? { ...x, completed: !x.completed } : x)), 'aria-label': item.completed ? 'Mark incomplete' : 'Mark complete' }, item.completed ? '✓' : ''), h('div', { className: 'list-content' }, h('div', { className: `list-title ${item.completed ? 'struck' : ''}` }, item.title), h('div', { className: 'list-meta' }, item.completed ? 'Completed' : 'Not started')), actionButtons('interview', item, tasks, setTasks, 'task')))) : h(EmptyState, { title: tasks.length ? 'No matching preparation tasks.' : 'Add your first preparation task.', copy: tasks.length ? 'Try another search term or task status.' : 'Create a small checklist for the interview topics you want to practice.', action: !tasks.length && h(Button, { kind: 'secondary-btn', onClick: () => beginAdd('interview') }, '＋ Add a task') }));
  }
  if (!session) return h(LoginScreen);
  const pageContent = { dashboard: Dashboard, skills: SkillsPage, learning: LearningPage, applications: ApplicationsPage, interview: InterviewPage }[page]();
  return h('div', { className: 'app-shell' }, Sidebar(), h('main', { className: 'main-area' }, Header(), h('div', { className: 'content page-enter', key: page }, pageContent)), toast && h('div', { className: 'toast', role: 'status' }, toast), h(ConfirmDialog, { config: confirmDialog, onClose: () => setConfirmDialog(null) }));
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
