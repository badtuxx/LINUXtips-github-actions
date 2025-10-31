// server.extra.test.js
const request = require('supertest');

// Silencia logs de erro pra não poluir a saída dos testes
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// utilitário: carrega o app somente depois de setar os mocks
function loadApp() {
  jest.resetModules();
  // eslint-disable-next-line global-require
  return require('./server');
}

describe('Testes extras para aumentar cobertura', () => {
  afterEach(() => {
    if (typeof global.fetchRestore === 'function') {
      global.fetchRestore();
      global.fetchRestore = undefined;
    }
  });

  test('certificado disponível retorna arquivo (Buffer) 200/201', async () => {
    const app = loadApp();

    await request(app).post('/api/reset');

    await request(app)
      .post('/api/progress/update')
      .send({ challenge: 'testes-automatizados', stats: { commits: 5, testsRun: 10 } })
      .set('Content-Type', 'application/json')
      .expect(200);

    const res = await request(app).get('/api/certificate/fabio');
    expect([200, 201]).toContain(res.statusCode);
    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('check-github-status (SUCESSO): 200 com badge e progresso', async () => {
    // Mocka TODAS as chamadas que a rota faz:
    // 1) workflow runs, 2) artifacts, 3) repo info, 4) commits
    const originalFetch = global.fetch;
    global.fetch = jest.fn()
      // 1ª chamada → lista de runs com sucesso
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflow_runs: [
            { status: 'completed', conclusion: 'success', name: 'Nível 2', id: 123 }
          ]
        })
      })
      // 2ª chamada → artifacts
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ artifacts: [{ name: 'level-2-certificate' }] })
      })
      // 3ª chamada → info do repo
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ default_branch: 'main' })
      })
      // 4ª chamada → commits
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => null },
        json: async () => ([{ sha: 'abc123' }])
      });
    global.fetchRestore = () => { global.fetch = originalFetch; };

    const app = loadApp();
    await request(app).post('/api/reset');

    const res = await request(app)
      .post('/api/check-github-status')
      .send({
        username: 'Manoel',                 // separado, conforme o server exige
        repository: 'LINUXtips-github-actions'
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    // resposta típica esperada pela rota quando tudo dá certo:
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('badgeEarned');
    expect(res.body).toHaveProperty('progress');
  });

  test('check-github-status (EXCEÇÃO): 500/502', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('boom'));
    global.fetchRestore = () => { global.fetch = originalFetch; };

    const app = loadApp();
    await request(app).post('/api/reset');

    const res = await request(app)
      .post('/api/check-github-status')
      .send({ username: 'Manoel', repository: 'LINUXtips-github-actions' })
      .set('Content-Type', 'application/json');

    expect([500, 502]).toContain(res.statusCode);
  });

  test('método não permitido em /api/progress/update retorna 404/405', async () => {
    const app = loadApp();
    await request(app).post('/api/reset');

    const res = await request(app).put('/api/progress/update');
    expect([404, 405]).toContain(res.statusCode);
  });
});