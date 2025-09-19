// Configuração da aplicação
const API_BASE = window.location.origin;

// Definição dos desafios
const challenges = [
    {
        id: 'first-steps',
        title: 'Desafio 01 - GitHub Actions',
        description: 'Configure seu primeiro GitHub Action com um workflow básico de CI. Aprenda os conceitos fundamentais e execute seu primeiro build automatizado.',
        badge: 'first-steps',
        reward: 'Badge: Desafio 01 Concluído'
    },
    {
        id: 'testes-automatizados',
        title: 'Desafio 02 - Testes Automatizados',
        description: 'Implemente testes com Jest e atinja cobertura mínima de 80% no pipeline. Gere e faça upload do certificado do nível 2.',
        badge: 'testes-automatizados',
        reward: 'Badge: Desafio 02 Concluído'
    },
    {
        id: 'containers-seguros',
        title: 'Desafio 03 - Containers e Segurança',
        description: 'Construa a imagem Docker, escaneie com Trivy e publique no ECR apenas se não houver vulnerabilidades CRÍTICAS. Gere e faça upload do certificado do nível 3.',
        badge: 'containers-seguros',
        reward: 'Badge: Desafio 03 Concluído'
    }
];

// Estado da aplicação
let appState = {
    progress: null,
    badges: [],
    stats: {}
};

let selectedCertificateLevel = null;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Descomplicando GitHub Actions iniciado!');
    await loadProgress();
    renderChallenges();
    renderBadges();
    updateStats();
    setupGitHubCheck();
    setupAutoRefresh();

    // Atualizar dados a cada 10 segundos para capturar atualizações do workflow
    setInterval(loadProgress, 10000);
});

