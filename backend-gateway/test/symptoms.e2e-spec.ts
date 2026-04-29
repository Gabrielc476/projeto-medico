import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { AppModule } from '../src/app.module';
import { IDiagnosticClient } from '../src/domain/ports/diagnostic-client.port';
import { of } from 'rxjs';

describe('SymptomController (e2e)', () => {
  let app: INestApplication;
  const mockDiagnosticClient = {
    getAppSymptoms: vi.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(IDiagnosticClient)
      .useValue(mockDiagnosticClient)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/symptoms/sync (POST) should trigger synchronization', async () => {
    mockDiagnosticClient.getAppSymptoms.mockReturnValue(of({ symptoms: [] }));

    const response = await request(app.getHttpServer())
      .post('/symptoms/sync')
      .expect(200);

    expect(response.body.message).toBe('Synchronization started');
    expect(mockDiagnosticClient.getAppSymptoms).toHaveBeenCalled();
  });

  it('/symptoms (GET) should return symptoms from cache', async () => {
    const response = await request(app.getHttpServer())
      .get('/symptoms')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
