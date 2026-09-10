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

    // Factores de Dominio Territorial exactos
    let homeTerritoryFactor = homePoss / 0.5; 
    let awayTerritoryFactor = awayPoss / 0.5;

    // 4. Coeficiente de Ritmo Global determinista
    let globalTempo = ((homeShots + awayShots) / 30); 
    globalTempo = Math.max(0.7, Math.min(1.3, globalTempo));

    // 5. Eficiencia de Precisión de Tiros a Puerta (SOT / Tiros Totales)
    let homeAccuracyRatio = homeSot / Math.max(1, homeShots);
    let awayAccuracyRatio = awaySot / Math.max(1, awayShots);

    // 6. Motor Cruzado Total de Goles (xG + Conversión + Territorio + Balón Parado por Faltas + Eficiencia)
    let convH = 10 / Math.max(4, homeShotsPerGoal);
    let convA = 10 / Math.max(4, awayShotsPerGoal);
    
    // Impacto de faltas del rival concediendo peligro (balón parado)
    let homeSetPieceBonus = (awayFouls / 20) * 0.1;
    let awaySetPieceBonus = (homeFouls / 20) * 0.1;

    let finalHomeXg = (((homeXg + awayXga + homeScored + awayConceded) / 4) * convH * homeAccuracyRatio) * homeTerritoryFactor * 0.5 + (((homeXg + awayXga)/2)*0.5) + homeSetPieceBonus;
    let finalAwayXg = (((awayXg + homeXga + awayScored + homeConceded) / 4) * convA * awayAccuracyRatio) * awayTerritoryFactor * 0.5 + (((awayXg + homeXga)/2)*0.5) + awaySetPieceBonus;
    
    finalHomeXg = Math.max(0.1, finalHomeXg);
    finalAwayXg = Math.max(0.1, finalAwayXg);

    let homeGoals = Math.round(finalHomeXg);
    let awayGoals = Math.round(finalAwayXg);

    // 7. Tiros Exactos (Cruzados con Posesión, Ritmo y Desgaste Defensivo por Faltas)
    let homeWearPenalty = (awayPoss < 0.45 && awayFouls > 13) ? 1.08 : 1.0;
    let awayWearPenalty = (homePoss < 0.45 && homeFouls > 13) ? 1.08 : 1.0;

    let targetHomeShots = Math.round(homeShots * homeTerritoryFactor * globalTempo * homeWearPenalty);
    let targetAwayShots = Math.round(awayShots * awayTerritoryFactor * globalTempo * awayWearPenalty);

    const simHomeSot = Math.min(targetHomeShots, Math.round(targetHomeShots * homeAccuracyRatio));
    const simAwaySot = Math.min(targetAwayShots, Math.round(targetAwayShots * awayAccuracyRatio));

    const simHomeShotsOff = Math.max(0, targetHomeShots - simHomeSot);
    const simAwayShotsOff = Math.max(0, targetAwayShots - simAwaySot);

    // 8. Córners Exactos Conectados a la Presión
    let baseHomeCorners = Math.round(((homeCornersWon + awayCornersLost) / 2) * homeTerritoryFactor);
    let baseAwayCorners = Math.round(((awayCornersWon + homeCornersLost) / 2) * awayTerritoryFactor);

    // 9. Faltas y Tarjetas Exactas Cruzadas
    let targetHomeFouls = Math.round(homeFouls * awayTerritoryFactor);
    let targetAwayFouls = Math.round(awayFouls * homeTerritoryFactor);
    
    const totalCards = ((targetHomeFouls + targetAwayFouls) / 7.2).toFixed(1);

    // 10. Offsides Combinados Exactos
    const combinedOff25 = Math.round((homeOff25 * awayTerritoryFactor + awayOff25 * homeTerritoryFactor) / 2);
    const combinedOff35 = Math.round((homeOff35 * awayTerritoryFactor + awayOff35 * homeTerritoryFactor) / 2);
    const finalOff25 = Math.min(100, Math.max(0, combinedOff25));
    const finalOff35 = Math.min(100, Math.max(0, combinedOff35));

    // 11. Pintar Resultados en la Tabla Perfecta
    document.getElementById('res-home-name').innerText = homeName;
    document.getElementById('res-away-name').innerText = awayName;
    document.getElementById('res-score').innerText = `${homeGoals} - ${awayGoals}`;

    document.getElementById('th-home').innerText = homeName;
    document.getElementById('th-away').innerText = awayName;

    const statsBody = document.getElementById('stats-body');
    statsBody.innerHTML = `
        <tr><td><strong>Goles Esperados (xG Conjunto)</strong></td><td>${finalHomeXg.toFixed(2)}</td><td>${finalAwayXg.toFixed(2)}</td></tr>
        <tr><td><strong>Posesión de Balón</strong></td><td>${Math.round(homePoss * 100)}%</td><td>${Math.round(awayPoss * 100)}%</td></tr>
        <tr><td><strong>Remates Totales</strong></td><td>${targetHomeShots}</td><td>${targetAwayShots}</td></tr>
        <tr><td><strong>Tiros a Puerta</strong></td><td>${simHomeSot}</td><td>${simAwaySot}</td></tr>
        <tr><td><strong>Remates Fuera</strong></td><td>${simHomeShotsOff}</td><td>${simAwayShotsOff}</td></tr>
        <tr><td><strong>Tiros de Esquina (Córners)</strong></td><td>${baseHomeCorners}</td><td>${baseAwayCorners}</td></tr>
        <tr><td><strong>Faltas Cometidas</strong></td><td>${targetHomeFouls}</td><td>${targetAwayFouls}</td></tr>
        <tr><td><strong>Tarjetas Totales Estimadas</strong></td><td colspan="2" style="text-align: center; color: #facc15; font-weight: bold;">~ ${totalCards} Tarjetas</td></tr>
        <tr><td><strong>Probabilidad Offsides > 2.5</strong></td><td colspan="2" style="text-align: center; color: #38bdf8; font-weight: bold;">${finalOff25}% de probabilidad</td></tr>
        <tr><td><strong>Probabilidad Offsides > 3.5</strong></td><td colspan="2" style="text-align: center; color: #38bdf8; font-weight: bold;">${finalOff35}% de probabilidad</td></tr>
    `;

    document.getElementById('results').classList.remove('hidden');
}
