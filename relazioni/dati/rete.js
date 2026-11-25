/*
 * Rete delle disposizioni da cui dipendono le misure d'esame dell'art. 16 L. 104/1992.
 * Ogni arco dichiara tipo, stato e fonte. Nessun arco è stato aggiunto senza una fonte.
 *  - rinvio:    rinvio esplicito nel testo vigente, riconosciuto dal primo prototipo e riletto a mano
 *  - modifica:  intervento di un atto su una disposizione, da Normattiva
 *  - percorso:  relazione ricostruita a mano dal percorso dello studente, su fonti documentali [P]
 * Direzione: dall'atto o disposizione che cita, modifica o rende possibile, verso quella richiamata,
 * modificata o resa accessibile.
 * Le coordinate x, y servono solo al disegno.
 */
(function (root) {
  var RETE = {
    versione: '0.1 · 23 novembre 2026',
    nodi: [
      { id: 'l17', etichetta: 'L. 17/1999, art. 1', gruppo: 'mod', x: 930, y: 300, testo: 'testo acquisito (testo/dati/l17-1999-art1.txt)' },
      { id: 'dl44', etichetta: 'D.L. 44/2023, art. 19, c. 5-bis', gruppo: 'mod', x: 930, y: 400, testo: 'pannello aggiornamenti dell\'art. 16' },
      { id: 'l74', etichetta: 'L. 74/2023, art. 1, c. 1', gruppo: 'mod', x: 930, y: 520, testo: 'pannello aggiornamenti dell\'art. 16' },
      { id: '16.1', etichetta: 'art. 16, c. 1', gruppo: 'a16', x: 430, y: 70, testo: 'testo vigente' },
      { id: '16.2', etichetta: 'art. 16, c. 2', gruppo: 'a16', x: 430, y: 150, testo: 'testo vigente' },
      { id: '16.3', etichetta: 'art. 16, c. 3', gruppo: 'a16', x: 430, y: 230, testo: 'testo vigente' },
      { id: '16.4', etichetta: 'art. 16, c. 4', gruppo: 'a16', x: 430, y: 310, testo: 'testo vigente' },
      { id: '16.5', etichetta: 'art. 16, c. 5', gruppo: 'a16', x: 430, y: 400, testo: 'testo vigente' },
      { id: '16.5bis', etichetta: 'art. 16, c. 5-bis', gruppo: 'a16', x: 430, y: 500, testo: 'testo vigente' },
      { id: '13.1b', etichetta: 'art. 13, c. 1, lett. b)', gruppo: 'a13', x: 680, y: 150, testo: 'testo vigente' },
      { id: '13.6bis', etichetta: 'art. 13, c. 6-bis', gruppo: 'a13', x: 680, y: 300, testo: 'testo vigente' },
      { id: '3', etichetta: 'art. 3 l. 104/1992', gruppo: 'perc', x: 160, y: 70, testo: 'testo vigente' },
      { id: '4', etichetta: 'art. 4 l. 104/1992', gruppo: 'perc', x: 160, y: 190, testo: 'testo vigente' },
      { id: 'l295', etichetta: 'L. 295/1990, art. 1', gruppo: 'perc', x: 160, y: 300, testo: 'non acquisito' },
      { id: 'l80', etichetta: 'D.L. 4/2006, art. 6, c. 3-bis', gruppo: 'perc', x: 160, y: 410, testo: 'comma aggiunto dalla L. 80/2006 in sede di conversione; testo acquisito (testo/dati/dl4-2006-art6-c3bis.txt)' },
      { id: 'l118', etichetta: 'L. 118/1971', gruppo: 'perc', x: 160, y: 520, testo: 'non acquisito' }
    ],
    archi: [
      { da: '16.2', a: '16.1', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"di cui al comma 1"', fonte: 'art. 16, c. 2, testo vigente' },
      { da: '16.5', a: '16.3', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"previsto dai commi 3 e 4"', fonte: 'art. 16, c. 5, testo vigente' },
      { da: '16.5', a: '16.4', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"previsto dai commi 3 e 4"', fonte: 'art. 16, c. 5, testo vigente' },
      { da: '16.5', a: '13.6bis', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"servizio di tutorato di cui all\'articolo 13, comma 6-bis"', fonte: 'art. 16, c. 5, testo vigente' },
      { da: '13.6bis', a: '13.1b', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"convenzioni di cui alla lettera b) del comma 1"', fonte: 'art. 13, c. 6-bis, testo vigente' },
      { da: '13.6bis', a: '16.5', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"ai commi 5 e 5-bis dell\'articolo 16"', fonte: 'art. 13, c. 6-bis, testo vigente' },
      { da: '13.6bis', a: '16.5bis', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"ai commi 5 e 5-bis dell\'articolo 16"', fonte: 'art. 13, c. 6-bis, testo vigente' },
      { da: '4', a: '3', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"di cui all\'articolo 3"', fonte: 'art. 4, testo vigente' },
      { da: '4', a: 'l295', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"commissioni mediche di cui all\'articolo 1 della legge 15 ottobre 1990, n. 295"', fonte: 'art. 4, testo vigente' },
      { da: 'l80', a: '4', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"commissioni mediche di cui [...] all\'articolo 4 della legge 5 febbraio 1992, n. 104"', fonte: 'D.L. 4/2006, art. 6, c. 3-bis' },
      { da: 'l80', a: 'l295', tipo: 'rinvio', stato: 'verificato sul testo', evidenza: '"commissioni mediche di cui all\'articolo 1 della legge 15 ottobre 1990, n. 295" e "articolo 1, comma 7" della stessa legge', fonte: 'D.L. 4/2006, art. 6, c. 3-bis' },
      { da: 'l17', a: '13.6bis', tipo: 'modifica', stato: 'verificato sul testo', evidenza: 'aggiunge il comma 6-bis', fonte: 'L. 17/1999, art. 1, c. 1, testo acquisito' },
      { da: 'l17', a: '16.5', tipo: 'modifica', stato: 'verificato sul testo', evidenza: 'sostituisce il comma 5', fonte: 'L. 17/1999, art. 1, c. 2, testo acquisito' },
      { da: 'l17', a: '16.5bis', tipo: 'modifica', stato: 'verificato sul testo', evidenza: 'aggiunge il comma 5-bis', fonte: 'L. 17/1999, art. 1, c. 3, testo acquisito' },
      { da: 'dl44', a: '16.5bis', tipo: 'modifica', stato: 'nota Normattiva', evidenza: 'modifica il comma 5-bis', fonte: 'Normattiva, aggiornamenti all\'art. 16, n. 1 (22/04/2023)' },
      { da: 'l74', a: 'dl44', tipo: 'modifica', stato: 'nota Normattiva', evidenza: 'converte con modificazioni il D.L. 44/2023', fonte: 'Normattiva, aggiornamenti all\'art. 16, n. 2 (21/06/2023)' },
      { da: '4', a: '16.5', tipo: 'percorso', stato: 'ricostruzione [P]', evidenza: 'la certificazione della l. 104/1992 dà accesso ai servizi e alle misure d\'esame', fonte: 'Linee guida CNUDD 2024, p. 11, nota 8; Guida Unisannio, p. 6' },
      { da: 'l118', a: '16.5', tipo: 'percorso', stato: 'ricostruzione [P]', evidenza: 'anche l\'invalidità civile della l. 118/1971 dà accesso ai servizi', fonte: 'Linee guida CNUDD 2024, p. 11, nota 8; Guida Unisannio, p. 6' },
      { da: '16.5bis', a: '16.5', tipo: 'percorso', stato: 'ricostruzione [P]', evidenza: 'il docente delegato media tra studenti e docenti', fonte: 'Linee guida CNUDD 2024, p. 10; Guida Unisannio, p. 8' }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = RETE;
  else root.RETE = RETE;
})(this);
