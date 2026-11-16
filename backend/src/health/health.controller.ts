import { Controller, Get } from '@nestjs/common';

// Public liveness probe — no auth. If this answers, the backend is up and
// listening; use it to distinguish "backend down" (connection refused) from
// login/credential problems.
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok', service: 'subflow-backend', timestamp: new Date().toISOString() };
  }
}
