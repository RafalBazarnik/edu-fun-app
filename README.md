# Zabawy ze zgłoskami

Interakcyjna aplikacja edukacyjna do ćwiczenia zapisu zgłosek zmiękczających w języku polskim. Projekt został przygotowany w React + Vite z TypeScriptem i bazuje na planie opisanym w `plan.md`.

## Funkcje

- Tryby widoków: ekran startowy, panel ćwiczenia oraz podsumowanie sesji.
- Losowe zadania bez powtórzeń z możliwością filtrowania tylko słów posiadających ilustrujące emoji.
- Natychmiastowa informacja zwrotna i panel statystyk aktualizowany na żywo.
- Podsumowanie sesji z listą odpowiedzi i wskaźnikiem skuteczności.
- Konfiguracja PWA (manifest, ikony) umożliwiająca instalację aplikacji.

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

## PWA

Projekt korzysta z `vite-plugin-pwa`. Po zbudowaniu aplikacji manifest oraz service worker zostaną wygenerowane automatycznie, co umożliwi działanie offline oraz instalację na urządzeniu mobilnym.
