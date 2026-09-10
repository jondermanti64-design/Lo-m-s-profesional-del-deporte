function poissonRandom(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

function simulateMetric(baseValue, variance = 1.8) {
    let randomOffset = (Math.random() * (variance * 2)) - variance;
    let simulated = Math.round(baseValue + randomOffset);
    return Math.max(0, simulated);
}

function runSimulation() {
    // 1. Lectura de Datos - Local
    const homeName = document.getElementById('home-name').value;
    const homeScored = parseFloat(document.getElementById('home-scored').value);
    const homeConceded = parseFloat(document.getElementById('home-conceded').value);
    const homeXg = parseFloat(document.getElementById('home-xg').value);
    const homeXga = parseFloat(document.getElementById('home-xga').value);
    const homeShots = parseFloat(document.getElementById('home-shots').value);
    const homeSot = parseFloat(document.getElementById('home-sot').value);
    const homeShotsOff = parseFloat(document.getElementById('home-shots-off').value);
    const homeShotsPerGoal = parseFloat(document.getElementById('home-shots-per-goal').value);
    const homeCornersWon = parseFloat(document.getElementById('home-corners-won').value);
    const homeCornersLost = parseFloat(document.getElementById('home-corners-lost').value);
    let homePossInput = parseFloat(document.getElementById('home-poss').value);
    const homeFouls = parseFloat(document.getElementById('home-fouls').value);
    const homeOff25 = parseFloat(document.getElementById('home-off25').value);
    const homeOff35 = parseFloat(document.getElementById('home-off35').value);

    // 2. Lectura de Datos - Visitante
    const awayName = document.getElementById('away-name').value;
    const awayScored = parseFloat(document.getElementById('away-scored').value);
    const awayConceded = parseFloat(document.getElementById('away-conceded').value);
    const awayXg = parseFloat(document.getElementById('away-xg').value);
    const awayXga = parseFloat(document.getElementById('away-xga').value);
    const awayShots = parseFloat(document.getElementById('away-shots').value);
    const awaySot = parseFloat(document.getElementById('away-sot').value);
    const awayShotsOff = parseFloat(document.getElementById('away-shots-off').value);
    const awayShotsPerGoal = parseFloat(document.getElementById('away-shots-per-goal').value);
    const awayCornersWon = parseFloat(document.getElementById('away-corners-won').value);
    const awayCornersLost = parseFloat(document.getElementById('away-corners-lost').value);
    let awayPossInput = parseFloat(document.getElementById('away-poss').value);
    const awayFouls = parseFloat(document.getElementById('away-fouls').value);
    const awayOff25 = parseFloat(document.getElementById('away-off25').value);
    const awayOff35 = parseFloat(document.getElementById('away-off35').value);

    // 3. Normalización Conjunta de Posesión (Suma 100%)
    let totalPossRaw = homePossInput + awayPossInput;
    let homePoss = totalPossRaw > 0 ? (homePossInput / totalPossRaw) : 0.5;
    let awayPoss = totalPossRaw > 0 ? (awayPossInput / totalPossRaw) : 0.5;

    // Factores de Dominio Territorial (Rango aproximado 0.75 a 1.25)
    let homeTerritoryFactor = homePoss / 0.5; 
    let awayTerritoryFactor = awayPoss / 0.5;

    // 4. Coeficiente de Ritmo Global (Tempo del Partido)
    let globalTempo = ((homeShots + awayShots) / 30); 
    globalTempo = Math.max(0.7, Math.min(1.3, globalTempo));

    // 5. Motor Conjunto de Goles (xG Cruzado + Calidad de Conversión + Ritmo)
    let convH = 10 / Math.max(4, homeShotsPerGoal);
    let convA = 10 / Math.max(4, awayShotsPerGoal);
    
    let finalHomeXg = (((homeXg + awayXga + homeScored + awayConceded) / 4) * convH) * homeTerritoryFactor * 0.5 + (((homeXg + awayXga)/2)*0.5);
    let finalAwayXg = (((awayXg + homeXga + awayScored + homeConceded) / 4) * convA) * awayTerritoryFactor * 0.5 + (((awayXg + homeXga)/2)*0.5);
    
    finalHomeXg = Math.max(0.1, finalHomeXg);
    finalAwayXg = Math.max(0.1, finalAwayXg);

    const homeGoals = poissonRandom(finalHomeXg);
    const awayGoals = poissonRandom(finalAwayXg);

    // 6. Simulación Conjunta de Tiros (Afectados por Posesión y Ritmo)
    let targetHomeShots = homeShots * homeTerritoryFactor * globalTempo;
    let targetAwayShots = awayShots * awayTerritoryFactor * globalTempo;

    const simHomeShots = simulateMetric(targetHomeShots, 2.0);
    const simAwayShots = simulateMetric(targetAwayShots, 2.0);

    let homeSotRatio = homeSot / Math.max(1, homeShots);
    let awaySotRatio = awaySot / Math.max(1, awayShots);

    const simHomeSot = Math.min(simHomeShots, Math.max(0, Math.round(simHomeShots * homeSotRatio)));
    const simAwaySot = Math.min(simAwayShots, Math.max(0, Math.round(simAwayShots * awaySotRatio)));

    const simHomeShotsOff = Math.max(0, simHomeShots - simHomeSot);
    const simAwayShotsOff = Math.max(0, simAwayShots - simAwaySot);

    // 7. Córners Conectados al Volumen de Tiros y Presión
    let baseHomeCorners = ((homeCornersWon + awayCornersLost) / 2) * homeTerritoryFactor;
    let baseAwayCorners = ((awayCornersWon + homeCornersLost) / 2) * awayTerritoryFactor;
    const simHomeCorners = simulateMetric(baseHomeCorners, 1.4);
    const simAwayCorners = simulateMetric(baseAwayCorners, 1.4);

    // 8. Faltas y Tarjetas Cruzadas por Presión Defensiva
    let targetHomeFouls = homeFouls * awayTerritoryFactor; // Si el rival domina, corres detrás y haces más faltas
    let targetAwayFouls = awayFouls * homeTerritoryFactor;
    const simHomeFouls = simulateMetric(targetHomeFouls, 1.8);
    const simAwayFouls = simulateMetric(targetAwayFouls, 1.8);
    
    const totalCards = ((simHomeFouls + simAwayFouls) / 7.2).toFixed(1);

    // 9. Offsides Combinados por Estilo de Línea Defensiva
    const combinedOff25 = Math.round((homeOff25 * awayTerritoryFactor + awayOff25 * homeTerritoryFactor) / 2);
    const combinedOff35 = Math.round((homeOff35 * awayTerritoryFactor + awayOff35 * homeTerritoryFactor) / 2);
    const finalOff25 = Math.min(95, Math.max(10, combinedOff25));
    const finalOff35 = Math.min(90, Math.max(5, combinedOff35));

    // 10. Pintar Resultados en Pantalla
    document.getElementById('res-home-name').innerText = homeName;
    document.getElementById('res-away-name').innerText = awayName;
    document.getElementById('res-score').innerText = `${homeGoals} - ${awayGoals}`;

    document.getElementById('th-home').innerText = homeName;
    document.getElementById('th-away').innerText = awayName;

    const statsBody = document.getElementById('stats-body');
    statsBody.innerHTML = `
        <tr><td><strong>Goles Esperados (xG Conjunto)</strong></td><td>${finalHomeXg.toFixed(2)}</td><td>${finalAwayXg.toFixed(2)}</td></tr>
        <tr><td><strong>Posesión de Balón</strong></td><td>${Math.round(homePoss * 100)}%</td><td>${Math.round(awayPoss * 100)}%</td></tr>
        <tr><td><strong>Remates Totales</strong></td><td>${simHomeShots}</td><td>${simAwayShots}</td></tr>
        <tr><td><strong>Tiros a Puerta</strong></td><td>${simHomeSot}</td><td>${simAwaySot}</td></tr>
        <tr><td><strong>Remates Fuera</strong></td><td>${simHomeShotsOff}</td><td>${simAwayShotsOff}</td></tr>
        <tr><td><strong>Tiros de Esquina (Córners)</strong></td><td>${simHomeCorners}</td><td>${simAwayCorners}</td></tr>
        <tr><td><strong>Faltas Cometidas</strong></td><td>${simHomeFouls}</td><td>${simAwayFouls}</td></tr>
        <tr><td><strong>Tarjetas Totales Estimadas</strong></td><td colspan="2" style="text-align: center; color: #facc15; font-weight: bold;">~ ${totalCards} Tarjetas</td></tr>
        <tr><td><strong>Probabilidad Offsides > 2.5</strong></td><td colspan="2" style="text-align: center; color: #38bdf8; font-weight: bold;">${finalOff25}% de probabilidad</td></tr>
        <tr><td><strong>Probabilidad Offsides > 3.5</strong></td><td colspan="2" style="text-align: center; color: #38bdf8; font-weight: bold;">${finalOff35}% de probabilidad</td></tr>
    `;

    document.getElementById('results').classList.remove('hidden');
}
