# 3D Cost Calculator

An industrial-grade platform for 3D printing cost estimation, geometry analysis, and project management. Designed with a minimalist, high-performance aesthetic.

## Overview

The 3D Cost Calculator allows users to upload 3D models (STL, OBJ), visualize them in real-time, and compute precise manufacturing costs based on industrial parameters. It features an asynchronous processing pipeline to handle large assets without blocking the user interface.

### Key Features
- **3D Visualization**: Hardware-accelerated WebGL viewer using React Three Fiber.
- **Asynchronous Analysis**: Background geometry processing (volume, dimensions, polygons) via BullMQ and Redis.
- **Industrial Calculation Engine**: Comprehensive cost-plus pricing model including material, electricity, depreciation, and tax.
- **AI-Assisted Documentation**: Automatic generation of technical and commercial project descriptions.
- **Minimalist Design**: Typography-first, whitespace-driven UI for maximum focus.

## Requirements

- **Node.js**: v18.x or higher
- **PostgreSQL**: Local or cloud instance for the primary database
- **Redis**: Required for BullMQ task orchestration (default: `localhost:6379`)

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/3d_calculator"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Redis (for BullMQ)
REDIS_URL="redis://localhost:6379"
```

## Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Migration**
   ```bash
   npx prisma migrate dev
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Background Worker** (Separate Terminal)
   ```bash
   # Using tsx to run the TypeScript worker directly
   npx tsx workers/model-processor.ts
   ```

## Project Structure

- **`/app`**: Next.js App Router (Pages and API Routes)
- **`/components`**: Shared UI components and specialized modules (Viewer, Upload, Editor)
- **`/lib`**: Core utilities, Prisma client, and calculation logic
- **`/workers`**: BullMQ background workers for 3D parsing
- **`/uploads`**: Temporary storage for processed 3D assets (gitignored)
- **`/examples`**: Place your sample `.stl` or `.obj` models here for testing

## Core Architecture

### 1. Upload Flow
When a user uploads a model, it is received by a Next.js API route, assigned a unique ID, and stored in the `/uploads` directory. A record is created in the database with an `UPLOADING` status.

### 2. Task Queue
Immediately after upload, a job is pushed to the `modelProcessingQueue` (BullMQ/Redis). This ensures the application remains responsive even during heavy processing.

### 3. Worker Processing
The background worker picks up the job, uses `three.js` to parse the geometry, and computes:
- **Dimensions**: Precise bounding box (X, Y, Z).
- **Volume**: Computed via face-vector dot products (cm³).
- **Polygon Count**: Mesh complexity analysis.

### 4. Calculation Engine
The engine takes the computed volume and combines it with user-defined parameters (Material Price, Density, Electricity Rate) to generate a full financial breakdown persisted in the database.

## Quality Standards

- **Strict Typing**: Full TypeScript coverage for backend and frontend.
- **Minimalist Design**: Zero visual noise, focus on whitespace and typography.
- **Industrial Logic**: Calculations follow standard manufacturing cost-plus models.