// Configurar atualização automática mais frequente
function setupAutoRefresh() {
    // Verificar se há mudanças no progresso mais frequentemente
    let lastUpdateTime = appState.progress ? appState.progress.lastUpdate : null;

    setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/progress`);
            if (response.ok) {
                const data = await response.json();

                // Se houve uma atualização nova, mostrar notificação
                if (data.lastUpdate !== lastUpdateTime && lastUpdateTime !== null) {
                    const newBadges = data.badges.filter(badge => !appState.badges.includes(badge));

                    if (newBadges.length > 0) {
                        showNotification('Parabéns! Badge desbloqueado automaticamente pelo workflow!', 'success');
                        await loadProgress(); // Recarregar dados completos

                        // Gerar certificado automaticamente se há username preenchido
                        const usernameField = document.getElementById('certificateUsername');
                        if (usernameField && usernameField.value.trim()) {
                            setTimeout(() => generateCertificate(), 1500);
                        }
                    }
                }

                lastUpdateTime = data.lastUpdate;
            }
        } catch (error) {
            // Silencioso - não queremos spam de erros
        }
    }, 5000); // Verificar a cada 5 segundos
}

// Carregar progresso da API
async function loadProgress() {
    try {
        const response = await fetch(`${API_BASE}/api/progress`);
        if (!response.ok) throw new Error('Erro ao carregar progresso');

        const data = await response.json();
        appState.progress = data;
        appState.badges = data.badges || [];
        appState.stats = data.stats || {};

        updateProgressBar();
        updateStats();
        updateBadgesDisplay();
        updateChallengesStatus();

        console.log('📊 Progresso atualizado:', data);
    } catch (error) {
        console.error('❌ Erro ao carregar progresso:', error);
        showNotification('Erro ao carregar progresso', 'error');
    }
}

// Atualizar barra de progresso
function updateProgressBar() {
    if (!appState.progress) return;

    const { completedChallenges, totalChallenges } = appState.progress;
    const percentage = (completedChallenges / totalChallenges) * 100;

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }

    if (progressText) {
        progressText.textContent = `${completedChallenges} de ${totalChallenges} desafios concluídos`;
    }
}

// Atualizar estatísticas
function updateStats() {
    const stats = appState.stats || {};

    const elements = {
        'commitsCount': stats.commits || 0,
        'buildsCount': stats.successfulBuilds || 0,
        'deploymentsCount': stats.deployments || 0,
        'testsCount': stats.testsRun || 0
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateNumber(element, parseInt(element.textContent) || 0, value);
        }
    });
}

// Animar números
function animateNumber(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Renderizar desafios
function renderChallenges() {
    const challengesGrid = document.getElementById('challengesGrid');
    if (!challengesGrid) return;

    challengesGrid.innerHTML = challenges.map((challenge, index) => {
        const isCompleted = appState.badges.includes(challenge.badge);

        return `
            <div class="challenge-card ${isCompleted ? 'completed' : ''}" style="animation-delay: ${index * 0.1}s">
                <div class="challenge-header">
                    <h3 class="challenge-title">${challenge.title}</h3>
                    <span class="challenge-status ${isCompleted ? 'completed' : 'pending'}">
                        ${isCompleted ? 'Concluído' : 'Pendente'}
                    </span>
                </div>
                <p class="challenge-description">${challenge.description}</p>
                <div class="challenge-reward">
                    <span>${challenge.reward}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Renderizar badges
function renderBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    if (!badgesGrid || !appState.progress) return;

    const availableBadges = appState.progress.availableBadges || {};

    badgesGrid.innerHTML = Object.entries(availableBadges).map(([badgeId, badge]) => {
        const isEarned = appState.badges.includes(badgeId);

        return `
            <div class="badge-card ${isEarned ? 'earned' : ''}" style="cursor: ${isEarned ? 'pointer' : 'not-allowed'};" onclick="${isEarned ? `onBadgeClick('${badgeId}')` : ''}">
                <div class="badge-visual">
                    ${isEarned ? `
                        <div class="badge-earned">
                            <div class="badge-circle">
                                <i class="fas fa-${badge.icon}"></i>
                            </div>
                            <div class="badge-ribbon">${badge.badgeText}</div>
                        </div>
                    ` : `
                        <div class="badge-locked">
                            <div class="badge-circle-locked">
                                <i class="fas fa-lock"></i>
                            </div>
                            <div class="badge-ribbon-locked">BLOQUEADO</div>
                        </div>
                    `}
                </div>
                <h3 class="badge-name">${badge.name}</h3>
                <p class="badge-description">${badge.description}</p>
                ${isEarned ? '<div class="badge-status earned-status">Parabéns! Desafio concluído com sucesso!</div>' : '<div class="badge-status locked-status">Execute o workflow para desbloquear</div>'}
            </div>
        `;
    }).join('');
}

// Atualizar exibição dos badges
function updateBadgesDisplay() {
    renderBadges();
    updateCertificateSection();
}

// Atualizar seção do certificado
function updateCertificateSection() {
    const certificateSection = document.getElementById('certificateSection');
    const hasAnyCertificate = appState.badges.includes('first-steps') || appState.badges.includes('testes-automatizados') || appState.badges.includes('containers-seguros');

    if (certificateSection) {
        certificateSection.style.display = hasAnyCertificate ? 'block' : 'none';
    }
}

