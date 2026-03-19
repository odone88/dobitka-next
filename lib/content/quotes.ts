export interface Quote {
  text: string;
  author: string;
  context?: string;
  date?: string;
  tags: string[];
}

const QUOTE_POOL: Quote[] = [
  {
    text: 'UCL to nie liga — tu jeden błąd kosztuje cię wszystko.',
    author: 'Jürgen Klopp',
    context: 'wywiad BT Sport',
    tags: ['ucl', 'presja', 'eliminacja'],
  },
  {
    text: 'Rewanż to osobny mecz. To co było, nie istnieje.',
    author: 'Carlo Ancelotti',
    context: 'przed rewanżem UCL',
    tags: ['rewanz', 'ucl', 'presja'],
  },
  {
    text: 'W Lidze Mistrzów nie masz prawa do złego dnia. Każdy dostaje dokładnie tyle szans, na ile zasłużył.',
    author: 'Pep Guardiola',
    context: 'konferencja Man City',
    tags: ['ucl', 'presja'],
  },
  {
    text: 'Kiedy słyszę hymn Ligi Mistrzów, włosy stają mi na karku. Po 20 latach tak samo.',
    author: 'Zinédine Zidane',
    context: 'wywiad Canal+',
    tags: ['ucl', 'emocje'],
  },
  {
    text: 'Taki mecz się pamięta przez całe życie. I tak samo pamiętają ci, którym strzeliliśmy.',
    author: 'Vinicius Jr.',
    context: 'po meczu Real Madryt w UCL',
    tags: ['ucl', 'zwyciestwo'],
  },
  {
    text: 'Drużyna, która boi się przegrać, nigdy nie wygra.',
    author: 'Johan Cruyff',
    tags: ['mentalnosc', 'zwyciestwo'],
  },
  {
    text: 'Futbol to gra prosty. 22 ludzi goni piłkę przez 90 minut, a na końcu wygrywają Niemcy.',
    author: 'Gary Lineker',
    tags: ['humor', 'klasyka'],
  },
  {
    text: 'Nie chodzi o pieniądze. Chodzi o puchary. Wygląda na to, że jest też o pieniądze.',
    author: 'Samuel Eto\'o',
    context: 'wywiad po transferze do Interu',
    tags: ['transfer', 'humor'],
  },
  {
    text: 'Presja? Presja to brak tlenu na szczycie K2. To jest tylko futbol.',
    author: 'Rafael Benítez',
    context: 'konferencja przed finałem w Stambule',
    tags: ['presja', 'ucl', 'mentalnosc'],
  },
  {
    text: 'Mogliśmy wygrać. Powinniśmy byli wygrać. Nie wygraliśmy.',
    author: 'Pep Guardiola',
    context: 'konferencja po meczu Man City',
    tags: ['porazka', 'presja'],
  },
  {
    text: 'Piłka nożna to gra dla drużyn, nie dla gwiazd. Dziś to pokazaliśmy.',
    author: 'Hansi Flick',
    context: 'po zwycięstwie FC Barcelony',
    tags: ['druzyna', 'zwyciestwo'],
  },
  {
    text: 'W tym klubie nie ma małych meczów. Są mecze i są finały.',
    author: 'Diego Simeone',
    context: 'konferencja Atletico',
    tags: ['mentalnosc', 'presja'],
  },
  {
    text: 'Jestem szczęśliwy z gola, ale szczęśliwszy z wygranej.',
    author: 'Erling Haaland',
    context: 'po meczu z Arsenal',
    tags: ['zwyciestwo', 'druzyna'],
  },
  {
    text: 'Nikt cię nie pamięta za to, jak pięknie przegrywałeś.',
    author: 'Cristiano Ronaldo',
    context: 'wywiad po zdobyciu Ligi Mistrzów',
    tags: ['ucl', 'zwyciestwo', 'mentalnosc'],
  },
  {
    text: 'W drugiej połowie zmieniliśmy styl. Bo w pierwszej nie mieliśmy żadnego.',
    author: 'Thomas Tuchel',
    context: 'konferencja Chelsea',
    tags: ['humor', 'taktyka'],
  },
  {
    text: 'Kiedy masz Messiego, masz plan A, plan B i plan C. Reszta to szczegóły.',
    author: 'Luis Enrique',
    context: 'wywiad po sezonie potrójnej korony',
    tags: ['taktyka', 'klasyka'],
  },
  {
    text: 'Nie czytam tego co piszą o mnie w mediach. Skupiam się na boisku.',
    author: 'Robert Lewandowski',
    context: 'wywiad dla FC Barcelona TV',
    tags: ['mentalnosc', 'polska'],
  },
  {
    text: 'Remis na wyjeździe to nie porażka. Ale wracamy do domu głodni.',
    author: 'Arne Slot',
    context: 'po meczu Liverpool w UCL',
    tags: ['ucl', 'rewanz', 'mentalnosc'],
  },
  {
    text: 'Przeciwnik miał plan. My mieliśmy lepszy plan. I Mbappé.',
    author: 'Didier Deschamps',
    context: 'konferencja po meczu Francji',
    tags: ['taktyka', 'zwyciestwo'],
  },
  {
    text: 'Każdy finał Ligi Mistrzów to osobna historia. Nie ma faworytów po pierwszym gwizdku.',
    author: 'Sir Alex Ferguson',
    context: 'wywiad ESPN',
    tags: ['ucl', 'presja', 'klasyka'],
  },
  {
    text: 'Gramy dla kibiców. Oni tu nie przyszli oglądać remisu.',
    author: 'Jürgen Klopp',
    context: 'po meczu na Anfield',
    tags: ['emocje', 'kibice'],
  },
  {
    text: 'Mówią, że jestem defensywny. Nie. Jestem skuteczny.',
    author: 'José Mourinho',
    context: 'konferencja Chelsea',
    tags: ['taktyka', 'humor', 'mentalnosc'],
  },
  {
    text: 'Trzy gole przewagi to najniebezpieczniejszy wynik w piłce. Pytajcie Barcelonę.',
    author: 'Jamie Carragher',
    context: 'komentarz po remontadzie',
    tags: ['ucl', 'rewanz', 'humor'],
  },
  {
    text: 'Wygrywamy jako drużyna, przegrywamy jako drużyna. Indywidualności zostawiamy szatnię.',
    author: 'Mikel Arteta',
    context: 'konferencja Arsenal',
    tags: ['druzyna', 'mentalnosc'],
  },
  // ── Klasycy i legendarni trenerzy ──────────────────────────────────
  {
    text: 'Piłka nożna to najprostsza gra, skomplikowana przez ludzi, którzy powinni wiedzieć lepiej.',
    author: 'Bill Shankly',
    tags: ['klasyka', 'humor'],
  },
  {
    text: 'Niektórzy uważają, że piłka to kwestia życia i śmierci. Jestem rozczarowany takim podejściem. To coś znacznie ważniejszego.',
    author: 'Bill Shankly',
    tags: ['klasyka', 'emocje', 'kibice'],
  },
  {
    text: 'Nie gram przeciwko drużynie. Gram przeciwko wynikowi.',
    author: 'Johan Cruyff',
    tags: ['taktyka', 'klasyka'],
  },
  {
    text: 'Zanim popełnisz błąd, ja go już przewidziałem.',
    author: 'Johan Cruyff',
    tags: ['taktyka', 'klasyka'],
  },
  {
    text: 'Piłka nożna to taniec z piłką. Trener to choreograf.',
    author: 'Arrigo Sacchi',
    tags: ['taktyka', 'klasyka'],
  },
  {
    text: 'Nie kupiłem Ronalda, żeby grał za obrońców.',
    author: 'Sir Alex Ferguson',
    context: 'wywiad Sky Sports',
    tags: ['taktyka', 'humor'],
  },
  {
    text: 'W szatni po porażce nie ma dźwięku gorszego niż cisza.',
    author: 'Sir Alex Ferguson',
    tags: ['porazka', 'mentalnosc'],
  },
  {
    text: 'Nic mnie nie dziwi w piłce. Poza tym, gdy ludzie mówią, że ich nic nie dziwi.',
    author: 'Arsène Wenger',
    tags: ['humor', 'klasyka'],
  },
  {
    text: 'Wolę przegrać pięknie niż wygrać brzydko? Nie. Wolę wygrywać. Ale pięknie.',
    author: 'Arsène Wenger',
    tags: ['taktyka', 'mentalnosc'],
  },
  {
    text: 'Każdy zawodnik ma plan, dopóki nie dostanie piłką w twarz.',
    author: 'Zlatan Ibrahimović',
    tags: ['humor', 'mentalnosc'],
  },
  {
    text: 'Lew nie musi mówić, że jest lwem.',
    author: 'Zlatan Ibrahimović',
    tags: ['humor', 'mentalnosc'],
  },
  {
    text: 'Nie jestem arogancki. Jestem pewny siebie. Duża różnica.',
    author: 'Zlatan Ibrahimović',
    tags: ['humor', 'mentalnosc'],
  },
  // ── Messi / Ronaldo / rywalizacja ──────────────────────────────────
  {
    text: 'Ronaldo jest najlepszy na świecie. Ale ja jestem Messi.',
    author: 'Lionel Messi',
    tags: ['humor', 'klasyka', 'rywalizacja'],
  },
  {
    text: 'Mam w nogach to, czego inni nie mają w głowach.',
    author: 'Lionel Messi',
    tags: ['mentalnosc', 'klasyka'],
  },
  {
    text: 'Kiedy strzelam, nie myślę. Kiedy myślę, nie strzelam.',
    author: 'Lionel Messi',
    tags: ['mentalnosc', 'klasyka'],
  },
  {
    text: 'Limity istnieją tylko w umysłach tych, którym brak wyobraźni.',
    author: 'Cristiano Ronaldo',
    tags: ['mentalnosc', 'klasyka'],
  },
  {
    text: 'Talent bez pracy to nic. Widziałem wielu utalentowanych, którzy nie osiągnęli nic.',
    author: 'Cristiano Ronaldo',
    tags: ['mentalnosc', 'klasyka'],
  },
  // ── Trenerzy współcześni ───────────────────────────────────────────
  {
    text: 'Nie trenuję drużyny, żeby nie przegrywała. Trenuję, żeby wygrywała.',
    author: 'Pep Guardiola',
    tags: ['taktyka', 'mentalnosc'],
  },
  {
    text: 'Piłka to ciągłe rozwiązywanie problemów. Kto rozwiązuje szybciej, ten wygrywa.',
    author: 'Pep Guardiola',
    tags: ['taktyka', 'mentalnosc'],
  },
  {
    text: 'Na boisku jestem trenerem, nie magiem. Cuda zostawiam kościołowi.',
    author: 'José Mourinho',
    context: 'konferencja prasowa',
    tags: ['humor', 'mentalnosc'],
  },
  {
    text: 'Jeśli mam piłkę, to przeciwnik nie może strzelić gola. Proste.',
    author: 'José Mourinho',
    tags: ['taktyka', 'humor'],
  },
  {
    text: 'Piłka to cierpienie. Pytanie tylko, kto cierpi dłużej — ty czy przeciwnik.',
    author: 'Diego Simeone',
    tags: ['mentalnosc', 'presja'],
  },
  {
    text: 'Wolę wygrać 1:0 w brzydkim meczu niż przegrać 4:5 w pięknym.',
    author: 'Diego Simeone',
    tags: ['taktyka', 'mentalnosc'],
  },
  {
    text: 'Moja drużyna wie, czego ode mnie oczekiwać. I wie, że ja oczekuję więcej.',
    author: 'Carlo Ancelotti',
    tags: ['mentalnosc', 'druzyna'],
  },
  {
    text: 'Brwi mówią za mnie. Reszta to wyniki.',
    author: 'Carlo Ancelotti',
    tags: ['humor', 'klasyka'],
  },
  {
    text: 'Heavy metal football. Jeśli tego nie lubisz, nie musisz oglądać.',
    author: 'Jürgen Klopp',
    context: 'wywiad po meczu Borussii Dortmund',
    tags: ['taktyka', 'emocje'],
  },
  {
    text: 'Nie potrzebujesz Ferraris. Potrzebujesz ludzi, którzy biegają jak diabli.',
    author: 'Jürgen Klopp',
    tags: ['druzyna', 'mentalnosc'],
  },
  {
    text: 'Wygraliśmy z najlepszymi piłkarzami? Nie. Wygraliśmy z najlepszą drużyną.',
    author: 'Jürgen Klopp',
    context: 'po finale UCL z Tottenhamem',
    tags: ['ucl', 'druzyna', 'zwyciestwo'],
  },
  // ── UCL / wielkie momenty ──────────────────────────────────────────
  {
    text: 'Stambuł. 0:3 do przerwy. Nikt nie wierzył. My wierzyliśmy.',
    author: 'Steven Gerrard',
    context: 'finał UCL 2005',
    date: '2005',
    tags: ['ucl', 'rewanz', 'emocje', 'klasyka'],
  },
  {
    text: 'Ten puchar jest za Barcelonę, za Katalanię, za wszystkich, którzy wierzyli.',
    author: 'Xavi Hernández',
    context: 'po zdobyciu UCL',
    tags: ['ucl', 'emocje', 'zwyciestwo'],
  },
  {
    text: 'Wembley było cicho po tym golu. Cały świat był cichy. Tylko my krzyczeli.',
    author: 'Didier Drogba',
    context: 'finał UCL 2012',
    date: '2012',
    tags: ['ucl', 'emocje', 'zwyciestwo'],
  },
  {
    text: 'W Lidze Mistrzów dostajesz to, na co zapracowałeś. Nie to, czego oczekujesz.',
    author: 'Zinédine Zidane',
    tags: ['ucl', 'mentalnosc'],
  },
  {
    text: 'Trzy z rzędu. Powiedzcie mi, kto zrobił to w dzisiejszym futbolu.',
    author: 'Sergio Ramos',
    context: 'po trzecim z rzędu finale UCL Real Madryt',
    date: '2018',
    tags: ['ucl', 'zwyciestwo', 'klasyka'],
  },
  {
    text: 'Ten gol Ramosa w 93. minucie zmienił historię Realu Madryt na kolejną dekadę.',
    author: 'Guillem Balagué',
    context: 'komentarz do finału UCL 2014',
    date: '2014',
    tags: ['ucl', 'emocje'],
  },
  {
    text: 'Corner taken quickly... ORIGI!',
    author: 'Peter Drury',
    context: 'komentarz Liverpool vs Barcelona, półfinał UCL',
    date: '2019',
    tags: ['ucl', 'rewanz', 'emocje', 'klasyka'],
  },
  {
    text: 'AGUEROOOO! Nie wierzę w to, co widzę!',
    author: 'Martin Tyler',
    context: 'komentarz do gola Agüero, PL 2012',
    date: '2012',
    tags: ['emocje', 'klasyka', 'premier-league'],
  },
  // ── Polski wątek ───────────────────────────────────────────────────
  {
    text: 'W Barcelonie gram z najlepszymi. Ale to nie znaczy, że ja jestem gorszy.',
    author: 'Robert Lewandowski',
    context: 'wywiad po transferze do FC Barcelony',
    tags: ['mentalnosc', 'polska'],
  },
  {
    text: 'Nie jestem typem gwiazdora. Jestem typem strzelca.',
    author: 'Robert Lewandowski',
    tags: ['mentalnosc', 'polska'],
  },
  {
    text: '5 goli w 9 minut? Sam nie wierzyłem, że to się dzieje.',
    author: 'Robert Lewandowski',
    context: 'po meczu Bayern vs Wolfsburg',
    date: '2015',
    tags: ['emocje', 'polska', 'klasyka'],
  },
  {
    text: 'Polska piłka potrzebuje cierpliwości. I ludzi, którzy naprawdę ją kochają.',
    author: 'Zbigniew Boniek',
    tags: ['polska', 'mentalnosc'],
  },
  {
    text: 'Piłkę gra się głową. Nogi to tylko narzędzia.',
    author: 'Kazimierz Deyna',
    tags: ['klasyka', 'polska', 'mentalnosc'],
  },
  {
    text: 'Na Wembley w 1973 byliśmy lepsi. Cały świat to widział.',
    author: 'Jan Tomaszewski',
    context: 'o meczu Anglia–Polska 1973',
    date: '1973',
    tags: ['klasyka', 'polska', 'emocje'],
  },
  // ── Piłkarze – różni ──────────────────────────────────────────────
  {
    text: 'Nie grasz przeciwko drużynom. Grasz przeciwko pomysłom.',
    author: 'Andrea Pirlo',
    tags: ['taktyka', 'klasyka'],
  },
  {
    text: 'Piłka to jak szachy, tylko szybciej i z większą publicznością.',
    author: 'Andrea Pirlo',
    tags: ['taktyka', 'humor'],
  },
  {
    text: 'Każdy gol jest ważny. Ale gole w ostatniej minucie są najważniejsze.',
    author: 'Ole Gunnar Solskjær',
    tags: ['emocje', 'zwyciestwo'],
  },
  {
    text: 'Futbol to jedyna dziedzina, w której opinia milionów ludzi nic nie zmienia w wyniku.',
    author: 'Jorge Valdano',
    tags: ['humor', 'klasyka'],
  },
  {
    text: 'Piłka jest okrągła. Mecz trwa 90 minut. Reszta to czysta teoria.',
    author: 'Sepp Herberger',
    tags: ['klasyka', 'humor'],
  },
  {
    text: 'Po meczu znaczenie ma tylko wynik. Styl zapominają po tygodniu.',
    author: 'Fabio Capello',
    tags: ['taktyka', 'mentalnosc'],
  },
  {
    text: 'Bramkarz to ostatnia linia obrony i pierwsza linia budowania akcji.',
    author: 'Manuel Neuer',
    tags: ['taktyka', 'mentalnosc'],
  },
  {
    text: 'Wyścig z Liverpoolem o tytuł nauczył mnie, czym naprawdę jest presja.',
    author: 'Pep Guardiola',
    context: 'po sezonie 2018/19 z 98 punktami',
    date: '2019',
    tags: ['premier-league', 'presja'],
  },
  {
    text: 'Każdy transfer to ryzyko. Każdy kontrakt to obietnica. Piłka to biznes, którym rządzą emocje.',
    author: 'Florentino Pérez',
    tags: ['transfer', 'mentalnosc'],
  },
  {
    text: 'Nie kupujesz zawodnika. Kupujesz rozwiązanie problemu.',
    author: 'Monchi',
    context: 'dyrektor sportowy Sevilli',
    tags: ['transfer', 'taktyka'],
  },
  {
    text: 'Derby to nie mecz. Derby to uczucie.',
    author: 'Francesco Totti',
    context: 'o derby Rzymu',
    tags: ['emocje', 'kibice'],
  },
  {
    text: 'Jedna banda. Jeden klub. Lazio a odpadnąć. To jest Roma.',
    author: 'Daniele De Rossi',
    context: 'derby di Roma',
    tags: ['emocje', 'kibice', 'humor'],
  },
  {
    text: 'Kiedy grasz na Old Trafford, czujesz historię w powietrzu. I ciśnienie.',
    author: 'Wayne Rooney',
    tags: ['emocje', 'klasyka'],
  },
  {
    text: 'Anfield w wieczór europejskiego pucharu. Nie ma nic piękniejszego w piłce.',
    author: 'Thierry Henry',
    tags: ['emocje', 'ucl', 'kibice'],
  },
  {
    text: 'Camp Nou milczy tylko wtedy, gdy przegrywamy. Reszta czasu to trzęsienie ziemi.',
    author: 'Andrés Iniesta',
    tags: ['emocje', 'kibice'],
  },
  {
    text: 'Ten gol zmienił wszystko. Moje życie, moją karierę, historię Hiszpanii.',
    author: 'Andrés Iniesta',
    context: 'o golu w finale MŚ 2010',
    date: '2010',
    tags: ['emocje', 'klasyka', 'zwyciestwo'],
  },
  // ── Porażki i odporność ────────────────────────────────────────────
  {
    text: 'Po porażce masz dwie opcje: siedzisz i płaczesz, albo wstajesz i trenujesz.',
    author: 'Kylian Mbappé',
    tags: ['mentalnosc', 'porazka'],
  },
  {
    text: 'Przegraliśmy finał. Ale nauczyłem się więcej niż z dziesięciu wygranych.',
    author: 'Luka Modrić',
    context: 'po finale MŚ 2018',
    date: '2018',
    tags: ['porazka', 'mentalnosc', 'klasyka'],
  },
  {
    text: 'Największe porażki rodzą największe zwycięstwa. Trzeba tylko przetrwać.',
    author: 'Gianluigi Buffon',
    tags: ['porazka', 'mentalnosc'],
  },
  {
    text: 'Nie wstydzę się łez po finale. Wstydziłbym się, gdybym nie dał z siebie wszystkiego.',
    author: 'Gianluigi Buffon',
    context: 'po przegranych finałach UCL',
    tags: ['ucl', 'porazka', 'emocje'],
  },
  {
    text: 'Przegrana 7:1 z Niemcami? To rana, która nigdy się nie zagoi.',
    author: 'David Luiz',
    context: 'MŚ 2014, Brazylia vs Niemcy',
    date: '2014',
    tags: ['porazka', 'emocje', 'klasyka'],
  },
  // ── Kibice i stadiony ──────────────────────────────────────────────
  {
    text: 'You\'ll Never Walk Alone to nie piosenka. To obietnica.',
    author: 'Jamie Carragher',
    context: 'o hymnie Liverpoolu',
    tags: ['kibice', 'emocje'],
  },
  {
    text: 'Kibice to dwunasty zawodnik. Ale potrafią być też trzynastym — po stronie przeciwnika.',
    author: 'Unai Emery',
    tags: ['kibice', 'presja'],
  },
  {
    text: 'Widziałem jak Signal Iduna Park zamienił porażkę 0:2 w zwycięstwo 3:2. Stadion grał za nas.',
    author: 'Mats Hummels',
    context: 'o atmosferze w Dortmundzie',
    tags: ['kibice', 'emocje', 'rewanz'],
  },
  // ── VAR / nowoczesna piłka ─────────────────────────────────────────
  {
    text: 'VAR zabija emocje? Nie. VAR zabija niesprawiedliwość.',
    author: 'Pierluigi Collina',
    tags: ['taktyka', 'mentalnosc'],
  },
  {
    text: 'W piłce dziś liczy się data. Statystyki. xG. Ale na końcu i tak liczy się gol.',
    author: 'Gary Neville',
    tags: ['taktyka', 'humor'],
  },
  {
    text: 'Mogę zaakceptować VAR. Nie mogę zaakceptować, gdy trwa to 4 minuty.',
    author: 'Jürgen Klopp',
    tags: ['humor', 'mentalnosc'],
  },
  // ── Premier League / angielski wątek ──────────────────────────────
  {
    text: 'Premier League to nie sprint i nie maraton. To 38 rund boksu.',
    author: 'Gary Neville',
    tags: ['premier-league', 'mentalnosc'],
  },
  {
    text: 'Boxing Day to serce angielskiej piłki. Reszta świata tego nie rozumie.',
    author: 'Alan Shearer',
    tags: ['premier-league', 'klasyka', 'emocje'],
  },
  {
    text: 'Leicester w 2016 to dowód, że piłka potrafi jeszcze zaskakiwać.',
    author: 'Gary Lineker',
    context: 'o mistrzostwie Leicesteru',
    date: '2016',
    tags: ['premier-league', 'emocje', 'klasyka'],
  },
  // ── La Liga / hiszpański wątek ─────────────────────────────────────
  {
    text: 'El Clásico to nie mecz. To trzęsienie ziemi, które trwa 90 minut.',
    author: 'Alfredo Di Stéfano',
    tags: ['klasyka', 'emocje'],
  },
  {
    text: 'Tiki-taka nie umarła. Ewoluowała.',
    author: 'Xavi Hernández',
    context: 'jako trener FC Barcelony',
    tags: ['taktyka', 'klasyka'],
  },
  {
    text: 'Bernabéu w wieczór Ligi Mistrzów nie ma sobie równych. Magia jest w powietrzu.',
    author: 'Karim Benzema',
    tags: ['ucl', 'emocje'],
  },
  // ── Serie A / włoski wątek ─────────────────────────────────────────
  {
    text: 'W Italii najpierw uczysz się bronić. Potem, jeśli masz talent, uczysz się atakować.',
    author: 'Paolo Maldini',
    tags: ['taktyka', 'klasyka'],
  },
  {
    text: 'Jeśli musiałem faulować, to znaczy, że już przegrałem pojedynek.',
    author: 'Paolo Maldini',
    tags: ['taktyka', 'klasyka', 'mentalnosc'],
  },
  {
    text: 'San Siro w wieczór derbów. 80 tysięcy ludzi. Połowa cię kocha, połowa chce twojej śmierci.',
    author: 'Marco Materazzi',
    tags: ['emocje', 'kibice'],
  },
  // ── Bundesliga ─────────────────────────────────────────────────────
  {
    text: 'Żółta ściana. 25 tysięcy ludzi na jednej trybunie. Nie ma nic potężniejszego.',
    author: 'Marco Reus',
    context: 'o Südtribüne w Dortmundzie',
    tags: ['kibice', 'emocje'],
  },
  {
    text: 'W Niemczech futbol to nie rozrywka. To styl życia.',
    author: 'Thomas Müller',
    tags: ['emocje', 'klasyka'],
  },
  // ── Filozofia / ogólne ─────────────────────────────────────────────
  {
    text: 'Piłka to jedyny sport, gdzie możesz dominować 89 minut i przegrać w 90.',
    author: 'Pep Guardiola',
    tags: ['mentalnosc', 'presja'],
  },
  {
    text: 'W piłce nie wygrywa lepszy. Wygrywa ten, kto popełni mniej błędów.',
    author: 'Giovanni Trapattoni',
    tags: ['taktyka', 'klasyka'],
  },
  {
    text: 'Piłka daje ci wszystko, jeśli traktujesz ją poważnie. I zabiera wszystko, jeśli nie.',
    author: 'Ronaldinho',
    tags: ['mentalnosc', 'klasyka'],
  },
  {
    text: 'Na boisku nie ma bogatych i biednych. Jest tylko piłka i 22 ludzi, którzy ją chcą.',
    author: 'Pelé',
    tags: ['klasyka', 'emocje'],
  },
  {
    text: 'Piłka jest prosta: bądź szybszy, mądrzejszy i bardziej głodny niż rywal.',
    author: 'Thierry Henry',
    tags: ['mentalnosc', 'taktyka'],
  },
  {
    text: 'Każdy trener ma filozofię. Pytanie, czy drużyna w nią wierzy.',
    author: 'Marcelo Bielsa',
    tags: ['taktyka', 'mentalnosc'],
  },
  {
    text: 'Nie odpoczywam po zwycięstwie. Odpoczywam po sezonie. A potem zaczynam od nowa.',
    author: 'Marcelo Bielsa',
    tags: ['mentalnosc', 'presja'],
  },
];

/**
 * Pick quotes for today with optional tag-based priority.
 * priorityTags: if UCL day, pass ['ucl','rewanz','presja'] etc.
 */
export function getDailyQuotes(count = 4, priorityTags: string[] = []): Quote[] {
  const day = Math.floor(Date.now() / 86400000);

  if (priorityTags.length > 0) {
    // Score quotes by tag overlap
    const scored = QUOTE_POOL.map((q, idx) => {
      const overlap = q.tags.filter((t) => priorityTags.includes(t)).length;
      return { q, idx, overlap };
    });
    // Sort: highest overlap first, then deterministic shuffle
    scored.sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return ((a.idx + day) % QUOTE_POOL.length) - ((b.idx + day) % QUOTE_POOL.length);
    });
    return scored.slice(0, count).map((s) => s.q);
  }

  // Default: rotate through pool
  const start = (day * count) % QUOTE_POOL.length;
  const result: Quote[] = [];
  for (let i = 0; i < count; i++) {
    result.push(QUOTE_POOL[(start + i) % QUOTE_POOL.length]);
  }
  return result;
}
