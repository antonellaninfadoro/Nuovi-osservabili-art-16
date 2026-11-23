/*
 * Test del codice del laboratorio A.
 * Le stringhe qui sotto sono STRINGHE DI PROVA costruite per controllare il
 * funzionamento degli algoritmi. Non sono testi normativi e non producono
 * risultati empirici. Esecuzione: node testo/test/test-analisi.js
 */
var A = require('../analisi.js');
var ok = 0, ko = 0;
function verifica(nome, ottenuto, atteso) {
  var esito = JSON.stringify(ottenuto) === JSON.stringify(atteso);
  if (esito) ok++; else ko++;
  console.log((esito ? 'OK  ' : 'ERR ') + nome + (esito ? '' : '\n     atteso: ' + JSON.stringify(atteso) + '\n     ottenuto: ' + JSON.stringify(ottenuto)));
}

// Frasi: il punto fermo chiude la frase
verifica('due frasi semplici', A.frasi('Il cane dorme. Il gatto mangia.').length, 2);
// Abbreviazioni: "art." e "n." non chiudono la frase
verifica('abbreviazioni art. e n.', A.frasi('Si applica l\'art. 3 della legge n. 10. Il resto vale.').length, 2);
// Punto seguito da minuscola: non e' fine frase
verifica('punto seguito da minuscola', A.frasi('Vedi lett. a) del comma. Fine.').length, 2);
// Testo senza punto finale: conta comunque come una frase
verifica('frase senza punto finale', A.frasi('Testo senza punto').length, 1);

// Parole e lettere: l'apostrofo separa
verifica('conteggio parole/lettere', A.conta("dell'articolo 33"), { parole: 3, lettere: 4 + 8 + 2 });

// Gulpease calcolato a mano: "Il cane dorme." -> P=3, L=2+4+5=11, F=1
// G = 89 + (300*1 - 10*11)/3 = 89 + 190/3 = 152.333...
verifica('Gulpease a mano', Math.round(A.gulpease(3, 11, 1) * 1000) / 1000, 152.333);

// Rinvii
function tipi(t) { return A.rinvii(t).map(function (r) { return r.tipo + ':' + r.testo; }); }
verifica('rinvio esterno con data e numero',
  tipi("di cui all'articolo 3, comma 1, della legge 8 marzo 2000, n. 53, si applica"),
  ['esterno:articolo 3, comma 1, della legge 8 marzo 2000, n. 53']);
verifica('rinvio interno presunto', tipi('ai sensi del comma 3 si provvede'), ['interno-presunto:comma 3']);
verifica('rinvio alla presente legge', tipi("previsti dall'articolo 4 della presente legge"), ['interno:articolo 4 della presente legge']);
verifica('rinvio a codice', tipi("ai sensi dell'articolo 2043 del codice civile"), ['esterno:articolo 2043 del codice civile']);
verifica('elenco di commi', tipi('dei commi 1 e 2'), ['interno-presunto:commi 1 e 2']);
verifica('nessun rinvio in "numero di giorni"', tipi('il numero di giorni e la lettera inviata'), []);

// Riferimenti relativi
verifica('comma precedente', A.relativi('di cui al comma precedente').map(function (x) { return x.testo; }), ['comma precedente']);
verifica('successivo articolo', A.relativi('il successivo articolo dispone').map(function (x) { return x.testo; }), ['successivo articolo']);

// Struttura in formato Normattiva (stringa di prova)
var prova = 'Art. 1\n\n(Prova).\n\n1. Testo uno.\n2. Testo due:\na) primo elemento;\nb) secondo elemento.\n3. ((COMMA ABROGATO DALLA L. 1/2000)).\n\nAGGIORNAMENTO (1)\nNota da escludere.';
var r = A.analizza(prova);
verifica('numero articolo', r.articolo, '1');
verifica('rubrica', r.rubrica, 'Prova');
verifica('numeri dei commi', r.commi.map(function (c) { return c.numero; }), ['1', '2', '3']);
verifica('lettere nel comma 2', r.commi[1].lettere, ['a)', 'b)']);
verifica('comma abrogato riconosciuto', r.commi[2].abrogato, true);
verifica('segmenti modificati (( ))', r.modificati, 1);
verifica('frasi esclusi abrogati', r.totali.frasi, 2);
verifica('nota AGGIORNAMENTO esclusa', r.commi[2].testo.indexOf('Nota') === -1, true);

// comma con suffisso latino
verifica('comma 3-bis', A.struttura('Art. 2\n(X).\n3-bis. Testo.').commi[0].numero, '3-bis');

