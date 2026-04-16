# Timeline Editor Pro

A modern, professional timeline editing web application with a clean and intuitive interface.

## 📋 Overview

Timeline Editor Pro is a feature-rich web application designed for creating and managing timelines, meeting minutes (atas), planning documents, and project management tasks. Built with vanilla HTML, CSS, and JavaScript, it offers a responsive and user-friendly experience.

## ✨ Features

- **Modern UI/UX**: Clean design with gradient backgrounds and smooth animations
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Multiple Modules**:
  - Timeline Editor
  - Meeting Minutes (Atas)
  - Planning Tools
  - Project Management
  - Cost Management
  - Risk Management
  - Open Pit Management (Gestão de Cava)
- **Rich Text Editing**: Full-text editor with formatting options
- **Modal Components**: Interactive modals for editing descriptions
- **Navigation System**: Single-page application feel with dynamic page loading

## 📁 Project Structure

```
/workspace
├── index.html              # Main entry point with timeline editor
├── iindex.html             # Alternative index file
├── .gitignore              # Git ignore configuration
├── assets/
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   ├── main.js         # Core application logic
│   │   ├── atas.js         # Meeting minutes functionality
│   │   ├── paginas.js      # Page navigation handler
│   │   └── planejamento.js # Planning module
│   └── pages/
│       ├── atas.html           # Meeting minutes page
│       ├── planejamento.html   # Planning page
│       ├── projeto.html        # Project page
│       ├── custos.html         # Costs page
│       ├── riscos.html         # Risks page
│       └── gestao-cava.html    # Open pit management page
└── modal/
    └── descricao-modal.html    # Description editor modal component
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, but recommended)

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Open `index.html` in your web browser

### Using a Local Server (Recommended)

For the best experience, serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open your browser and navigate to `http://localhost:8000`

## 🎨 Usage

### Navigation

- Use the top navigation bar to switch between different modules
- Click on the CTA button to access the planning tools
- The home button returns you to the landing page

### Timeline Editor

- Create and edit timeline events
- Add descriptions, dates, and metadata
- Customize event styling and colors

### Meeting Minutes (Atas)

- Create structured meeting records
- Add participants, topics, and decisions
- Export and save minutes

### Planning Module

- Create project plans
- Manage tasks and milestones
- Track progress and deadlines

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS variables, gradients, and flexbox
- **JavaScript (ES6+)**: Vanilla JavaScript for interactivity
- **Google Fonts**: Inter font family for typography

## 🎯 Key Components

### Main Styles (`assets/css/styles.css`)

Contains all custom styles including:
- CSS custom properties (variables)
- Responsive layouts
- Component styles
- Animation definitions

### Core JavaScript Files

- **main.js**: Application initialization and navigation
- **paginas.js**: Dynamic page loading system
- **atas.js**: Meeting minutes functionality
- **planejamento.js**: Planning module logic

### Modal System

The application uses a custom modal system for editing content:
- Description editor modal
- Cancel/Save actions
- Overlay backdrop

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is provided as-is for educational and professional use.

## 👨‍💻 Author

Timeline Editor Pro - A professional timeline and project management tool.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Note**: This is a client-side only application. Data persistence depends on browser storage or backend integration not included in this repository.
