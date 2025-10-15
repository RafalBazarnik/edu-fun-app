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
   - Menu startowe w formie listy/kafelków prezentującej moduły ćwiczeń; pierwszy element to „Głoski zmiękczające” z krótką zajawką (np. liczba słówek, przewidywany czas).
   - Każda pozycja menu posiada wyróżniony przycisk CTA („Rozpocznij”) oraz miejsce na przyszłe moduły, aby można było łatwo dodawać kolejne ćwiczenia.
   - Na desktopie menu układa się w 2–3 kolumny z czytelnymi kafelkami; na urządzeniach mobilnych przechodzi w pojedynczą kolumnę z dużymi polami dotykowymi i poziomym przewijaniem, gdy pojawi się więcej niż trzy moduły.
   - Informacja o liczbie zadań dostępnych w puli oraz skrót statystyk z ostatniej sesji, jeśli istnieją.
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
   - Przełączany panel „Raport sesji” wysuwany z boku/dolnej krawędzi, prezentujący zagregowane statystyki z ostatnich zapisanych sesji (wyniki, średnia skuteczność, najtrudniejsze słowa) na podstawie danych utrwalonych w pamięci lokalnej.
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

## Nowe ćwiczenie: „Samogłoski vs Spółgłoski”

### Założenia dydaktyczne
- Ćwiczenie wzmacnia rozpoznawanie samogłosek i spółgłosek poprzez szybkie klasyfikowanie pojedynczych liter.
- Wykorzystuje istniejący przepływ quizu (ekran powitalny → panel ćwiczenia → statystyki/podsumowanie), zastępując słowa pojedynczymi literami w wariantach wielkich i małych.
- Odpowiedzi są prezentowane w dwóch kafelkach: „Samogłoska” oraz „Spółgłoska”.

### Przebieg użytkownika
1. Ekran powitalny zawiera dedykowany opis zadania i informację, że litery mogą występować jako małe lub wielkie.
2. Po rozpoczęciu sesji panel ćwiczenia losowo wyświetla pojedynczą literę (np. „A” lub „b”) w postaci dużej karty.
3. Użytkownik wybiera kategorię (samogłoska/spółgłoska); po wyborze pojawia się natychmiastowa informacja zwrotna identyczna jak w bazowym ćwiczeniu.
4. Panel statystyk i ekran podsumowania korzystają z tej samej logiki wyświetlania co w ćwiczeniu zmiękczających zgłosek.

### Notatki dotyczące UI
- Typografia: litery na kartach wyświetlane fontem bezszeryfowym o masie `700`, rozmiar bazowy minimum `6rem` na telefonach i `8rem` na tabletach, z proporcjonalnym skalowaniem do szerokości ekranu (np. `clamp(4rem, 18vw, 8rem)`).
- Karty liter mają minimalny rozmiar `min(60vw, 280px)` z marginesami `1rem` na urządzeniach mobilnych i `2rem` na szerszych ekranach.
- Przyciski odpowiedzi ustawione w kolumnie na wąskich ekranach (gap `1.25rem`) i w wierszu na tabletach (`min-width: 768px`) z dodatkowym `padding`em `1rem 1.5rem`.
- Zapewnienie kontrastu tła karty co najmniej 4.5:1 oraz zastosowanie zaokrąglonych rogów (`border-radius: 1.5rem`) dla łatwiejszej percepcji na dotykowych urządzeniach.
- Dodatkowe `letter-spacing: 0.1em` dla wielkich liter, aby uniknąć optycznego zlewania na małych ekranach.

### Kryteria akceptacyjne
- Losowanie liter obejmuje pełen zestaw alfabetu łacińskiego używanego w języku polskim, z równą szansą na wersję wielką i małą każdej litery.
- W jednej sesji litery nie powtarzają się do wyczerpania puli, tak jak w obecnym mechanizmie ćwiczeń ze zgłoskami.
- Walidacja odpowiedzi ponownie wykorzystuje istniejącą infrastrukturę: wynik pozytywny przy poprawnym dopasowaniu kategorii oraz negatywny z komentarzem przy błędzie.
- System statystyk odnotowuje wynik w ten sam sposób, aktualizując liczniki i procent skuteczności bez dodatkowej konfiguracji.
- Jednostkowe testy (lub manualna lista kontrolna) potwierdzają, że wszystkie samogłoski (`a, e, i, o, u, y, ą, ę`) są identyfikowane jako poprawne odpowiedzi dla kafelka „Samogłoska”.
- Litery niebędące samogłoskami w powyższej puli są oceniane jako „Spółgłoska”, zachowując parytet z istniejącym frameworkiem ćwiczeń.
### Trwałość danych i historia sesji
- **Mechanizm zapisu:** wyniki każdej próby (identyfikator zadania, poprawność, czas odpowiedzi, znaczniki czasowe rozpoczęcia/zakończenia sesji) są zapisywane w `localStorage` pod kluczem `zabawy-ze-zgloskami/sesje`. Dane przechowywane są w formacie JSON jako lista sesji, z której każda zawiera:
  - metadane sesji (`sessionId`, `startedAt`, `finishedAt`),
  - zagregowane statystyki (`attempts`, `correct`, `mistakes`, `accuracy`),
  - tablicę prób z informacjami o każdym ćwiczeniu (`taskId`, wybrana zgłoska, poprawność, znacznik czasu odpowiedzi).