// Atualizar status dos desafios
function updateChallengesStatus() {
    renderChallenges();
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    // Adicionar estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 15px 20px;
        color: var(--text-primary);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;

    // Adicionar ao DOM
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Obter ícone da notificação
function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Função para simular atualização de progresso (para testes)
async function simulateProgress(challengeId) {
    try {
        const response = await fetch(`${API_BASE}/api/progress/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                challenge: challengeId,
                stats: {
                    commits: appState.stats.commits + 1,
                    successfulBuilds: appState.stats.successfulBuilds + 1
                }
            })
        });

        if (response.ok) {
            await loadProgress();
            showNotification('Progresso atualizado com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
        showNotification('Erro ao atualizar progresso', 'error');
    }
}

// Verificar status no GitHub automaticamente
async function checkGitHubStatus(username, repository) {
    try {
        showNotification('Verificando seu progresso no GitHub...', 'info');

        const response = await fetch(`${API_BASE}/api/check-github-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, repository })
        });

        const result = await response.json();

        if (response.ok) {
            const hadUpdate = Array.isArray(result.earnedBadges) ? result.earnedBadges.length > 0 : (result.badgeEarned || result.certificateReady);
            if (hadUpdate) {
                showNotification('Progresso atualizado com sucesso!', 'success');
                await loadProgress();
                const usernameForCert = result.username || username;
                const level = result.level || (result.earnedBadges && result.earnedBadges.includes('testes-automatizados') ? 2 : 1);
                document.getElementById('certificateUsername').value = usernameForCert;
                selectedCertificateLevel = level;
                setTimeout(() => generateCertificate(), 500);
            } else {
                showNotification(result.message || 'Nenhuma atualização encontrada.', 'info');
            }
        } else {
            showNotification(result.error || 'Erro ao verificar GitHub', 'error');
        }
    } catch (error) {
        console.error('Erro ao verificar GitHub:', error);
        showNotification('Erro ao conectar com GitHub', 'error');
    }
}

// Configurar verificação do GitHub
function setupGitHubCheck() {
    // Adicionar botão de verificação na interface
    const challengesSection = document.querySelector('.challenges-section');
    if (challengesSection) {
        const checkButton = document.createElement('div');
        checkButton.innerHTML = `
            <div style="margin-top: 20px; text-align: center;">
                <div style="background: var(--secondary-color); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                    <h3 style="margin-bottom: 15px;">Verificar Progresso no GitHub</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 15px;">
                        Após executar o workflow, seu badge será desbloqueado automaticamente! 
                        Ou clique abaixo para verificar manualmente.
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center; align-items: center; flex-wrap: wrap;">
                        <input type="text" id="githubUsername" placeholder="Seu usuário do GitHub" 
                               style="padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--primary-color); color: var(--text-primary); min-width: 200px;">
                        <input type="text" id="githubRepo" placeholder="LINUXtips-github-actions" value="LINUXtips-github-actions"
                               style="padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--primary-color); color: var(--text-primary); min-width: 200px;">
                        <button onclick="checkMyProgress()" 
                                style="padding: 10px 20px; background: var(--accent-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                            Verificar Progresso
                        </button>
                    </div>
                </div>
            </div>
        `;
        challengesSection.appendChild(checkButton);
    }
}

// Função global para verificar progresso
window.checkMyProgress = async function () {
    const username = document.getElementById('githubUsername').value.trim();
    const repository = document.getElementById('githubRepo').value.trim();

    // Reset seleção e certificado ao trocar de usuário
    const currentCertUser = document.getElementById('certificateUsername').value.trim();
    if (currentCertUser && currentCertUser !== username) {
        selectedCertificateLevel = null;
        const certificatePreview = document.getElementById('certificatePreview');
        if (certificatePreview) certificatePreview.innerHTML = '';
        document.getElementById('downloadBtn').disabled = true;
    }

    // Sempre sincronizar campo do certificado com o usuário que será verificado
    const certInput = document.getElementById('certificateUsername');
    if (certInput) certInput.value = username;

    // Reset total do estado local para evitar resquícios (badges, preview, stats serão recarregados)
    appState.badges = [];
    appState.progress = null;
    updateBadgesDisplay();
    updateChallengesStatus();
    const certificatePreview = document.getElementById('certificatePreview');
    if (certificatePreview) certificatePreview.innerHTML = '';
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.disabled = true;
    selectedCertificateLevel = null;

    if (!username) {
        showNotification('Por favor, informe seu usuário do GitHub', 'warning');
        return;
    }

    if (!repository) {
        showNotification('Por favor, informe o nome do repositório', 'warning');
        return;
    }

    // Resetar estado no servidor antes de verificar novo usuário
    try {
        await fetch(`${API_BASE}/api/reset`, { method: 'POST' });
    } catch (_) {
    }

    // Recarrega UI limpa do servidor
    await loadProgress();

    // Verificar progresso do usuário atual
    await checkGitHubStatus(username, repository);
};

