const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

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
  totalChallenges: 1,
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

app.get('/api/badge/:badgeId', (req, res) => {
  const badgeId = req.params.badgeId;
  const badge = availableBadges[badgeId];

  if (!badge) {
    return res.status(404).json({ error: 'Badge não encontrado' });
  }

  // Gerar SVG do badge
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50">
  <rect width="200" height="50" fill="${badge.color}" rx="5"/>
  <text x="10" y="20" fill="white" font-family="Arial" font-size="12" font-weight="bold">
    ${badge.name}
  </text>
  <text x="10" y="35" fill="white" font-family="Arial" font-size="10">
    ${badge.description}
  </text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.send(svg);
});

// Gerar certificado visual para compartilhamento
app.get('/api/certificate/:username', (req, res) => {
  const username = req.params.username;

  if (!learningProgress.badges.includes('first-steps')) {
    return res.status(404).json({ error: 'Certificado não disponível. Complete o desafio primeiro!' });
  }

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Gerar SVG do certificado para compartilhamento social
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
    Desafio 01 - GitHub Actions Básico
  </text>
  
  <!-- Competências -->
  <text x="400" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#f0f6fc">
    COMPETÊNCIAS DESENVOLVIDAS:
  </text>
  
  <text x="400" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#8b949e">
    ✓ Configuração de workflow básico  ✓ Uso de actions do marketplace
  </text>
  <text x="400" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#8b949e">
    ✓ Definição de jobs e steps  ✓ Variáveis de ambiente  ✓ Build e health check automatizados
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
  res.setHeader('Content-Disposition', `inline; filename="certificado-${username}-descomplicando-github-actions.svg"`);
  res.send(certificateSVG);
});

// Verificar status do workflow no GitHub
app.post('/api/check-github-status', async (req, res) => {
  try {
    const { repository, username } = req.body;

    if (!repository || !username) {
      return res.status(400).json({ error: 'Repository e username são obrigatórios' });
    }

    // Fazer request para a API do GitHub para verificar workflow runs
    const apiUrl = `https://api.github.com/repos/${username}/${repository}/actions/runs?status=success&per_page=10`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (response.ok && data.workflow_runs) {
      // Verificar se existe algum workflow run bem-sucedido
      const successfulRuns = data.workflow_runs.filter(run =>
        run.status === 'completed' &&
        run.conclusion === 'success' &&
        run.name && run.name.includes('Basic CI')
      );

      // Verificar se algum dos runs tem artefatos (certificado foi gerado)
      let hasArtifacts = false;
      if (successfulRuns.length > 0) {
        // Verificar artefatos do run mais recente
        const latestRun = successfulRuns[0];
        const artifactsUrl = `https://api.github.com/repos/${username}/${repository}/actions/runs/${latestRun.id}/artifacts`;

        try {
          const artifactsResponse = await fetch(artifactsUrl);
          const artifactsData = await artifactsResponse.json();

          hasArtifacts = artifactsData.artifacts &&
            artifactsData.artifacts.some(artifact =>
              artifact.name.includes('level-1-certificate') ||
              artifact.name.includes('certificate')
            );
        } catch (error) {
          console.log('Erro ao verificar artefatos:', error);
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

      if (successfulRuns.length > 0 && hasArtifacts && repoNameValid && !learningProgress.badges.includes('first-steps')) {
        // Atualizar progresso automaticamente
        learningProgress.badges.push('first-steps');
        learningProgress.completedChallenges = 1;
        learningProgress.stats.successfulBuilds += 1;
        learningProgress.stats.commits += 1;
        learningProgress.lastUpdate = new Date().toISOString();

        return res.json({
          success: true,
          badgeEarned: true,
          certificateReady: true,
          username: username,
          message: 'Parabéns! Workflow executado com sucesso e certificado gerado!',
          progress: learningProgress
        });
      }

      if (successfulRuns.length > 0 && !hasArtifacts) {
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
        message: 'Execute o workflow no GitHub Actions e aguarde a geração do certificado.',
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
app.post('/api/workflow-complete', (req, res) => {
  try {
    const { username, repository, workflowName, runId, certificateGenerated } = req.body;

    // Validação básica
    if (!username || !repository || !workflowName || !runId) {
      return res.status(400).json({ error: 'Dados obrigatórios: username, repository, workflowName, runId' });
    }

    // Verificar se é o workflow correto
    if (workflowName.includes('Basic CI') && certificateGenerated === true) {
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
app.post('/api/reset', (req, res) => {
  learningProgress = {
    totalChallenges: 1,
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
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Descomplicando GitHub Actions rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
  });
}

module.exports = app;