// ---- Testo reale: art. 16 L. 104/1992, dati/l104-art16-vigente.txt ----
// Valori attesi contati a mano sul testo vigente al 22/11/2026.
var fs = require('fs'), path = require('path');
var art16 = A.analizza(fs.readFileSync(path.join(__dirname, '..', 'dati', 'l104-art16-vigente.txt'), 'utf8'));
function cm(n) { return art16.commi.filter(function (c) { return c.numero === n; })[0]; }
verifica('art. 16: rubrica', art16.rubrica, 'Valutazione del rendimento e prove d\'esame');
verifica('art. 16: commi', art16.commi.map(function (c) { return c.numero; }), ['1', '2', '3', '4', '5', '5-bis']);
verifica('art. 16: comma 4 a mano (P, L, F)', [cm('4').parole, cm('4').caratteri, cm('4').frasi.length], [26, 158, 1]);
verifica('art. 16: comma 4 Gulpease 39,77', cm('4').gulpease.toFixed(2), '39.77');
verifica('art. 16: comma 5 ha 2 periodi (45 e 30 parole)', cm('5').frasi.map(function (f) { return f.parole; }), [45, 30]);
verifica('art. 16: 3 rinvii riconosciuti', art16.totali.rinvii, 3);
verifica('art. 16: rinvii fra commi', art16.relazioni.interne.map(function (e) { return e.da + '>' + e.a; }), ['2>1', '5>3', '5>4']);
verifica('art. 16: rinvio ad altro articolo della legge', art16.relazioni.altriArticoli.map(function (x) { return x.da + ': ' + x.testo; }), ['5: articolo 13, comma 6-bis']);
verifica('art. 16: nessun atto esterno', art16.relazioni.atti.length, 0);
verifica('art. 16: comma marcato (( )) da Normattiva', art16.commi.filter(function (c) { return c.modificato; }).map(function (c) { return c.numero; }), ['5-bis']);
verifica('art. 16: regola 4a da verificare a mano', art16.regolarita.filter(function (e) { return e.regola === '4a'; })[0].esito, 'da verificare');
verifica('elenco di leggi al plurale', tipi('quanto previsto dalle leggi 11 maggio 1976, n. 360, e 4 agosto 1977, n. 517, e successive'),
  ['esterno:legge 11 maggio 1976, n. 360', 'esterno:legge 4 agosto 1977, n. 517']);
// Art. 13 (testo inviato da Antonella il 23/11/2026): rinvii riletti a mano
var art13 = A.analizza(fs.readFileSync(path.join(__dirname, '..', 'dati', 'l104-art13-vigente.txt'), 'utf8'));
verifica('art. 13: commi', art13.commi.map(function (c) { return c.numero; }), ['1', '2', '3', '4', '5', '6', '6-bis']);
verifica('art. 13: atti esterni', art13.relazioni.atti.map(function (a) { return a.etichetta + ' [' + a.commi.join(',') + ']'; }),
  ['l. 360/1976 [1]', 'l. 517/1977 [1]', 'l. 142/1990 [1]', 'd.P.R. 419/1974 [1]', 'd.P.R. 616/1977 [3]']);
verifica('art. 13: rinvio di ritorno all\'art. 16', art13.relazioni.altriArticoli.map(function (x) { return x.da + ': ' + x.testo; }),
  ['4: articolo 42, comma 6, lettera h)', '6-bis: commi 5 e 5-bis dell\'articolo 16']);
verifica('sequenza commi irregolare', A.regolarita(A.analizza('Art. 1\n(X).\n1. Uno.\n3. Tre.\n')).filter(function (e) { return e.regola === '10b'; })[0].esito, 'scostamento');
verifica('"e/o" segnalato', A.regolarita(A.analizza('Art. 1\n(X).\n1. Il padre e/o la madre.\n')).filter(function (e) { return e.regola === '4f'; })[0].esito, 'scostamento');

// Art. 3 (testo inviato da Antonella il 4/11/2026), comma 2 contato a mano
var art3 = A.analizza(fs.readFileSync(path.join(__dirname, '..', 'dati', 'l104-art3-vigente.txt'), 'utf8'));
verifica('art. 3: rubrica e commi', [art3.rubrica, art3.commi.map(function (c) { return c.numero; }).join(',')], ['Soggetti aventi diritto', '1,2,3,4']);
verifica('art. 3: comma 2 a mano (P, L, F)', [art3.commi[1].parole, art3.commi[1].caratteri, art3.commi[1].frasi.length], [31, 198, 1]);
verifica('art. 3: comma 2 Gulpease 34,81', art3.commi[1].gulpease.toFixed(2), '34.81');
verifica('art. 3: designazione "persona handicappata"', art3.terminologia.forme.map(function (f) { return f.forma + ' ' + f.n; }), ['persona handicappata 2']);

// Art. 4 (testo inviato da Antonella il 4/11/2026), contato a mano
var art4 = A.analizza(fs.readFileSync(path.join(__dirname, '..', 'dati', 'l104-art4-vigente.txt'), 'utf8'));
verifica('art. 4: un comma, un periodo di 68 parole', [art4.commi.length, art4.totali.frasi, art4.totali.parole], [1, 1, 68]);
verifica('art. 4: Gulpease 38,12', art4.totali.gulpease.toFixed(2), '38.12');
verifica('art. 4: rinvii (art. 3; l. 295/1990)', [art4.relazioni.altriArticoli[0].testo, art4.relazioni.atti[0].etichetta], ['articolo 3', 'l. 295/1990']);

// Correzione del 4/11/2026: l'anno non va preso dal numero dell'atto
verifica('anno dalla data, numero a 4 cifre', A.estremiAtto('art. 7 della legge 30 dicembre 1971, n. 1204').etichetta, 'l. 1204/1971');
verifica('anno da "del"', A.estremiAtto('art. 7 della legge n. 1204 del 1971').etichetta, 'l. 1204/1971');

console.log('\n' + ok + ' superati, ' + ko + ' falliti');
process.exit(ko ? 1 : 0);
