// Test del terzo prototipo: node effetti/test/test-sim.js
var SIM = require('../simulazione.js');
var ok = 0, ko = 0;
function verifica(nome, cond, info) { if (cond) { ok++; console.log('OK   ' + nome); } else { ko++; console.log('FAIL ' + nome + (info ? ' · ' + info : '')); } }
function copia(P) { return JSON.parse(JSON.stringify(P)); }

// 1. Stesso seme, stessi risultati
var a = SIM.simula({ profilo: 'nuova', appello: 60, leve: { A: 1 } }), b = SIM.simula({ profilo: 'nuova', appello: 60, leve: { A: 1 } });
verifica('stesso seme, stessi risultati', JSON.stringify(a) === JSON.stringify(b));
var c = SIM.simula({ profilo: 'nuova', appello: 60, leve: { A: 1 }, seme: 7 });
verifica('seme diverso, risultati diversi', JSON.stringify(a) !== JSON.stringify(c));

// 2. Caso limite: tutto certo e immediato → tutte le componenti al massimo
var P = copia(SIM.PARAMETRI);
P.pSa.v = 1; P.pDomanda.v = 1; P.commissione.v = [0, 0.0001, 0.0002]; P.servizio.v = [0, 0]; P.pRisponde.v = 1; P.tempoDocente.v = [0, 0]; P.esitoDocente.v = [1, 0];
var r = SIM.simula({ profilo: 'nuova', appello: 30, parametri: P });
verifica('caso limite: accesso, tempestività, completezza, certezza = 1', [r.accesso, r.tempestivita, r.completezza, r.certezza].every(function (x) { return x === 1; }), JSON.stringify([r.accesso, r.tempestivita, r.completezza, r.certezza]));
verifica('caso limite: costo quasi nullo', r.costo < 0.01, r.costo);

// 3. Caso limite opposto: nessun docente risponde, nessuna leva → nessuna misura
P = copia(SIM.PARAMETRI); P.pRisponde.v = 0;
r = SIM.simula({ profilo: 'verbale', appello: 60, parametri: P });
verifica('nessun docente risponde: accesso 0', r.accesso === 0 && r.tempestivita === 0);
r = SIM.simula({ profilo: 'verbale', appello: 60, parametri: P, leve: { B: 1 } });
verifica('nessun docente risponde, leva B: il delegato decide', r.accesso > 0.9);

// 4. L'imbuto non cresce da una tappa alla successiva
['nuova', 'verbale'].forEach(function (pr) {
  [30, 60, 120].forEach(function (T) {
    var q = SIM.simula({ profilo: pr, appello: T }).imbuto.map(function (t) { return t.q; });
    verifica('imbuto decrescente · ' + pr + ' · ' + T + ' giorni', q.every(function (x, i) { return i === 0 || x <= q[i - 1] + 1e-12; }), q.join(' '));
  });
});

// 5. Nessuna leva, da sola, riduce l'accesso
['nuova', 'verbale'].forEach(function (pr) {
  [30, 60, 120, 180].forEach(function (T) {
    var base = SIM.simula({ profilo: pr, appello: T }).accesso;
    ['A', 'B', 'C', 'D'].forEach(function (l) {
      var lv = {}; lv[l] = 1;
      var x = SIM.simula({ profilo: pr, appello: T, leve: lv }).accesso;
      verifica('leva ' + l + ' non riduce l\'accesso · ' + pr + ' · ' + T, x >= base - 1e-12, base + ' → ' + x);
    });
  });
});

// 6. La leva A non cambia nulla per chi ha già il verbale
var v0 = SIM.simula({ profilo: 'verbale', appello: 60 }), vA = SIM.simula({ profilo: 'verbale', appello: 60, leve: { A: 1 } });
verifica('leva A neutra con il verbale già riconosciuto', JSON.stringify(v0) === JSON.stringify(vA));

console.log(ok + ' superati, ' + ko + ' falliti');
if (ko) process.exit(1);
