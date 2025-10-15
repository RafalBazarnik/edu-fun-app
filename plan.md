# Plan aplikacji „Zabawy ze zgłoskami”

## Cel aplikacji
- Stworzenie interaktywnej gry edukacyjnej uczącej dzieci rozpoznawania i prawidłowego zapisu zgłosek zmiękczających (zi/ź, dzi/dź, ci/ć, ni/ń, si/ś).
- Zapewnienie działania w przeglądarce na komputerach oraz urządzeniach mobilnych (docelowo PWA).
- Prezentowanie wyników i statystyk w czasie rzeczywistym w trakcie pojedynczej sesji.

## Grupa docelowa
- Dzieci w wieku 6–10 lat uczące się języka polskiego.
- Rodzice i nauczyciele poszukujący atrakcyjnych ćwiczeń wspierających naukę ortografii.

## Zakres funkcjonalny
1. **Ekran powitalny**
   - Nazwa aplikacji i krótki opis zasad.
   - Przycisk „Rozpocznij ćwiczenie”.
   - Informacja o liczbie zadań dostępnych w puli.
2. **Panel ćwiczenia**
   - Wyświetlanie słowa z luką w miejscu zgłoski zmiękczającej.
   - Ilustracja (lokalny plik PNG/SVG) lub neutralna ikona, jeśli ilustracja niedostępna.
   - Instrukcja: „Wybierz poprawną zgłoskę”.
   - Dwa kafelki do wyboru (poprawna i myląca zgłoska).
   - Po wyborze wyświetlenie informacji zwrotnej (kolor/animacja, poprawne słowo, krótki komentarz).
   - Przycisk „Następne zadanie” do przejścia dalej.
3. **Statystyki w czasie rzeczywistym**
   - Liczba rozwiązanych zadań, liczba poprawnych odpowiedzi, liczba błędów, procent skuteczności.
   - Pasek postępu obrazujący stosunek zadań wykonanych do całej puli.
4. **Ekran podsumowania sesji**
   - Zestawienie punktów (poprawnych odpowiedzi), błędów i skuteczności.
   - Lista słów wraz z ikonami ✅/❌ informującymi o poprawności odpowiedzi.
   - Przyciski „Powtórz ćwiczenie” (restart sesji) oraz „Wróć do początku”.
5. **Dodatkowe opcje**
   - Przycisk „Resetuj wyniki” dostępny w trakcie ćwiczenia.
   - Możliwość filtrowania: „Tylko słowa z ilustracjami” / „Wszystkie słowa”.
   - Losowanie zadań bez powtórzeń w obrębie jednej sesji.

## Wymagania niefunkcjonalne
- **Język interfejsu:** wyłącznie polski (tekst, przyciski, komunikaty).
- **Responsywność:** projekt dopasowuje układ do szerokości ekranu (flexbox/grid, breakpointy mobilne).
- **Tryb offline:** dzięki konfiguracji PWA aplikację można dodać do ekranu głównego telefonu i używać bez stałego połączenia.
- **Dostępność:** kontrastowe kolory, możliwość obsługi za pomocą klawiatury, opisy alternatywne obrazków.
- **Łatwe rozszerzanie danych:** struktura ćwiczeń w formacie JSON/TypeScript, proste dodawanie nowych rekordów.

## Proponowany stos technologiczny
- **Framework:** React + Vite (z możliwością użycia wtyczki PWA).
- **Język:** TypeScript (kontrola typów i bezpieczeństwo danych).
- **Stylowanie:** Tailwind CSS lub CSS Modules z wykorzystaniem Flexbox i CSS Grid.
- **Zarządzanie stanem:** React Context + hooki lub biblioteka Zustand do przechowywania wyników sesji.
- **Zasoby:** lokalne obrazy w katalogu `public/images`; w razie braku obrazka – neutralna ikona SVG.

