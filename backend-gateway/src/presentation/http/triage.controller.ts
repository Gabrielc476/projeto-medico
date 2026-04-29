import { Controller, Post, Body, Get, Param } from '@nestjs/common';

@Controller('triage')
export class TriageController {
  @Post('start')
  async startTriage(@Body() data: { patientId: string }) {
    return {
      sessionId: 'mock-session-id',
      status: 'PENDING',
      message: 'Triage started for patient ' + data.patientId,
    };
  }

  @Get(':id')
  async getStatus(@Param('id') id: string) {
    return {
      sessionId: id,
      status: 'IN_PROGRESS',
    };
  }
}
