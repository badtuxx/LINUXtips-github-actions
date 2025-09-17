const request = require('supertest');
const app = require('./server');

describe('Testes do Descomplicando GitHub Actions', () => {
  beforeEach(async () => {
    await request(app).post('/api/reset');
  });

  // GET /api/progress
  it('deve retornar progresso do aprendizado e badges disponíveis', async () => {
    const res = await request(app).get('/api/progress');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalChallenges');
    expect(res.body).toHaveProperty('availableBadges');
    expect(typeof res.body.availableBadges).toBe('object');
  });

  // GET /health
  it('deve retornar status OK e timestamp no /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });

  // POST /api/progress/update
  it('deve atualizar progresso com badge e stats', async () => {
    const update = await request(app)
      .post('/api/progress/update')
      .send({ challenge: 'first-steps', stats: { commits: 1, testsRun: 3 } });
    expect(update.statusCode).toBe(200);
    expect(update.body).toHaveProperty('success', true);
    expect(update.body.progress.badges).toContain('first-steps');
  });

  // GET /api/certificate/:username
  it('deve retornar 404 quando certificado não estiver disponível', async () => {
    const res = await request(app).get('/api/certificate/fabio');
    expect(res.statusCode).toBe(404);
  });

  // POST /api/check-github-status
  it('deve retornar 404 quando API do GitHub não estiver OK', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    const res = await request(app).post('/api/check-github-status').send({ repository: 'LINUXtips-github-actions', username: 'user' });
    expect(res.statusCode).toBe(404);
    global.fetch = originalFetch;
  });

  // GET /api/repository-info
  it('deve retornar informações do repositório e webhook', async () => {
    const res = await request(app).get('/api/repository-info');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('webhook');
  });

  // POST /api/reset
  it('deve resetar o progresso', async () => {
    const res = await request(app).post('/api/reset');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  // GET /
  it('deve servir a página inicial', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.type).toMatch(/html/);
  });
});

