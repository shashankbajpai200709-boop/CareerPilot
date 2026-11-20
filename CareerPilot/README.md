# CareerPilot

CareerPilot is a browser based career management workspace built with React, HTML, CSS, and plain JavaScript. It uses React's browser CDN builds and does not require a build step.

## Run it

Open `index.html` in a current browser. Internet access is needed to load React and ReactDOM from unpkg, plus DM Sans and Manrope from Google Fonts. System sans-serif fallbacks are used if the fonts cannot load.

## Demo accounts

| Workspace | Email | Password |
| --- | --- | --- |
| Student Demo | `student@careerpilot.demo` | `Student@123` |
| Second Demo | `admin@careerpilot.demo` | `Admin@123` |

Both accounts use fictional sample records. Use the profile menu to switch workspaces or restore the selected account's original sample data.

## Project files

```text
CareerPilot/
├── index.html
├── style.css
├── README.md
└── js/
    └── app.js
```

## Included features

- Separate demo datasets and front-end sign-in flows.
- Overview metrics, recent activity, skill proficiency distribution, and interview next steps derived from the selected account's records.
- Search and status filters across skills, learning, applications, and interview preparation.
- Create, edit, and delete flows, with confirmation dialogs and feedback.
- Completion toggles, total learning time, and interview preparation progress.
- Light and dark themes, responsive layouts, and reduced-motion support.

## Limitations

Authentication is a front-end demo only and is not secure. Credentials and fictional records are in the JavaScript source. User changes and login state live in React memory; refreshing returns to the sign-in screen and restores the original demo datasets. There is no backend or persistence.
