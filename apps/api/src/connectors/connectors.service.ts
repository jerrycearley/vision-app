import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connector, ConnectorType, ConnectorStatus } from './entities/connector.entity';
import { InterestSignal } from './entities/interest-signal.entity';
import { GoogleConnectorService } from './services/google-connector.service';
import { UploadConnectorService, UploadRequest } from './services/upload-connector.service';
import { GuardiansService } from '../guardians/guardians.service';
import { CONNECTOR_CONFIGS } from '@vision/shared';

@Injectable()
export class ConnectorsService {
  constructor(
    @InjectRepository(Connector)
    private connectorRepository: Repository<Connector>,
    @InjectRepository(InterestSignal)
    private signalRepository: Repository<InterestSignal>,
    private googleConnector: GoogleConnectorService,
    private uploadConnector: UploadConnectorService,
    private guardiansService: GuardiansService,
  ) {}

  async getAvailableConnectors() {
    return Object.values(CONNECTOR_CONFIGS);
  }

  async getUserConnectors(userId: string) {
    return this.connectorRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getConnector(userId: string, connectorId: string) {
    const connector = await this.connectorRepository.findOne({
      where: { id: connectorId, userId },
    });

    if (!connector) {
      throw new NotFoundException('Connector not found');
    }

    return connector;
  }

  async initiateOAuthFlow(
    userId: string,
    connectorType: ConnectorType,
    scopes: string[],
    isMinor: boolean,
  ) {
    // Check guardian consent for minors
    if (isMinor) {
      const hasConsent = await this.guardiansService.hasConsentFor(userId, connectorType);
      if (!hasConsent) {
        throw new ForbiddenException('Guardian consent required for this connector');
      }
    }

    switch (connectorType) {
      case ConnectorType.GOOGLE:
        const state = Buffer.from(JSON.stringify({ userId, scopes })).toString('base64');
        return {
          authUrl: this.googleConnector.getAuthUrl(scopes, state),
          connectorType,
        };

      default:
        throw new NotFoundException(`OAuth not implemented for ${connectorType}`);
    }
  }

  async handleOAuthCallback(
    connectorType: ConnectorType,
    code: string,
    state: string,
  ) {
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId, scopes } = stateData;

    switch (connectorType) {
      case ConnectorType.GOOGLE:
        return this.googleConnector.exchangeCode(code, userId, scopes);

      default:
        throw new NotFoundException(`OAuth callback not implemented for ${connectorType}`);
    }
  }

  async uploadImport(userId: string, request: UploadRequest, isMinor: boolean) {
    // Check guardian consent for minors
    if (isMinor) {
      const hasConsent = await this.guardiansService.hasConsentFor(userId, 'upload');
      if (!hasConsent) {
        throw new ForbiddenException('Guardian consent required for file uploads');
      }
    }

    return this.uploadConnector.processUpload(userId, request);
  }

  async syncConnector(userId: string, connectorId: string) {
    const connector = await this.getConnector(userId, connectorId);

    switch (connector.type) {
      case ConnectorType.GOOGLE:
        await this.googleConnector.syncGoogleData(connector);
        break;

      default:
        throw new NotFoundException(`Sync not implemented for ${connector.type}`);
    }

    return this.getConnector(userId, connectorId);
  }

  async disconnectConnector(userId: string, connectorId: string) {
    const connector = await this.getConnector(userId, connectorId);

    switch (connector.type) {
      case ConnectorType.GOOGLE:
        await this.googleConnector.disconnect(connector);
        break;

      default:
        connector.status = ConnectorStatus.DISCONNECTED;
        await this.connectorRepository.save(connector);
    }

    return { success: true, message: 'Connector disconnected' };
  }

  async getInterestSignals(
    userId: string,
    options: {
      source?: ConnectorType;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const query = this.signalRepository
      .createQueryBuilder('signal')
      .where('signal.userId = :userId', { userId })
      .orderBy('signal.timestamp', 'DESC');

    if (options.source) {
      query.andWhere('signal.source = :source', { source: options.source });
    }

    if (options.limit) {
      query.take(options.limit);
    }

    if (options.offset) {
      query.skip(options.offset);
    }

    return query.getMany();
  }

  async getAggregatedInterests(userId: string) {
    const signals = await this.signalRepository.find({
      where: { userId },
      order: { weight: 'DESC' },
    });

    // Aggregate by topic
    const topicWeights: Record<string, { weight: number; count: number; sources: Set<string> }> = {};

    for (const signal of signals) {
      if (!topicWeights[signal.topic]) {
        topicWeights[signal.topic] = { weight: 0, count: 0, sources: new Set() };
      }
      topicWeights[signal.topic].weight += signal.weight * signal.confidence;
      topicWeights[signal.topic].count += 1;
      topicWeights[signal.topic].sources.add(signal.source);
    }

    // Convert to sorted array
    return Object.entries(topicWeights)
      .map(([topic, data]) => ({
        topic,
        weight: data.weight / data.count,
        occurrences: data.count,
        sources: Array.from(data.sources),
      }))
      .sort((a, b) => b.weight - a.weight);
  }

  async deleteSignal(userId: string, signalId: string) {
    const signal = await this.signalRepository.findOne({
      where: { id: signalId, userId },
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    await this.signalRepository.remove(signal);
    return { success: true };
  }
}