// Função para reset (útil para demonstrações)
async function resetProgress() {
    try {
        const response = await fetch(`${API_BASE}/api/reset`, {
            method: 'POST'
        });

        if (response.ok) {
            await loadProgress();
            showNotification('Progresso resetado!', 'info');
        }
    } catch (error) {
        console.error('Erro ao resetar progresso:', error);
        showNotification('Erro ao resetar progresso', 'error');
    }
}

// Funções do certificado
async function generateCertificate() {
    const username = document.getElementById('certificateUsername').value.trim();

    if (!username) {
        showNotification('Por favor, informe seu nome de usuário do GitHub', 'warning');
        return;
    }

    if (!appState.badges.includes('first-steps') && !appState.badges.includes('testes-automatizados')) {
        showNotification('Complete um desafio primeiro para gerar seu certificado!', 'error');
        return;
    }

    try {
        const levelQuery = selectedCertificateLevel ? `?level=${selectedCertificateLevel}` : '';
        const response = await fetch(`${API_BASE}/api/certificate/${username}${levelQuery}`);

        if (response.ok) {
            const svgContent = await response.text();
            const certificatePreview = document.getElementById('certificatePreview');
            certificatePreview.innerHTML = svgContent;

            // Habilitar botão de download
            document.getElementById('downloadBtn').disabled = false;

            showNotification('Certificado gerado com sucesso!', 'success');
        } else {
            const error = await response.json();
            showNotification(error.error || 'Erro ao gerar certificado', 'error');
        }
    } catch (error) {
        console.error('Erro ao gerar certificado:', error);
        showNotification('Erro ao gerar certificado', 'error');
    }
}

function downloadCertificate() {
    const username = document.getElementById('certificateUsername').value.trim();
    if (!username) return;

    const link = document.createElement('a');
    const levelQuery = selectedCertificateLevel ? `?level=${selectedCertificateLevel}` : '';
    link.href = `${API_BASE}/api/certificate/${username}${levelQuery}`;
    link.download = `certificado-${username}-descomplicando-github-actions.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Certificado baixado com sucesso!', 'success');
}


// Exposar funções globalmente para debug
window.selectCertificateLevel = function(level) {
    selectedCertificateLevel = level;
    generateCertificate();
}

window.devopsLearning = {
    simulateProgress,
    resetProgress,
    loadProgress,
    checkGitHubStatus,
    generateCertificate,
    downloadCertificate,
    appState,
    selectCertificateLevel
};

// Log de inicialização
console.log(`
Descomplicando GitHub Actions
LINUXtips

🎉 NOVIDADE: Badge é desbloqueado AUTOMATICAMENTE quando o workflow completa!

Comandos disponíveis no console:
- devopsLearning.simulateProgress('first-steps') - Simular progresso
- devopsLearning.resetProgress() - Resetar progresso  
- devopsLearning.loadProgress() - Recarregar dados
- devopsLearning.checkGitHubStatus('usuario', 'repo') - Verificar GitHub
- devopsLearning.appState - Ver estado atual

Badges disponíveis: first-steps, testes-automatizados

✨ AUTOMÁTICO: Execute o workflow no GitHub e veja seu badge aparecer automaticamente!
`);

window.onBadgeClick = function(badgeId) {
    const username = document.getElementById('certificateUsername').value.trim();
    if (!username) return;
    const level = badgeId === 'containers-seguros' ? 3 : (badgeId === 'testes-automatizados' ? 2 : 1);
    selectedCertificateLevel = level;
    generateCertificate();
}

