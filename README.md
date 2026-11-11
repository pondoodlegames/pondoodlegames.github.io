# pondoodlegames.github.io

Strona Pondoodle Games na GitHub Pages: polityki prywatności wszystkich gier pod jednym adresem.

- `https://pondoodlegames.github.io/privacy/kapibara-wars/`
- `https://pondoodlegames.github.io/privacy/plac-zabaw/`
- `https://pondoodlegames.github.io/privacy/spokoj/`
- `https://pondoodlegames.github.io/privacy/kapibary-na-kolkach/`

Strony pomocy (źródła w `src/help/<gra>.<język>.md`, jedna strona na język):

- `https://pondoodlegames.github.io/kapibary-na-kolkach/pomoc/`
- `https://pondoodlegames.github.io/kapibary-na-kolkach/help/`

Treść zmienia się w `src/<gra>.md` (po angielsku i po polsku), potem `node build.mjs`, commit i push. Polityka musi się zgadzać z deklaracjami w sklepach (`docs/store/DATA_SAFETY.md` w projekcie gry) i z kodem: jeśli gra zacznie cokolwiek wysyłać, najpierw zmieniamy politykę.

Strony nie ładują nic z zewnątrz: bez krojów z sieci, skryptów, ciasteczek i liczników. Adresy w `slug` są niezależne od tytułów gier, które mogą się jeszcze zmienić.
