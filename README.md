# Zabawy ze zgłoskami

Interakcyjna aplikacja edukacyjna do ćwiczenia zapisu zgłosek zmiękczających w języku polskim. Projekt został przygotowany w React + Vite z TypeScriptem i bazuje na planie opisanym w `plan.md`.

## Funkcje

- Tryby widoków: ekran startowy, panel ćwiczenia oraz podsumowanie sesji.
- Losowe zadania bez powtórzeń z możliwością filtrowania tylko słów posiadających ilustrujące emoji.
- Natychmiastowa informacja zwrotna i panel statystyk aktualizowany na żywo.
- Podsumowanie sesji z listą odpowiedzi i wskaźnikiem skuteczności.
- Konfiguracja PWA (manifest, ikony) umożliwiająca instalację aplikacji.
- Responsywny layout dopasowujący się do ekranów mobilnych, tabletów i komputerów stacjonarnych.

## Struktura projektu

```
src/
  components/   # Widoki i elementy UI (TaskCard, StatsPanel, itp.)
  context/      # Logika sesji i zarządzanie stanem ćwiczeń
  data/         # Dane słówek w postaci tablicy TypeScript
  styles/       # Globalne style CSS
```

## Uruchamianie

1. Zainstaluj zależności (wymagany Node 18+):
   ```bash
   npm install
   ```
2. Uruchom środowisko deweloperskie:
   ```bash
   npm run dev
   ```
3. Zbuduj aplikację produkcyjną:
   ```bash
   npm run build
   ```

## Responsive design

Warstwy UI korzystają z CSS-owych siatek (`grid`) oraz elastycznych kontenerów (`flex`).
Kluczowe elementy dostosowane zostały do małych ekranów:

- panel statystyk w widoku ćwiczenia układa się w prostą siatkę, dzięki czemu nie wymusza przewijania w poziomie,
- lista odpowiedzi w podsumowaniu łamie wiersze i zachowuje czytelność na smartfonach,
- przyciski akcji otrzymują pełną szerokość na wąskich urządzeniach, co ułatwia obsługę dotykową.

## Publikacja na GitHub Pages

Repozytorium zawiera gotowy pipeline w `.github/workflows/deploy.yml`, który po każdym pushu na gałąź `main`
buduje aplikację i udostępnia ją w usłudze GitHub Pages.

1. Włącz GitHub Pages w ustawieniach repozytorium (`Settings` → `Pages`) i wybierz opcję `GitHub Actions`.
2. Upewnij się, że gałąź główna nazywa się `main` (lub zaktualizuj workflow do wybranej nazwy gałęzi).
3. Każde wypchnięcie zmian na `main` uruchomi workflow budujący projekt poleceniami `npm ci` oraz `npm run build`.
4. Podczas kroku budowania ustawiana jest zmienna `VITE_BASE_PATH`, dzięki czemu statyczne zasoby będą działać pod
   adresem `https://<twoja_nazwa>.github.io/<repozytorium>/`.

### Ręczne publikowanie lub testowanie

Jeśli chcesz lokalnie zweryfikować build z tym samym prefiksem co na GitHub Pages, uruchom:

```bash
VITE_BASE_PATH=/twoje-repozytorium/ npm run build
```

Powstały katalog `dist` można następnie udostępnić w dowolnym serwerze statycznym (np. `npx serve dist`).

## PWA

Projekt korzysta z `vite-plugin-pwa`. Po zbudowaniu aplikacji manifest oraz service worker zostaną wygenerowane automatycznie, co umożliwi działanie offline oraz instalację na urządzeniu mobilnym.
