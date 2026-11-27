/* Vista della simulazione: legge i controlli, esegue SIM.simula due volte (senza leve e con le leve
 * scelte) e mostra le cinque componenti e l'imbuto. Nessun calcolo qui oltre alla formattazione. */
(function () {
  'use strict';
  var SIM = window.SIM;
  var $ = function (id) { return document.getElementById(id); };
  var LEVE = ['A', 'B', 'C', 'D'];

  function pc(x) { return Math.round(x * 100) + '%'; }
  function giorni(x) { return x == null ? 'n.d.' : Math.round(x) + ' giorni'; }

  function barra(q, classe) {
    return '<span class="sb ' + classe + '"><span style="width:' + Math.max(0, Math.min(100, q * 100)).toFixed(1) + '%"></span></span>';
  }

  var COMP = [
    { k: 'accesso', nome: 'Accesso', d: 'studenti che ottengono almeno una misura entro un anno' },
    { k: 'tempestivita', nome: 'Tempestività', d: 'esami del primo appello con le misure decise in tempo' },
    { k: 'completezza', nome: 'Completezza', d: 'misure concesse per intero, sul totale delle misure concesse' },
    { k: 'certezza', nome: 'Certezza', d: 'esami con la decisione nota almeno 7 giorni prima' },
    { k: 'costo', nome: 'Costo', d: 'giorni medi dal bisogno alla prima misura (meno è meglio)' }
  ];

  function aggiorna() {
    var profilo = document.querySelector('input[name="sim-profilo"]:checked').value;
    var appello = +$('sim-appello').value;
    var leve = {};
    LEVE.forEach(function (l) { if ($('sim-leva-' + l).checked) leve[l] = true; });
    $('sim-appello-v').textContent = appello + ' giorni';
    $('sim-profilo-d').textContent = SIM.PROFILI[profilo].descr;

    var base = SIM.simula({ profilo: profilo, appello: appello, leve: {} });
    var scen = SIM.simula({ profilo: profilo, appello: appello, leve: leve });
    var nomeLeve = LEVE.filter(function (l) { return leve[l]; }).join(' + ') || 'nessuna';

    var maxCosto = Math.max(base.costo || 0, scen.costo || 0, 1);
    var h = '<table class="sim-tab"><thead><tr><th>Componente</th><th>Senza leve</th><th>Con le leve: ' + nomeLeve + '</th></tr></thead><tbody>';
    COMP.forEach(function (c) {
      var vb = base[c.k], vs = scen[c.k];
      var qb = c.k === 'costo' ? (vb || 0) / maxCosto : vb, qs = c.k === 'costo' ? (vs || 0) / maxCosto : vs;
      var tb = c.k === 'costo' ? giorni(vb) : pc(vb), ts = c.k === 'costo' ? giorni(vs) : pc(vs);
      h += '<tr><th scope="row"><b>' + c.nome + '</b><small>' + c.d + '</small></th>' +
        '<td>' + barra(qb, 'base') + '<span class="sv">' + tb + '</span></td>' +
        '<td>' + barra(qs, 'scen') + '<span class="sv">' + ts + '</span></td></tr>';
    });
    h += '</tbody></table>';
    $('sim-comp').innerHTML = h;

    var g = '<table class="sim-tab"><thead><tr><th>Tappa superata entro l\'appello</th><th>Senza leve</th><th>Con le leve: ' + nomeLeve + '</th></tr></thead><tbody>';
    base.imbuto.forEach(function (t, i) {
      g += '<tr><th scope="row">' + t.tappa + '</th><td>' + barra(t.q, 'base') + '<span class="sv">' + pc(t.q) + '</span></td>' +
        '<td>' + barra(scen.imbuto[i].q, 'scen') + '<span class="sv">' + pc(scen.imbuto[i].q) + '</span></td></tr>';
    });
    g += '</tbody></table>';
    $('sim-imbuto').innerHTML = g;

    // La perdita più grande fra una tappa e la successiva, senza leve
    var prec = 1, peggiore = null, perdita = -1;
    base.imbuto.forEach(function (t) { var p = prec - t.q; if (p > perdita) { perdita = p; peggiore = t.tappa; } prec = t.q; });
    $('sim-frase').innerHTML = 'Senza leve, il punto in cui si perdono più studenti è: <b>' + peggiore.toLowerCase() + '</b> (' + pc(perdita) + ' degli studenti si ferma lì).';
  }

  function tabellaParametri() {
    var righe = '';
    Object.keys(SIM.PARAMETRI).forEach(function (k) {
      var p = SIM.PARAMETRI[k];
      righe += '<tr><td><code>' + k + '</code></td><td>' + (Array.isArray(p.v) ? p.v.join(' · ') : p.v) + '</td><td class="st">' + p.et + '</td><td>' + p.fonte + '</td></tr>';
    });
    $('sim-parametri').innerHTML = righe;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!SIM) return;
    tabellaParametri();
    var ctl = SIM.simula({ profilo: 'verbale', appello: 45, leve: {} });
    $('sim-controllo').textContent = Math.round(ctl.tempestivita * 100) + '% degli esami in tempo';
    var ctr = document.querySelectorAll('#sim-controlli input');
    for (var i = 0; i < ctr.length; i++) ctr[i].addEventListener('input', aggiorna);
    aggiorna();
  });
})();