- **Aktualizacja zapisu:** po zakończeniu ćwiczenia dane sesji są scalane z istniejącą listą, a jeżeli w `localStorage` znajduje się starsza wersja struktur, aplikacja wykonuje migrację (np. dodanie brakujących pól z wartościami domyślnymi).
- **Fallback:** w przypadku braku wsparcia dla `localStorage` aplikacja działa w trybie sesyjnym (tylko pamięć w RAM) i komunikuje użytkownikowi brak trwałego zapisu.

### Raport sesji w menu głównym
- Ekran startowy prezentuje zwijany panel „Raport sesji” z nagłówkiem oraz ikoną strzałki sygnalizującą możliwość rozwinęcia.
- Po rozwinięciu panelu wyświetlane są maksymalnie trzy ostatnie sesje z `localStorage`: data i godzina zakończenia, liczba poprawnych odpowiedzi, skuteczność, liczba zadań.
- Każdy wiersz posiada przycisk „Szczegóły”, który otwiera modal lub boczny panel z pełną listą prób (słowo, wybrana zgłoska, status ✅/❌, czas odpowiedzi).
- Jeśli brak zapisanych sesji, panel pokazuje informację „Brak zapisanych wyników — rozpocznij pierwsze ćwiczenie!” oraz instrukcję, że wyniki zapisują się automatycznie po zakończeniu.

### Retencja i reset danych
- Domyślnie przechowywane są maksymalnie 20 ostatnich sesji; dodanie nowej sesji usuwa najstarszy rekord, aby zapobiegać nadmiernemu zużyciu pamięci.
- W menu ustawień oraz na ekranie podsumowania pozostaje dostępny przycisk „Usuń historię”, który usuwa klucz `zabawy-ze-zgloskami/sesje` z `localStorage` po potwierdzeniu użytkownika.
- Po restarcie ćwiczenia (przycisk „Powtórz ćwiczenie”) zaczyna się nowa sesja, lecz poprzednia pozostaje w historii do momentu ręcznego usunięcia.
- Dodatkowo aplikacja raz na 30 dni sprawdza znaczniki czasu w historii i automatycznie usuwa sesje starsze niż 90 dni, co minimalizuje ryzyko przechowywania nieaktualnych danych.

## Kolejne kroki rozwoju
1. Przygotowanie prototypu UI (Figma / szkice papierowe).
2. Implementacja struktury projektu w Vite + React + TypeScript.
3. Dodanie danych ćwiczeń zgodnie z powyższą tabelą.
4. Implementacja logiki losowania i zapisu wyników.
5. Dodanie efektów wizualnych i animacji wzmacniających informacje zwrotne.
6. Konfiguracja PWA (manifest, service worker) oraz testy na urządzeniach mobilnych.
7. Weryfikacja językowa słówek przez nauczyciela / rodzica, rozszerzanie bazy danych.


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

## Aktywność „Odczytywanie czasu”
- Zakres godzin obejmuje wyłącznie wartości od 1 do 12, aby dopasować się do tradycyjnej tarczy zegara.
- Minuty ograniczone są do kwartalnych interwałów: `00`, `15`, `30` oraz `45`, dzięki czemu ćwiczenie skupia się na najczęściej używanych formach.
- Każda runda generuje jedno poprawne rozwiązanie oraz trzy dystraktory, które są tasowane przed prezentacją.
- Dystraktory powinny zachowywać poprawny format czasu (np. `7:15`), ale różnić się godziną lub minutami od właściwej odpowiedzi.
- Interfejs przewiduje możliwość przełączania między tarczą analogową a cyfrowym wyświetlaczem, aby wspierać różne style nauki.
- Widoki muszą pozostawać responsywne – na urządzeniach mobilnych elementy zegara i przyciski odpowiedzi powinny skalować się oraz zachowywać wygodne marginesy dotykowe.
- Wersja analogowa powinna uwzględniać wyraźne wskazówki godzinową i minutową, a cyfrowa – czytelne typograficzne przedstawienie czasu.

### Utrwalenie danych i raportowanie
- Zapisywanie postępów w `localStorage`, aby zachować wyniki pomiędzy sesjami.
- Udostępnienie widoku historii sesji z możliwością filtrowania po dacie i typie ćwiczeń.
- Eksport raportu do pliku PDF/obrazka podsumowującego skuteczność oraz ostatnie błędy.
- Dodanie opcji ręcznego resetu postępów wraz z potwierdzeniem działania.

### Integracyjne zadania wspólne
- Przygotowanie testów interfejsu pokrywających nowe przepływy menu oraz ćwiczeń.
- Aktualizacja dokumentacji użytkownika wraz ze zrzutami ekranu nowych ekranów.
- Weryfikacja tłumaczeń i etykiet, aby zachować spójność językową po wprowadzeniu zmian.
