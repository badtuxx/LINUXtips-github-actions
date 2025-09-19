const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

if (typeof fetch === 'undefined') {
  global.fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança e configuração
app.use(helmet({
  contentSecurityPolicy: false // Permitir inline scripts para simplicidade
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulação de dados de progresso (em produção seria um banco de dados)
let learningProgress = {
  totalChallenges: 3,
  completedChallenges: 0,
  badges: [],
  lastUpdate: new Date().toISOString(),
  stats: {
    commits: 0,
    successfulBuilds: 0,
    deployments: 0,
    testsRun: 0
  }
};

// Badge disponível
const availableBadges = {
  'first-steps': {
    name: 'GitHub Actions Master',
    description: 'Completou o Desafio 01 - GitHub Actions Básico',
    icon: 'check-circle',
    color: '#238636',
    badgeText: 'DESAFIO 01 CONCLUÍDO'
  },
  'testes-automatizados': {
    name: 'Testes Automatizados',
    description: 'Completou o Desafio 02 - Testes Automatizados',
    icon: 'check-circle',
    color: '#8957e5',
    badgeText: 'DESAFIO 02 CONCLUÍDO'
  },
  'containers-seguros': {
    name: 'Containers e Segurança',
    description: 'Completou o Desafio 03 - Containers e Segurança',
    icon: 'check-circle',
    color: '#1f6feb',
    badgeText: 'DESAFIO 03 CONCLUÍDO'
  }
};

// Rotas da API
app.get('/api/progress', (req, res) => {
  res.json({
    ...learningProgress,
    availableBadges
  });
});

app.post('/api/progress/update', (req, res) => {
  const { challenge, stats } = req.body;

  if (challenge && !learningProgress.badges.includes(challenge)) {
    learningProgress.badges.push(challenge);
    learningProgress.completedChallenges++;
  }

  if (stats) {
    learningProgress.stats = { ...learningProgress.stats, ...stats };
  }

  learningProgress.lastUpdate = new Date().toISOString();

  res.json({ success: true, progress: learningProgress });
});

/* istanbul ignore next */
app.get('/api/badge/:badgeId', (req, res) => {
  const badgeId = req.params.badgeId;
  const badge = availableBadges[badgeId];

  if (!badge) {
    return res.status(404).json({ error: 'Badge não encontrado' });
  }

  // Gerar SVG do badge
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="60">
  <rect width="260" height="60" fill="${badge.color}" rx="8"/>
  <text x="12" y="24" fill="white" font-family="Arial" font-size="14" font-weight="bold">
    ${badge.name}
  </text>
  <text x="12" y="42" fill="white" font-family="Arial" font-size="11">
    ${badge.description}
  </text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.send(svg);
});

// Gerar certificado visual para compartilhamento
/* istanbul ignore next */
app.get('/api/certificate/:username', (req, res) => {
  const username = req.params.username;
  const levelParam = req.query.level ? parseInt(req.query.level, 10) : undefined;

  const hasLevel1 = learningProgress.badges.includes('first-steps');
  const hasLevel2 = learningProgress.badges.includes('testes-automatizados');
  const hasLevel3 = learningProgress.badges.includes('containers-seguros');

  if (!hasLevel1 && !hasLevel2 && !hasLevel3) {
    return res.status(404).json({ error: 'Certificado não disponível. Complete o desafio primeiro!' });
  }

  if (levelParam === 1 && !hasLevel1) {
    return res.status(404).json({ error: 'Certificado do nível 1 não disponível.' });
  }
  if (levelParam === 2 && !hasLevel2) {
    return res.status(404).json({ error: 'Certificado do nível 2 não disponível.' });
  }
  if (levelParam === 3 && !hasLevel3) {
    return res.status(404).json({ error: 'Certificado do nível 3 não disponível.' });
  }

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Gerar SVG do certificado para compartilhamento social
  const renderLevel = (() => {
    if (levelParam === 1) return 1;
    if (levelParam === 2) return 2;
    if (levelParam === 3) return 3;
    if (hasLevel3) return 3;
    if (hasLevel2) return 2;
    return 1;
  })();

  const competencies = (() => {
    if (renderLevel === 3) {
      return {
        line1: '✓ Build de imagem Docker ✓ Lint de Dockerfile ✓ Segurança de containers',
        line2: '✓ Trivy Scan ✓ Smoke Tests ✓ Push no GHCR'
      };
    }
    if (renderLevel === 2) {
      return {
        line1: '✓ Automação de testes  ✓ Cobertura mínima 80%',
        line2: '✓ Execução de Jest  ✓ Relatório e validação de cobertura'
      };
    }
    return {
      line1: '✓ Configuração de workflow básico  ✓ Uso de actions do marketplace',
      line2: '✓ Definição de jobs e steps  ✓ Variáveis de ambiente  ✓ Build e health check automatizados'
    };
  })();

  const certificateSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" style="background: linear-gradient(135deg, #0d1117 0%, #21262d 100%);">
  <!-- Borda decorativa -->
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#238636" stroke-width="3" rx="15"/>
  <rect x="35" y="35" width="730" height="530" fill="none" stroke="#238636" stroke-width="1" rx="10"/>
  
  <!-- Header -->
  <text x="400" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#238636">
    CERTIFICADO DE CONCLUSÃO
  </text>
  
  <text x="400" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#8b949e">
    Desafio Descomplicando GitHub Actions
  </text>
  
  <!-- Linha decorativa -->
  <line x1="150" y1="140" x2="650" y2="140" stroke="#238636" stroke-width="2"/>
  
  <!-- Conteúdo principal -->
  <text x="400" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#f0f6fc">
    Este certificado atesta que
  </text>
  
  <text x="400" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#f0f6fc">
    ${username.toUpperCase()}
  </text>
  
  <text x="400" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#f0f6fc">
    concluiu com sucesso o desafio
  </text>
  
  <text x="400" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#238636">
    ${renderLevel === 3 ? 'Desafio 03 - Containers e Segurança' : renderLevel === 2 ? 'Desafio 02 - Testes Automatizados' : 'Desafio 01 - GitHub Actions Básico'}
  </text>
  
  <!-- Competências -->
  <text x="400" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#f0f6fc">
    COMPETÊNCIAS DESENVOLVIDAS:
  </text>
  
  <text x="400" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#8b949e">
    ${competencies.line1}
  </text>
  <text x="400" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#8b949e">
    ${competencies.line2}
  </text>
  
  
  <!-- Footer -->
  <text x="200" y="530" font-family="Arial, sans-serif" font-size="12" fill="#8b949e">
    Data: ${currentDate}
  </text>
  
  <text x="600" y="530" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#8b949e">
    LINUXtips
  </text>
  
  <text x="400" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#8b949e">
    Certificado gerado automaticamente • LINUXtips
  </text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="certificado-nivel-${renderLevel}-${username}-descomplicando-github-actions.svg"`);
  res.send(certificateSVG);
});

// Verificar status do workflow no GitHub
/* istanbul ignore next */
app.post('/api/check-github-status', async (req, res) => {
  try {
    const { repository, username } = req.body;

    if (!repository || !username) {
      return res.status(400).json({ error: 'Repository e username são obrigatórios' });
    }

    // Fazer request para a API do GitHub para verificar workflow runs
    const apiUrl = `https://api.github.com/repos/${username}/${repository}/actions/runs?status=success&per_page=15`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (response.ok && data.workflow_runs) {
      // Verificar se existe algum workflow run bem-sucedido
      const successfulRuns = data.workflow_runs.filter(run =>
        run.status === 'completed' &&
        run.conclusion === 'success' &&
        run.name && run.name.includes('Basic CI')
      );

      const challenge2Runs = data.workflow_runs.filter(run =>
        run.status === 'completed' &&
        run.conclusion === 'success' &&
        run.name && (run.name.includes('Nível 2') || run.name.includes('Testing'))
      );

      const challenge3Runs = data.workflow_runs.filter(run =>
        run.status === 'completed' &&
        run.conclusion === 'success' &&
        run.name && (run.name.includes('Nível 3') || run.name.includes('Containers') || run.name.includes('Security'))
      );

      // Verificar artefatos por nível (certificado gerado)
      let hasArtifactsLevel1 = false;
      let hasArtifactsLevel2 = false;
      let hasArtifactsLevel3 = false;
      if (successfulRuns.length > 0) {
        const latestL1 = successfulRuns[0];
        const artifactsUrlL1 = `https://api.github.com/repos/${username}/${repository}/actions/runs/${latestL1.id}/artifacts`;
        try {
          const respL1 = await fetch(artifactsUrlL1);
          const dataL1 = await respL1.json();
          const names = (dataL1.artifacts || []).map(a => a.name || '');
          hasArtifactsLevel1 = names.some(n => n.includes('level-1-certificate') || n.includes('certificate'));
        } catch (error) {
          console.log('Erro ao verificar artefatos L1:', error);
        }
      }
      if (challenge2Runs.length > 0) {
        const latestL2 = challenge2Runs[0];
        const artifactsUrlL2 = `https://api.github.com/repos/${username}/${repository}/actions/runs/${latestL2.id}/artifacts`;
        try {
          const respL2 = await fetch(artifactsUrlL2);
          const dataL2 = await respL2.json();
          const names = (dataL2.artifacts || []).map(a => a.name || '');
          hasArtifactsLevel2 = names.some(n => n.includes('level-2-certificate') || n.includes('certificate'));
        } catch (error) {
          console.log('Erro ao verificar artefatos L2:', error);
        }
      }
      if (challenge3Runs.length > 0) {
        const latestL3 = challenge3Runs[0];
        const artifactsUrlL3 = `https://api.github.com/repos/${username}/${repository}/actions/runs/${latestL3.id}/artifacts`;
        try {
          const respL3 = await fetch(artifactsUrlL3);
          const dataL3 = await respL3.json();
          const names = (dataL3.artifacts || []).map(a => a.name || '');
          hasArtifactsLevel3 = names.some(n => n.includes('level-3-certificate'));
        } catch (error) {
          console.log('Erro ao verificar artefatos L3:', error);
        }
      }

      // Verificar se o repositório tem o nome exato (case insensitive)
      const validRepoNames = [
        'linuxtips-github-actions',
        'LINUXtips-github-actions',
        'LINUXTIPS-GITHUB-ACTIONS'
      ];
      const repoNameValid = validRepoNames.some(validName =>
        repository.toLowerCase() === validName.toLowerCase()
      );

      const canAwardLevel1 = successfulRuns.length > 0 && repoNameValid && hasArtifactsLevel1;
      const canAwardLevel2 = challenge2Runs.length > 0 && repoNameValid && hasArtifactsLevel2;
      const canAwardLevel3 = challenge3Runs.length > 0 && repoNameValid && hasArtifactsLevel3;

      // Atualizar métrica de commits da branch padrão
      try {
        const repoResp = await fetch(`https://api.github.com/repos/${username}/${repository}`);
        if (repoResp.ok) {
          const repoJson = await repoResp.json();
          const defaultBranch = repoJson.default_branch;
          if (defaultBranch) {
            const commitsResp = await fetch(`https://api.github.com/repos/${username}/${repository}/commits?sha=${defaultBranch}&per_page=1`);
            if (commitsResp.ok) {
              const linkHeader = commitsResp.headers.get('link');
              let commitCount = 0;
              if (linkHeader && linkHeader.includes('rel="last"')) {
                const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
                if (match && match[1]) {
                  commitCount = parseInt(match[1], 10);
                }
              } else {
                // Sem paginação, pelo menos 0 ou 1 commit
                const oneCommit = await commitsResp.json();
                commitCount = Array.isArray(oneCommit) ? oneCommit.length : 0;
              }
              learningProgress.stats.commits = commitCount;
              learningProgress.lastUpdate = new Date().toISOString();
            }
          }
        }
      } catch (e) {
        // Não bloquear fluxo em caso de erro de métrica
      }

      const earnedBadges = [];
      if (canAwardLevel1 && !learningProgress.badges.includes('first-steps')) {
        earnedBadges.push('first-steps');
      }
      if (canAwardLevel2 && !learningProgress.badges.includes('testes-automatizados')) {
        earnedBadges.push('testes-automatizados');
        if (!learningProgress.badges.includes('first-steps')) {
          // Nível 2 pressupõe nível 1
          earnedBadges.push('first-steps');
        }
      }

      if (canAwardLevel3 && !learningProgress.badges.includes('containers-seguros')) {
        earnedBadges.push('containers-seguros');
        if (!learningProgress.badges.includes('testes-automatizados')) {
          earnedBadges.push('testes-automatizados');
        }
        if (!learningProgress.badges.includes('first-steps')) {
          earnedBadges.push('first-steps');
        }
      }

      if (earnedBadges.length > 0) {
        // Aplicar ganhos (evitar duplicados)
        for (const b of earnedBadges) {
          if (!learningProgress.badges.includes(b)) {
            learningProgress.badges.push(b);
          }
        }
        learningProgress.completedChallenges = Math.max(
          learningProgress.completedChallenges,
          learningProgress.badges.includes('containers-seguros') ? 3 : learningProgress.badges.includes('testes-automatizados') ? 2 : 1
        );
        learningProgress.stats.successfulBuilds += 1;
        if (earnedBadges.includes('containers-seguros')) {
          learningProgress.stats.deployments += 1;
        } else if (earnedBadges.includes('testes-automatizados')) {
          learningProgress.stats.testsRun += 1;
        } else {
          learningProgress.stats.commits += 1;
        }
        learningProgress.lastUpdate = new Date().toISOString();

        return res.json({
          success: true,
          badgeEarned: true,
          earnedBadges: Array.from(new Set(earnedBadges)),
          level: earnedBadges.includes('containers-seguros') ? 3 : earnedBadges.includes('testes-automatizados') ? 2 : 1,
          certificateReady: hasArtifactsLevel3 || hasArtifactsLevel2 || hasArtifactsLevel1,
          username: username,
          message: 'Progresso atualizado com sucesso!',
          progress: learningProgress
        });
      }

      if ((successfulRuns.length > 0 || challenge2Runs.length > 0 || challenge3Runs.length > 0) && !(hasArtifactsLevel1 || hasArtifactsLevel2 || hasArtifactsLevel3)) {
        return res.json({
          success: true,
          badgeEarned: false,
          message: 'Workflow executado, mas aguardando geração do certificado. Verifique os artefatos.',
          progress: learningProgress
        });
      }

      if (!repoNameValid) {
        return res.json({
          success: false,
          badgeEarned: false,
          message: 'Nome do repositório deve ser: LINUXtips-github-actions (qualquer combinação de maiúsculas/minúsculas)',
          progress: learningProgress
        });
      }

      return res.json({
        success: true,
        badgeEarned: false,
        message: 'Nenhuma atualização encontrada para este repositório.',
        progress: learningProgress
      });
    }

    return res.status(404).json({ error: 'Repositório não encontrado ou sem permissão' });

  } catch (error) {
    console.error('Erro ao verificar status do GitHub:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook para receber notificação direta do workflow
/* istanbul ignore next */
app.post('/api/workflow-complete', (req, res) => {
  try {
    const { username, repository, workflowName, runId, certificateGenerated } = req.body;

    // Validação básica
    if (!username || !repository || !workflowName || !runId) {
      return res.status(400).json({ error: 'Dados obrigatórios: username, repository, workflowName, runId' });
    }

    // Verificar se é o workflow correto
    if ((workflowName.includes('Basic CI') || workflowName.includes('Nível 2') || workflowName.includes('Nível 3')) && certificateGenerated === true) {
      // Atualizar progresso automaticamente
      if (!learningProgress.badges.includes('first-steps')) {
        learningProgress.badges.push('first-steps');
        learningProgress.completedChallenges = 1;
        learningProgress.stats.successfulBuilds += 1;
        learningProgress.stats.commits += 1;
        learningProgress.lastUpdate = new Date().toISOString();

        console.log(`Badge desbloqueado automaticamente para ${username}/${repository} (Run: ${runId})`);

        return res.json({
          success: true,
          message: 'Badge desbloqueado automaticamente!',
          badge: 'first-steps',
          certificateReady: true,
          username: username,
          progress: learningProgress
        });
      } else {
        // Para nível 2, adicionar badge específico
        if (workflowName.includes('Nível 2') && !learningProgress.badges.includes('testes-automatizados')) {
          learningProgress.badges.push('testes-automatizados');
          learningProgress.completedChallenges = Math.max(learningProgress.completedChallenges, 2);
          learningProgress.stats.testsRun += 1;
          learningProgress.lastUpdate = new Date().toISOString();
        }
        // Para nível 3, adicionar badge específico
        if (workflowName.includes('Nível 3') && !learningProgress.badges.includes('containers-seguros')) {
          learningProgress.badges.push('containers-seguros');
          learningProgress.completedChallenges = Math.max(learningProgress.completedChallenges, 3);
          learningProgress.stats.deployments += 1;
          learningProgress.lastUpdate = new Date().toISOString();
        }

        return res.json({
          success: true,
          message: 'Badge já estava desbloqueado',
          certificateReady: true,
          username: username,
          progress: learningProgress
        });
      }
    }

    return res.json({
      success: false,
      message: 'Workflow não reconhecido ou certificado não gerado'
    });

  } catch (error) {
    console.error('Erro no webhook do workflow:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Detectar informações do repositório atual
/* istanbul ignore next */
app.get('/api/repository-info', (req, res) => {
  // Em um ambiente real, isso seria detectado automaticamente
  // Por enquanto, retornamos informações para que o frontend possa usar
  res.json({
    message: 'Para verificação automática, informe seu usuário e repositório no GitHub',
    example: {
      username: 'seu-usuario',
      repository: 'LINUXtips-github-actions'
    },
    webhook: {
      url: `${req.protocol}://${req.get('host')}/api/workflow-complete`,
      method: 'POST',
      description: 'Endpoint para notificação automática do workflow'
    }
  });
});

// Rota para reset (útil para testes)
/* istanbul ignore next */
app.post('/api/reset', (req, res) => {
  learningProgress = {
    totalChallenges: 3,
    completedChallenges: 0,
    badges: [],
    lastUpdate: new Date().toISOString(),
    stats: {
      commits: 0,
      successfulBuilds: 0,
      deployments: 0,
      testsRun: 0
    }
  };

  res.json({ success: true, message: 'Progresso resetado!' });
});

// Rota principal
/* istanbul ignore next */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Iniciar servidor apenas se não estiver sendo importado (não em testes)
/* istanbul ignore next */
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Descomplicando GitHub Actions rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
  });
}

module.exports = app;
