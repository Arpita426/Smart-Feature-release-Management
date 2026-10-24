# Feature Release Demo Web

![GitHub License](https://img.shields.io/github/license/Arpita426/Feature_Release_Demo_web)
![GitHub Stars](https://img.shields.io/github/stars/Arpita426/Feature_Release_Demo_web)
![GitHub Issues](https://img.shields.io/github/issues/Arpita426/Feature_Release_Demo_web)

## 📖 Overview

**Feature Release Demo Web** is a full‑stack demonstration application that showcases a modern feature‑flag driven release workflow. It includes a backend API for managing feature flags, a React‑based frontend that reacts to flag changes in real‑time, and a management dashboard for toggling flags.

The project is built to illustrate:
- Dynamic feature flag evaluation using the **Feature Flag SDK**.
- Seamless UI updates without page reloads.
- Integration of environment‑specific configurations.
- Best practices for CI/CD and version control.

> **Demo URL:** https://github.com/Arpita426/Feature_Release_Demo_web.git

---

## ✨ Key Features

- **Feature Flag Dashboard** – Toggle flags such as `dark-mode`, `new-checkout`, and `discount-30`.
- **Real‑time UI Updates** – Frontend reacts instantly to flag changes via WebSocket/SSE.
- **Multi‑environment Support** – Separate configurations for development, staging, and production.
- **Comprehensive CI/CD** – GitHub Actions workflow for linting, testing, and deployment.
- **Responsive Design** – Built with modern CSS (CSS‑Modules) and a dark‑mode ready UI.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TypeScript, React Router, TailwindCSS (optional) |
| **Backend** | Node.js (Express), TypeScript, PostgreSQL (or SQLite for dev) |
| **Feature Flag SDK** | Custom SDK (located in `backend/feature-flag/`) |
| **CI/CD** | GitHub Actions |
| **Testing** | Jest, React Testing Library, Supertest |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Git**
- (Optional) **Docker** – for containerised development

### Installation

```bash
# Clone the repository
git clone https://github.com/Arpita426/Feature_Release_Demo_web.git
cd Feature_Release_Demo_web

# Install dependencies (choose npm or yarn)
npm install   # or
yarn install
```

### Environment Variables

Create a `.env` file in the project root (copy from `.env.example` if present):

```dotenv
# Server configuration
PORT=4000

# Database (adjust as needed)
DATABASE_URL=postgresql://user:password@localhost:5432/feature_demo

# Feature flag secret (used by the SDK)
FEATURE_FLAG_SECRET=your_secret_key
```

### Running the Application

```bash
# Start the backend API
npm run dev:backend   # or yarn dev:backend

# In a separate terminal, start the frontend
npm run dev:frontend   # or yarn dev:frontend
```

The frontend will be available at `http://localhost:5173` (Vite default) and the API at `http://localhost:4000/api`.

---

## 🧪 Testing

```bash
# Run unit and integration tests
npm test   # or yarn test
```

Coverage reports are generated in the `coverage/` directory.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes with clear messages.
4. Open a Pull Request describing the changes.

Make sure to run linting (`npm run lint`) and tests before submitting.

---

## 📜 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Arpita426** – [GitHub Profile](https://github.com/Arpita426)

Feel free to open an issue for bugs, feature requests, or questions.
