import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google, youtube_v3 } from 'googleapis';
import { Connector, ConnectorType, ConnectorStatus } from '../entities/connector.entity';
import { InterestSignal, EntityType } from '../entities/interest-signal.entity';

@Injectable()
export class GoogleConnectorService {
  private oauth2Client;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Connector)
    private connectorRepository: Repository<Connector>,
    @InjectRepository(InterestSignal)
    private signalRepository: Repository<InterestSignal>,
  ) {
    const clientId = this.configService.get<string>('google.clientId');
    const clientSecret = this.configService.get<string>('google.clientSecret');
    const redirectUri = this.configService.get<string>('google.redirectUri');

    if (clientId && clientSecret) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    }
  }

  getAuthUrl(scopes: string[], state: string): string {
    if (!this.oauth2Client) {
      throw new BadRequestException('Google OAuth not configured');
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state,
      prompt: 'consent',
    });
  }

  async exchangeCode(code: string, userId: string, scopes: string[]): Promise<Connector> {
    if (!this.oauth2Client) {
      throw new BadRequestException('Google OAuth not configured');
    }

    const { tokens } = await this.oauth2Client.getToken(code);

    // Check for existing connector
    let connector = await this.connectorRepository.findOne({
      where: { userId, type: ConnectorType.GOOGLE },
    });

    if (connector) {
      connector.accessToken = tokens.access_token;
      connector.refreshToken = tokens.refresh_token || connector.refreshToken;
      connector.tokenExpiresAt = new Date(tokens.expiry_date);
      connector.scopes = scopes;
      connector.status = ConnectorStatus.ACTIVE;
    } else {
      connector = this.connectorRepository.create({
        userId,
        type: ConnectorType.GOOGLE,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: new Date(tokens.expiry_date),
        scopes,
        status: ConnectorStatus.ACTIVE,
      });
    }

    await this.connectorRepository.save(connector);

    // Sync data in background
    this.syncGoogleData(connector).catch(console.error);

    return connector;
  }

  async syncGoogleData(connector: Connector): Promise<void> {
    this.oauth2Client.setCredentials({
      access_token: connector.accessToken,
      refresh_token: connector.refreshToken,
    });

    const signals: InterestSignal[] = [];

    // Get YouTube data if scope allows
    if (connector.scopes.includes('https://www.googleapis.com/auth/youtube.readonly')) {
      try {
        const youtubeSignals = await this.fetchYouTubeInterests(connector);
        signals.push(...youtubeSignals);
      } catch (error) {
        console.error('Error fetching YouTube data:', error);
      }
    }

    // Save signals
    if (signals.length > 0) {
      await this.signalRepository.save(signals);
    }

    // Update last sync
    connector.lastSyncAt = new Date();
    await this.connectorRepository.save(connector);
  }

  private async fetchYouTubeInterests(connector: Connector): Promise<InterestSignal[]> {
    const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
    const signals: InterestSignal[] = [];

    try {
      // Get subscriptions
      const subscriptions = await youtube.subscriptions.list({
        part: ['snippet'],
        mine: true,
        maxResults: 50,
      });

      for (const sub of subscriptions.data.items || []) {
        const signalData: Partial<InterestSignal> = {
          userId: connector.userId,
          source: ConnectorType.GOOGLE,
          connectorId: connector.id,
          sourceId: sub.id ?? undefined,
          timestamp: new Date(),
          topic: sub.snippet?.title || 'Unknown Channel',
          entity: sub.snippet?.channelId ?? undefined,
          entityType: EntityType.MEDIA,
          weight: 1.0,
          confidence: 0.8,
          rawMetadata: {
            type: 'youtube_subscription',
            channelId: sub.snippet?.channelId,
            description: sub.snippet?.description,
            thumbnails: sub.snippet?.thumbnails,
          },
        };
        const signal = this.signalRepository.create(signalData);
        signals.push(signal);
      }

      // Get liked videos categories
      const likedVideos = await youtube.videos.list({
        part: ['snippet'],
        myRating: 'like',
        maxResults: 25,
      });

      const categoryCount: Record<string, number> = {};
      for (const video of likedVideos.data.items || []) {
        const category = video.snippet?.categoryId || 'unknown';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }

      // Create signals for top categories
      for (const [category, count] of Object.entries(categoryCount)) {
        if (count >= 2) {
          const signalData: Partial<InterestSignal> = {
            userId: connector.userId,
            source: ConnectorType.GOOGLE,
            connectorId: connector.id,
            timestamp: new Date(),
            topic: `YouTube Category ${category}`,
            entityType: EntityType.TOPIC,
            weight: Math.min(count / 5, 1.0),
            confidence: 0.7,
            rawMetadata: {
              type: 'youtube_category',
              categoryId: category,
              videoCount: count,
            },
          };
          const signal = this.signalRepository.create(signalData);
          signals.push(signal);
        }
      }
    } catch (error) {
      console.error('Error fetching YouTube interests:', error);
    }

    return signals;
  }

  async refreshToken(connector: Connector): Promise<Connector> {
    if (!this.oauth2Client || !connector.refreshToken) {
      throw new BadRequestException('Cannot refresh token');
    }

    this.oauth2Client.setCredentials({
      refresh_token: connector.refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();

    connector.accessToken = credentials.access_token;
    connector.tokenExpiresAt = new Date(credentials.expiry_date);
    connector.status = ConnectorStatus.ACTIVE;

    await this.connectorRepository.save(connector);

    return connector;
  }

  async disconnect(connector: Connector): Promise<void> {
    connector.status = ConnectorStatus.DISCONNECTED;
    connector.accessToken = null;
    connector.refreshToken = null;
    await this.connectorRepository.save(connector);
  }
}