## Architektura informacji
1. `App` – zarządza widokami (start, ćwiczenie, podsumowanie) oraz dostarcza kontekst stanu.
2. `ExerciseManager` – losuje zadania, przechowuje aktualny indeks, zapisuje odpowiedzi użytkownika.
3. `TaskCard` – wyświetla słowo, ilustrację i opcje odpowiedzi, obsługuje kliknięcia/tapnięcia.
4. `StatsPanel` – prezentuje postęp i statystyki na żywo.
5. `SummaryScreen` – pokazuje podsumowanie oraz listę wyników z bieżącej sesji.
6. `data/tasks.ts` – przechowuje tablicę z ćwiczeniami pogrupowanymi według kategorii zgłosek.

## Logika punktacji i statystyk
- Każda poprawna odpowiedź = 1 punkt.
- Każdy błąd zwiększa licznik błędów, ale nie odejmuje punktów.
- Skuteczność = (liczba poprawnych odpowiedzi / liczba wykonanych zadań) × 100%.
- Panel statystyk aktualizuje się natychmiast po udzieleniu odpowiedzi.
- Po zakończeniu sesji statystyki pozostają dostępne do momentu naciśnięcia „Resetuj wyniki” lub odświeżenia aplikacji.

## Model danych zadania
```ts
export interface ZadanieZgloski {
  id: string;
  kategoria: "zi/ź" | "dzi/dź" | "ci/ć" | "ni/ń" | "si/ś";
  lukowe: string;       // np. "_iemniak"
  poprawna: string;     // np. "zi"
  alternatywa: string;  // np. "ź"
  pelne: string;        // np. "ziemniak"
  komentarz?: string;   // krótka wskazówka językowa
  obraz?: string;       // np. "images/ziemniak.png"
}
```
- Wszystkie pola tekstowe przechowywane w małych literach, aby uprościć porównania.
- Pole `komentarz` pozwala dodać wskazówkę (np. „W wyrazie *ziemniak* słyszymy *ź*, ale piszemy *zi*.”).

## Pula słów (wersja początkowa)

### Kategoria zi/ź
| Słowo z luką | Poprawna zgłoska | Alternatywa | Pełne słowo | Ilustracja (opis / plik) | Komentarz |
|--------------|------------------|-------------|-------------|--------------------------|-----------|
| _iemniak     | zi               | ź           | ziemniak    | Zdjęcie ziemniaków (`images/ziemniak.png`) | Wymowa jak „ź”, zapis „zi” przed samogłoską. |
| _iarno       | zi               | ź           | ziarno      | Kłosy zboża (`images/ziarno.png`) | „zi” przed samogłoską „a”. |
| mro_k        | zi               | ź           | mrozik      | Płatki śniegu (`images/mrozik.png`) | Zdrobnienie od „mróz”. |
| _rebak       | ź                | zi          | źrebak      | Źrebak przy klaczy (`images/zrebak.png`) | Głoska miękka zapisywana literą „ź”. |

### Kategoria dzi/dź
| Słowo z luką | Poprawna zgłoska | Alternatywa | Pełne słowo | Ilustracja (opis / plik) | Komentarz |
|--------------|------------------|-------------|-------------|--------------------------|-----------|
| _ecko        | dzie             | dźe         | dziecko     | Dziecko z plecakiem (`images/dziecko.png`) | „dzie” przed spółgłoską „c”. |
| _ura         | dzi              | dź          | dziura      | Dziura w drodze (`images/dziura.png`) | „dzi” przed samogłoską „u”. |
| cho__my      | dź               | dzi         | chodźmy     | Dzieci idące razem (`images/chodzmy.png`) | Tryb rozkazujący „chodźmy”. |
| _iennik     | dzi              | dź          | dziennik    | Zeszyt szkolny (`images/dziennik.png`) | „dzi” w środku wyrazu. |

### Kategoria ci/ć
| Słowo z luką | Poprawna zgłoska | Alternatywa | Pełne słowo | Ilustracja (opis / plik) | Komentarz |
|--------------|------------------|-------------|-------------|--------------------------|-----------|
| _asto        | ci               | ć           | ciasto      | Tort urodzinowy (`images/ciasto.png`) | „ci” przed samogłoską „a”. |
| nar__arz     | ci               | ć           | narciarz    | Narciarz na stoku (`images/narciarz.png`) | „ci” między samogłoskami. |
| _ma          | ć                | ci          | ćma         | Motyl nocny (`images/cma.png`) | Pojedyncza litera „ć”. |
| pra_         | ć                | ci          | prać        | Kosz na pranie (`images/prac.png`) | Bezokolicznik zakończony na „-ać”. |

