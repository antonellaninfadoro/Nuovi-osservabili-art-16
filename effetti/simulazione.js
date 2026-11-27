/* Terzo prototipo: simulazione del percorso dello studente (prima versione, 27 novembre 2026).
 *
 * Esperimento illustrativo, non calibrato né validato. Ogni studente simulato attraversa i passaggi
 * del percorso fino al primo appello; ogni passaggio ha un tempo e una probabilità. I valori sono
 * ipotesi esplicite: per ciascuno PARAMETRI indica l'etichetta ([F] fonte, [A] adattamento da
 * fonte o intervista, [P] proposta) e la provenienza.
 *
 * Nessuna dipendenza: funziona nel browser (window.SIM) e in node (module.exports).
 */
(function (radice) {
  'use strict';

  // Generatore pseudo-casuale con seme (mulberry32): stessi parametri e stesso seme, stessi risultati.
  function generatore(seme) {
    var a = seme >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function uniforme(r, a, b) { return a + (b - a) * r(); }
  function triangolare(r, a, m, b) {
    var u = r(), c = (m - a) / (b - a);
    return u < c ? a + Math.sqrt(u * (b - a) * (m - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - m));
  }

  var PARAMETRI = {
    pSa:            { v: 0.5,  et: '[P]', fonte: 'Nessun dato. Interviste: lo studente con disabilità motoria ha saputo del 30% di tempo in più dopo oltre 6 mesi.' },
    ritardoInfo:    { v: [30, 180], et: '[A]', fonte: 'Interviste (scoperta dopo mesi); intervallo in giorni.' },
    pDomanda:       { v: 0.8, et: '[A]', fonte: 'Interviste: 4 dei 5 casi oncologici hanno chiesto l\'accertamento; una studentessa no, per timore per l\'adozione.' },
    commissione:    { v: [15, 67, 121], et: '[A]', fonte: 'Minimo: 15 giorni per le patologie oncologiche (D.L. 4/2006, art. 6, c. 3-bis). Valore più probabile e massimo: tempi medi 67 e 121 giorni (Agenas 2022). Distribuzione triangolare.' },
    servizio:       { v: [3, 28], et: '[A]', fonte: 'Interviste: risposta del servizio da meno di una settimana a 4 settimane.' },
    nEsami:         { v: 3, et: '[A]', fonte: 'Interviste: 3, 4 e 2 esami con misure chieste.' },
    pRisponde:      { v: 0.7, et: '[P]', fonte: 'Interviste: in tutti i casi il percorso si è fermato sull\'intesa con i docenti (rifiuti o ritardi).' },
    tempoDocente:   { v: [7, 14], et: '[A]', fonte: 'Interviste: i docenti rispondono in 1-2 settimane.' },
    esitoDocente:   { v: [0.6, 0.3], et: '[P]', fonte: 'Probabilità di misure complete e parziali quando il docente risponde; il resto è un rifiuto. Interviste: misure ottenute "tutte", "alcune", "nessuna".' },
    pDiscrezione:   { v: 0.5, et: '[P]', fonte: 'Senza verbale l\'ateneo "può" tenere conto della condizione medica (CNUDD 2024, pp. 21-22; Guida Unisannio, pp. 6-7). Nessun dato sulla frequenza.' },
    anticipo:       { v: 7, et: '[P]', fonte: 'Giorni minimi prima dell\'esame per dire che lo studente "sa per tempo".' },
    orizzonte:      { v: 365, et: '[P]', fonte: 'Giorni entro cui si osserva l\'accesso.' },
    // Leve
    provvisorio:    { v: [45, 3, 10], et: '[F]/[P]', fonte: 'Leva A. Dopo 45 giorni senza pronuncia l\'accertamento provvisorio è fatto da un medico specialista (D.L. 324/1993, art. 2, c. 2, oggi "ai soli fini" degli artt. 21 e 33). Proposta: estenderlo all\'art. 16. Tempi del provvisorio (3-10 giorni) [P].' },
    delegato:       { v: [14, 1, 5, 0.9], et: '[P]', fonte: 'Leva B. Se il docente non risponde entro 14 giorni (la fine dei tempi normali di risposta), decide il docente delegato del rettore (art. 16, c. 5-bis) in 1-5 giorni; concede le misure nel 90% dei casi. I rifiuti del docente restano rifiuti.' },
    informazione:   { v: [0.95, 0, 7, 0.9], et: '[P]', fonte: 'Leva C. Informazione d\'ufficio: sa delle tutele il 95%, entro 0-7 giorni; chiede l\'accertamento il 90% (timore per l\'adozione chiarito).' },
    obbligo:        { v: 1, et: '[P]', fonte: 'Leva D. Un regolamento di ateneo rende dovute le misure per la condizione medica documentata, anche senza verbale.' }
  };

  var PROFILI = {
    nuova: { nome: 'Nuova diagnosi, senza verbale', verbale: false, descr: 'Studentessa o studente a cui viene diagnosticata una malattia onco-ematologica: il primo appello arriva prima del verbale?' },
    verbale: { nome: 'Con il verbale già riconosciuto', verbale: true, descr: 'Studente con verbale (per esempio disabilità motoria dalla nascita): restano informazione, servizio e docenti.' }
  };

  // Numeri casuali comuni: ogni studente estrae sempre gli stessi numeri, nello stesso ordine,
  // qualunque leva sia attiva. Così le differenze fra scenari dipendono solo dalle leve.
  function estrai(r, nEsami) {
    var u = { sa: r(), info: r(), chiede: r(), comm: r(), prov: r(), disc: r(), serv: r(), esami: [] };
    for (var i = 0; i < nEsami; i++) u.esami.push({ risp: r(), td: r(), esito: r(), delT: r(), delEsito: r() });
    return u;
  }
  function tra(u, a, b) { return a + (b - a) * u; }
  function triU(u, a, m, b) {
    var c = (m - a) / (b - a);
    return u < c ? a + Math.sqrt(u * (b - a) * (m - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - m));
  }

  // Un esame: dal momento in cui le misure sono chieste ai docenti (t0) alla decisione.
  function esame(e, t0, P, leve) {
    var td = tra(e.td, P.tempoDocente.v[0], P.tempoDocente.v[1]);
    if (e.risp < P.pRisponde.v) {
      var es = e.esito < P.esitoDocente.v[0] ? 'piena' : (e.esito < P.esitoDocente.v[0] + P.esitoDocente.v[1] ? 'parziale' : 'nessuna');
      return { t: t0 + td, esito: es, chi: 'docente' };
    }
    if (leve.B) {
      var tg = t0 + P.delegato.v[0] + tra(e.delT, P.delegato.v[1], P.delegato.v[2]);
      return { t: tg, esito: e.delEsito < P.delegato.v[3] ? 'piena' : 'nessuna', chi: 'delegato' };
    }
    return { t: Infinity, esito: 'nessuna', chi: 'nessuno' };
  }

  // Uno studente. Giorno 0: nasce il bisogno (diagnosi o iscrizione). L'appello è al giorno T.
  function studente(u, profilo, P, leve) {
    var s = { tappe: {} };
    var sa = u.sa < (leve.C ? P.informazione.v[0] : P.pSa.v);
    var tInfo = sa ? (leve.C ? tra(u.info, P.informazione.v[1], P.informazione.v[2]) : 0) : tra(u.info, P.ritardoInfo.v[0], P.ritardoInfo.v[1]);
    s.tappe.sa = tInfo;
    var tTitolo = Infinity, via;
    if (profilo.verbale) {
      tTitolo = tInfo; via = 'verbale';
    } else if (u.chiede < (leve.C ? P.informazione.v[3] : P.pDomanda.v)) {
      var tc = triU(u.comm, P.commissione.v[0], P.commissione.v[1], P.commissione.v[2]);
      if (leve.A && tc > P.provvisorio.v[0]) {
        tc = P.provvisorio.v[0] + tra(u.prov, P.provvisorio.v[1], P.provvisorio.v[2]);
        via = 'provvisorio';
      } else via = 'verbale';
      tTitolo = tInfo + tc;
    } else {
      // Senza domanda: resta la via della condizione medica documentata, a discrezione dell'ateneo.
      via = 'discrezione';
      tTitolo = (leve.D || u.disc < P.pDiscrezione.v) ? tInfo : Infinity;
    }
    s.via = via;
    s.tappe.titolo = tTitolo;
    var tMisure = tTitolo + tra(u.serv, P.servizio.v[0], P.servizio.v[1]);
    s.tappe.servizio = tMisure;
    s.esami = u.esami.map(function (e) { return isFinite(tMisure) ? esame(e, tMisure, P, leve) : { t: Infinity, esito: 'nessuna', chi: 'nessuno' }; });
    return s;
  }

  function simula(opz) {
    var P = opz.parametri || PARAMETRI, leve = opz.leve || {}, profilo = PROFILI[opz.profilo || 'nuova'];
    var N = opz.n || 2000, T = opz.appello || 60, r = generatore(opz.seme || 20261127);
    var c = { n: N, sa: 0, titolo: 0, servizio: 0, unaInTempo: 0, esami: 0, inTempo: 0, pieneInTempo: 0, conMisura: 0, piene: 0, certi: 0, accesso: 0, attesa: 0, perVia: {} };
    for (var k = 0; k < N; k++) {
      var s = studente(estrai(r, P.nEsami.v), profilo, P, leve);
      c.perVia[s.via] = (c.perVia[s.via] || 0) + 1;
      if (s.tappe.sa <= T) c.sa++;
      if (s.tappe.titolo <= T) c.titolo++;
      if (s.tappe.servizio <= T) c.servizio++;
      var una = false, primo = Infinity;
      s.esami.forEach(function (e) {
        c.esami++;
        var ottenuta = e.esito !== 'nessuna';
        if (ottenuta && e.t <= T) { c.inTempo++; una = true; if (e.esito === 'piena') c.pieneInTempo++; }
        if (ottenuta && e.t <= T - P.anticipo.v) c.certi++;
        if (ottenuta && e.t <= P.orizzonte.v) { c.conMisura++; if (e.esito === 'piena') c.piene++; primo = Math.min(primo, e.t); }
      });
      if (una) c.unaInTempo++;
      if (primo <= P.orizzonte.v) { c.accesso++; c.attesa += primo; }
    }
    return {
      conteggi: c,
      // Le cinque componenti, ciascuna fra 0 e 1 (costo in giorni)
      accesso: c.accesso / N,
      tempestivita: c.inTempo / c.esami,
      completezza: c.conMisura ? c.piene / c.conMisura : 0,
      certezza: c.certi / c.esami,
      costo: c.accesso ? c.attesa / c.accesso : null,
      // Dove si perde: quota di studenti che supera ogni tappa entro l'appello
      imbuto: [
        { tappa: 'Sa a cosa ha diritto', q: c.sa / N },
        { tappa: 'Ha un titolo valido (verbale, provvisorio o concessione)', q: c.titolo / N },
        { tappa: 'Il servizio ha inoltrato le misure', q: c.servizio / N },
        { tappa: 'Almeno un esame con misure in tempo', q: c.unaInTempo / N }
      ]
    };
  }

  var SIM = { PARAMETRI: PARAMETRI, PROFILI: PROFILI, simula: simula, generatore: generatore, triangolare: triangolare };
  if (typeof module !== 'undefined' && module.exports) module.exports = SIM; else radice.SIM = SIM;
})(this);
