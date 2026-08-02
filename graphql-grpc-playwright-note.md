---
marp: true
paginate: true
theme: default
title: GraphQL and gRPC in Playwright
---

# GraphQL and gRPC in Playwright

## 1. What is the difference?

- GraphQL uses HTTP and JSON.
- gRPC uses a binary RPC protocol with a `.proto` definition.
- In Playwright, GraphQL is usually tested with the built-in request API.
- For gRPC, you use Node gRPC libraries inside the test.

---

## 2. How to test GraphQL in Playwright

### Step 1: Send a POST request
Use `request.post()` with a GraphQL query body.

```ts
const response = await request.post('https://countries.trevorblades.com/', {
  data: {
    query: `
      query GetCountries {
        countries {
          code
          name
        }
      }
    `
  }
});
```
---
### Step 2: Validate the response
Check the HTTP status and parse the JSON body.

```ts
expect(response.status()).toBe(200);
const body = await response.json();
expect(body.data.countries.length).toBeGreaterThan(0);
```

---

## 3. How to test gRPC in Playwright

### Step 1: Install required packages

```bash
npm install @grpc/grpc-js @grpc/proto-loader
```

### Step 2: Create a `.proto` file
Define the service and message structure.

```proto
syntax = "proto3";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}
```
---

### Step 3: Load the proto and create a client

```ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync('hello.proto', {});
const helloProto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new helloProto.demo.Greeter(
  '127.0.0.1:50051',
  grpc.credentials.createInsecure()
);
```

### Step 4: Call the RPC method

```ts
client.sayHello({ name: 'Playwright' }, (err, response) => {
  console.log(response.message);
});
```

---

## 4. Quick summary

- Use GraphQL for JSON-based API testing.
- Use gRPC for service-to-service RPC testing.
- Playwright handles the test flow, while GraphQL/gRPC libraries handle the protocol.

---

## 5. Example commands

```bash
npx playwright test --project=api-tests tests/e2e/api/graphql-grpc-examples.spec.ts
```

```bash
npm run test:graphql
npm run test:grpc
```
