# Ai-Project
---

# 🏠 Family Manager App

Kompleksowa aplikacja webowa do zarządzania życiem rodzinnym. Umożliwia tworzenie wirtualnych rodzin, zarządzanie wspólnym budżetem (cele oszczędnościowe, składki) oraz delegowanie i ocenianie zadań domowych.

Projekt składa się z backendu opartego na **FastAPI** oraz nowoczesnego frontendu w **React + TypeScript + Vite**.

## 🚀 Technologie

### Frontend
*   **Framework:** React 18 (Vite)
*   **Język:** TypeScript
*   **Stylowanie:** Tailwind CSS
*   **Zarządzanie Stanem:** Zustand (Global State), TanStack Query (Server State)
*   **Formularze:** React Hook Form + Zod (walidacja)
*   **HTTP Client:** Axios

### Backend
*   **Framework:** FastAPI (Python)
*   **Baza Danych:** SQLite + SQLModel (ORM)
*   **Autentykacja:** OAuth2 z tokenami JWT (JSON Web Tokens)
*   **Bezpieczeństwo:** Haszowanie haseł (Passlib/Bcrypt), CORS

---

## ✨ Funkcjonalności

1.  **Zarządzanie Rodziną:**
    *   Tworzenie nowej rodziny (użytkownik staje się administratorem).
    *   Generowanie unikalnych kodów zaproszeń.
    *   Dołączanie do istniejącej rodziny za pomocą kodu.

2.  **Finanse:**
    *   **Konto Oszczędnościowe:** Monitorowanie comiesięcznych obowiązkowych wpłat członków rodziny.
    *   **Cele:** Tworzenie celów finansowych (np. "Wakacje") z wizualizacją postępu (paski postępu).
    *   Wpłacanie dowolnych kwot na wybrane cele.

3.  **Zadania (W trakcie rozwoju):**
    *   Dodawanie zadań domowych.
    *   Przypisywanie członków rodziny do zadań.
    *   System oceny wykonanych zadań.

---

## ⚙️ Instalacja i Uruchomienie

Aby uruchomić projekt, potrzebujesz zainstalowanego **Node.js** oraz **Pythona**.

### 1. Backend (Serwer API)

Przejdź do folderu z backendem:

```bash
cd Backend
```

Utwórz i aktywuj środowisko wirtualne:

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/MacOS
python3 -m venv .venv
source .venv/bin/activate
```

Zainstaluj wymagane biblioteki:

```bash
pip install fastapi "uvicorn[standard]" sqlmodel passlib[bcrypt] python-jose[cryptography] python-multipart
```

Uruchom serwer:

```bash
uvicorn main:app --reload
```
Backend będzie działał pod adresem: `http://127.0.0.1:8000`
Dokumentacja API (Swagger UI): `http://127.0.0.1:8000/docs`

---

### 2. Frontend (Aplikacja Kliencka)

Otwórz nowy terminal i przejdź do folderu frontendu:

```bash
cd frontend-new
```

Zainstaluj zależności:

```bash
npm install
```

Skonfiguruj zmienne środowiskowe. Upewnij się, że masz plik `.env` w folderze `frontend-new`:

```properties
VITE_API_URL=http://127.0.0.1:8000
```

Uruchom aplikację:

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

---

## 📂 Struktura Projektu

```text
/
├── Backend/                 # API w FastAPI
│   ├── api/                 # Endpointy (auth, family, finance)
│   ├── core/                # Konfiguracja bazy i bezpieczeństwa
│   ├── models/              # Modele bazy danych (SQLModel)
│   ├── schemas/             # Schematy Pydantic
│   └── main.py              # Punkt wejścia aplikacji
│
└── frontend-new/            # Klient React
    ├── src/
    │   ├── api/             # Komunikacja z backendem (Axios)
    │   ├── components/      # Reużywalne komponenty UI (Button, Input)
    │   ├── features/        # Logika biznesowa (opcjonalnie)
    │   ├── pages/           # Główne widoki (Dashboard, Finances, Login)
    │   ├── stores/          # Stan globalny (Zustand - Auth)
    │   └── router.tsx       # Routing aplikacji
    └── tailwind.config.js   # Konfiguracja stylów
```

**Autor:** 
Julia Szaniawska
Kornel Serafin
Projekt stworzony w celach edukacyjnych.