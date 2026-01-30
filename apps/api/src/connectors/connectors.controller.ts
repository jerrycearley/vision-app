import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConnectorsService } from './connectors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InitiateOAuthDto, OAuthCallbackDto, UploadImportDto, GetSignalsDto } from './dto/connectors.dto';
import { ConnectorType } from './entities/connector.entity';

@ApiTags('connectors')
@Controller('connectors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Get('available')
  @ApiOperation({ summary: 'Get all available connectors' })
  @ApiResponse({ status: 200, description: 'List of available connectors' })
  async getAvailableConnectors() {
    return this.connectorsService.getAvailableConnectors();
  }

  @Get()
  @ApiOperation({ summary: 'Get user connected connectors' })
  @ApiResponse({ status: 200, description: 'List of user connectors' })
  async getUserConnectors(@Request() req) {
    return this.connectorsService.getUserConnectors(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get connector by ID' })
  @ApiResponse({ status: 200, description: 'Connector details' })
  async getConnector(@Request() req, @Param('id') id: string) {
    return this.connectorsService.getConnector(req.user.userId, id);
  }

  @Post('oauth/initiate')
  @ApiOperation({ summary: 'Initiate OAuth flow for a connector' })
  @ApiResponse({ status: 200, description: 'OAuth URL to redirect user' })
  async initiateOAuth(@Request() req, @Body() dto: InitiateOAuthDto) {
    return this.connectorsService.initiateOAuthFlow(
      req.user.userId,
      dto.connectorType as ConnectorType,
      dto.scopes,
      req.user.isMinor,
    );
  }

  @Post('oauth/callback/:type')
  @ApiOperation({ summary: 'Handle OAuth callback' })
  @ApiResponse({ status: 200, description: 'Connector created/updated' })
  async handleOAuthCallback(
    @Param('type') type: string,
    @Body() dto: OAuthCallbackDto,
  ) {
    return this.connectorsService.handleOAuthCallback(
      type as ConnectorType,
      dto.code,
      dto.state,
    );
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload file to import interests' })
  @ApiResponse({ status: 201, description: 'Import result' })
  async uploadImport(@Request() req, @Body() dto: UploadImportDto) {
    return this.connectorsService.uploadImport(
      req.user.userId,
      dto,
      req.user.isMinor,
    );
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sync connector data' })
  @ApiResponse({ status: 200, description: 'Sync completed' })
  async syncConnector(@Request() req, @Param('id') id: string) {
    return this.connectorsService.syncConnector(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect a connector' })
  @ApiResponse({ status: 200, description: 'Connector disconnected' })
  async disconnectConnector(@Request() req, @Param('id') id: string) {
    return this.connectorsService.disconnectConnector(req.user.userId, id);
  }

  @Get('signals/all')
  @ApiOperation({ summary: 'Get all interest signals' })
  @ApiResponse({ status: 200, description: 'List of interest signals' })
  async getInterestSignals(@Request() req, @Query() query: GetSignalsDto) {
    return this.connectorsService.getInterestSignals(req.user.userId, {
      source: query.source as ConnectorType,
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get('signals/aggregated')
  @ApiOperation({ summary: 'Get aggregated interests from all sources' })
  @ApiResponse({ status: 200, description: 'Aggregated interests' })
  async getAggregatedInterests(@Request() req) {
    return this.connectorsService.getAggregatedInterests(req.user.userId);
  }

  @Delete('signals/:id')
  @ApiOperation({ summary: 'Delete an interest signal' })
  @ApiResponse({ status: 200, description: 'Signal deleted' })
  async deleteSignal(@Request() req, @Param('id') id: string) {
    return this.connectorsService.deleteSignal(req.user.userId, id);
  }
}
