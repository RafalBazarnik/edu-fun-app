# Plan aplikacji „Zabawy ze zgłoskami”

## Roadmapa na najbliższe sprinty

### Przeprojektowanie menu
- Zaprojektowanie prostego menu startowego z wyraźnymi przyciskami prowadzącymi do trybów ćwiczeń i panelu statystyk.
- Wprowadzenie sekcji "Szybki start" prezentującej ostatnio uruchamiany tryb wraz z liczbą wykonanych zadań.
- Dodanie skrótu do ustawień dostępności (kontrast, dźwięk) z poziomu menu.
- Przygotowanie responsywnego układu działającego na urządzeniach dotykowych.

### Nowe typy ćwiczeń
- Rozszerzenie bazy o zadania typu "przeciągnij i upuść" dla ułożenia poprawnej zgłoski.
- Dodanie wariantu "dokończ zdanie", w którym użytkownik wybiera zgłoskę dopasowaną do kontekstu zdania.
- Przygotowanie generatora szybkich powtórek (3–5 losowych słów) do wykorzystania w krótkich sesjach.
- Ujednolicenie komunikatów informacji zwrotnej dla nowych i istniejących ćwiczeń.

### Utrwalenie danych i raportowanie
- Zapisywanie postępów w `localStorage`, aby zachować wyniki pomiędzy sesjami.
- Udostępnienie widoku historii sesji z możliwością filtrowania po dacie i typie ćwiczeń.
- Eksport raportu do pliku PDF/obrazka podsumowującego skuteczność oraz ostatnie błędy.
- Dodanie opcji ręcznego resetu postępów wraz z potwierdzeniem działania.

### Integracyjne zadania wspólne
- Przygotowanie testów interfejsu pokrywających nowe przepływy menu oraz ćwiczeń.
- Aktualizacja dokumentacji użytkownika wraz ze zrzutami ekranu nowych ekranów.
- Weryfikacja tłumaczeń i etykiet, aby zachować spójność językową po wprowadzeniu zmian.
