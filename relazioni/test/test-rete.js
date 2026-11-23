/*
 * Verifica della rete: ogni arco "rinvio" deve corrispondere a un rinvio che il primo
 * prototipo riconosce nei testi salvati, e viceversa dentro il perimetro.
 * Esecuzione: node relazioni/test/test-rete.js
 */
var fs = require('fs'), path = require('path');
var A = require('../../testo/analisi.js');
var RETE = require('../dati/rete.js');
var ok = 0, ko = 0;
function verifica(nome, ottenuto, atteso) {
  var esito = JSON.stringify(ottenuto) === JSON.stringify(atteso);
  if (esito) ok++; else ko++;
  console.log((esito ? 'OK  ' : 'ERR ') + nome + (esito ? '' : '\n     atteso: ' + JSON.stringify(atteso) + '\n     ottenuto: ' + JSON.stringify(ottenuto)));
}
function leggi(f) { return A.analizza(fs.readFileSync(path.join(__dirname, '..', '..', 'testo', 'dati', f), 'utf8')); }

var ids = RETE.nodi.map(function (n) { return n.id; });
verifica('ogni arco collega nodi esistenti', RETE.archi.filter(function (e) { return ids.indexOf(e.da) === -1 || ids.indexOf(e.a) === -1; }), []);
verifica('ogni arco ha tipo, stato, evidenza e fonte', RETE.archi.filter(function (e) { return !(e.tipo && e.stato && e.evidenza && e.fonte); }), []);
verifica('nessun arco doppio', RETE.archi.length, RETE.archi.map(function (e) { return e.tipo + e.da + '>' + e.a; }).filter(function (k, i, a) { return a.indexOf(k) === i; }).length);

// Rinvii estratti dal primo prototipo, tradotti nei nodi della rete
var estratti = [];
var a16 = leggi('l104-art16-vigente.txt'), a13 = leggi('l104-art13-vigente.txt'), a4 = leggi('l104-art4-vigente.txt');
a16.relazioni.interne.forEach(function (e) { estratti.push('16.' + e.da + '>16.' + e.a); });
a16.relazioni.altriArticoli.forEach(function (x) { if (/articolo 13, comma 6-bis/.test(x.testo)) estratti.push('16.' + x.da + '>13.6bis'); });
a13.commi.filter(function (c) { return c.numero === '6-bis'; })[0].rinvii.forEach(function (r) {
  if (/lettera b\) del comma 1/.test(r.testo)) estratti.push('13.6bis>13.1b');
  if (/commi 5 e 5-bis dell'articolo 16/.test(r.testo)) { estratti.push('13.6bis>16.5'); estratti.push('13.6bis>16.5bis'); }
});
a4.relazioni.altriArticoli.forEach(function (x) { if (x.testo === 'articolo 3') estratti.push('4>3'); });
a4.relazioni.atti.forEach(function (x) { if (x.etichetta === 'l. 295/1990') estratti.push('4>l295'); });
var dichiarati = RETE.archi.filter(function (e) { return e.tipo === 'rinvio'; }).map(function (e) { return (e.da + '>' + e.a).replace(/^16\.5bis/, '16.5-bis'); });
function norm(xs) { return xs.map(function (k) { return k.replace('16.5-bis', '16.5bis'); }).sort(); }
verifica('archi "rinvio" = rinvii estratti dai testi (perimetro)', norm(dichiarati), norm(estratti));
verifica('9 rinvii espliciti', dichiarati.length, 9);

console.log('\n' + ok + ' superati, ' + ko + ' falliti');
if (ko) process.exitCode = 1;
