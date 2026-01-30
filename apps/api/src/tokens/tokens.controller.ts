import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tokens')
@Controller('tokens')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get token settings' })
  @ApiResponse({ status: 200, description: 'Token settings' })
  async getSettings() {
    return this.tokensService.getSettings();
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get current token balance' })
  @ApiResponse({ status: 200, description: 'Token balance' })
  async getBalance(@Request() req) {
    const balance = await this.tokensService.getBalance(req.user.userId);
    const lockStatus = await this.tokensService.getLockStatus(req.user.userId);

    return {
      ...balance,
      totalBalance: Number(balance.availableBalance) + Number(balance.lockedBalance),
      lockStatus,
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get token transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history' })
  async getHistory(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.tokensService.getLedgerHistory(req.user.userId, { limit, offset });
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer tokens to another user' })
  @ApiResponse({ status: 200, description: 'Transfer successful' })
  @ApiResponse({ status: 403, description: 'Minors cannot transfer tokens' })
  async transfer(
    @Request() req,
    @Body() body: { recipientId: string; amount: number; notes?: string },
  ) {
    return this.tokensService.transferTokens(
      req.user.userId,
      body.recipientId,
      body.amount,
      body.notes,
    );
  }

  @Post('check-unlock')
  @ApiOperation({ summary: 'Check and unlock tokens if eligible' })
  @ApiResponse({ status: 200, description: 'Unlock check result' })
  async checkUnlock(@Request() req) {
    return this.tokensService.checkAndUnlockTokens(req.user.userId);
  }

  @Get('verify-integrity')
  @ApiOperation({ summary: 'Verify ledger integrity' })
  @ApiResponse({ status: 200, description: 'Integrity check result' })
  async verifyIntegrity(@Request() req) {
    return this.tokensService.verifyLedgerIntegrity(req.user.userId);
  }
}