### Kategoria ni/ń
| Słowo z luką | Poprawna zgłoska | Alternatywa | Pełne słowo | Ilustracja (opis / plik) | Komentarz |
|--------------|------------------|-------------|-------------|--------------------------|-----------|
| sa_e         | ni               | ń           | sanie       | Sanki na śniegu (`images/sanie.png`) | W środku wyrazu piszemy „ni”. |
| ko_          | ń                | ni          | koń         | Koń na łące (`images/kon.png`) | Na końcu wyrazu stosujemy „ń”. |
| ba_ka        | ń                | ni          | bańka       | Bańka mydlana (`images/banka.png`) | „ń” przed „k”. |
| _oł          | ani              | ań          | anioł       | Aniołek (`images/aniol.png`) | „ni” przed samogłoską „o”. |

### Kategoria si/ś
| Słowo z luką | Poprawna zgłoska | Alternatywa | Pełne słowo | Ilustracja (opis / plik) | Komentarz |
|--------------|------------------|-------------|-------------|--------------------------|-----------|
| _iatka       | si               | ś           | siatka      | Piłka do siatkówki (`images/siatka.png`) | „si” przed samogłoską „a”. |
| _nieg        | ś                | si          | śnieg       | Zaspy śnieżne (`images/snieg.png`) | Początek słowa zapisujemy literą „ś”. |
| li_ć         | ś                | si          | liść        | Jesienny liść (`images/lisc.png`) | „ś” przed „ć”. |
| __limak      | ś                | si          | ślimak      | Ślimak z muszlą (`images/slimak.png`) | Na początku wyrazu piszemy „ś”. |

## Statystyki i raportowanie
- Panel statystyk aktualizuje się po każdym zadaniu.
- W podsumowaniu prezentowany jest wykres kołowy lub pasek procentowy oraz lista słów z oznaczeniem ✅/❌.
- Możliwość pobrania wyników (np. jako zrzut ekranu) do przekazania rodzicowi/nauczycielowi.

## Kolejne kroki rozwoju
1. Przygotowanie prototypu UI (Figma / szkice papierowe).
2. Implementacja struktury projektu w Vite + React + TypeScript.
3. Dodanie danych ćwiczeń zgodnie z powyższą tabelą.
4. Implementacja logiki losowania i zapisu wyników.
5. Dodanie efektów wizualnych i animacji wzmacniających informacje zwrotne.
6. Konfiguracja PWA (manifest, service worker) oraz testy na urządzeniach mobilnych.
7. Weryfikacja językowa słówek przez nauczyciela / rodzica, rozszerzanie bazy danych.

## Aktywność „Odczytywanie czasu”
- Zakres godzin obejmuje wyłącznie wartości od 1 do 12, aby dopasować się do tradycyjnej tarczy zegara.
- Minuty ograniczone są do kwartalnych interwałów: `00`, `15`, `30` oraz `45`, dzięki czemu ćwiczenie skupia się na najczęściej używanych formach.
- Każda runda generuje jedno poprawne rozwiązanie oraz trzy dystraktory, które są tasowane przed prezentacją.
- Dystraktory powinny zachowywać poprawny format czasu (np. `7:15`), ale różnić się godziną lub minutami od właściwej odpowiedzi.
- Interfejs przewiduje możliwość przełączania między tarczą analogową a cyfrowym wyświetlaczem, aby wspierać różne style nauki.
- Widoki muszą pozostawać responsywne – na urządzeniach mobilnych elementy zegara i przyciski odpowiedzi powinny skalować się oraz zachowywać wygodne marginesy dotykowe.
- Wersja analogowa powinna uwzględniać wyraźne wskazówki godzinową i minutową, a cyfrowa – czytelne typograficzne przedstawienie czasu.
