import path from 'path';
import { test, expect } from '@playwright/test';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

test.describe('GraphQL and gRPC examples', () => {
  test('should execute a GraphQL query against a public endpoint', async ({ request }) => {
    const response = await request.post('https://countries.trevorblades.com/', {
      headers: {
        'content-type': 'application/json',
      },
      data: {
        query: `
          query GetCountries {
            countries {
              code
              name
            }
          }
        `,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('data');
    expect(body.data.countries.length).toBeGreaterThan(0);
    expect(body.data.countries[0]).toHaveProperty('name');
    expect(body.data.countries[0]).toHaveProperty('code');
  });

  test('should execute a local gRPC call', async () => {
    const protoPath = path.resolve(__dirname, '../../test-data/grpc/hello.proto');
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const helloProto = grpc.loadPackageDefinition(packageDefinition) as any;
    const greeterService = helloProto.demo.Greeter;

    let server: grpc.Server | undefined;
    let port: number | undefined;

    const startServer = async () => {
      server = new grpc.Server();
      server.addService(greeterService.service, {
        SayHello: (call: any, callback: any) => {
          callback(null, { message: `Hello ${call.request.name}` });
        },
      });

      port = await new Promise<number>((resolve, reject) => {
        server!.bindAsync('127.0.0.1:0', grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
          if (err) {
            reject(err);
            return;
          }

          server!.start();
          resolve(boundPort);
        });
      });
    };

    const stopServer = async () => {
      if (!server) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        server!.tryShutdown((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    };

    await startServer();

    try {
      const client = new greeterService(`127.0.0.1:${port}`, grpc.credentials.createInsecure());
      const response = await new Promise<{ message: string }>((resolve, reject) => {
        client.sayHello({ name: 'Playwright' }, (error: Error | null, result: { message: string }) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        });
      });

      expect(response.message).toBe('Hello Playwright');
    } finally {
      await stopServer();
    }
  });
});
