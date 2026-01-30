import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse as csvParse } from 'csv-parse/sync';
import { Connector, ConnectorType, ConnectorStatus } from '../entities/connector.entity';
import { InterestSignal, EntityType } from '../entities/interest-signal.entity';

export interface UploadResult {
  success: boolean;
  signalsCreated: number;
  errors: string[];
  warnings: string[];
}

export interface UploadRequest {
  fileType: 'csv' | 'json' | 'text';
  fileName: string;
  content: string;
  dataCategory: string;
}

@Injectable()
export class UploadConnectorService {
  constructor(
    @InjectRepository(Connector)
    private connectorRepository: Repository<Connector>,
    @InjectRepository(InterestSignal)
    private signalRepository: Repository<InterestSignal>,
  ) {}

  async processUpload(userId: string, request: UploadRequest): Promise<UploadResult> {
    const result: UploadResult = {
      success: false,
      signalsCreated: 0,
      errors: [],
      warnings: [],
    };

    // Get or create upload connector
    let connector = await this.connectorRepository.findOne({
      where: { userId, type: ConnectorType.UPLOAD },
    });

    if (!connector) {
      connector = this.connectorRepository.create({
        userId,
        type: ConnectorType.UPLOAD,
        status: ConnectorStatus.ACTIVE,
        scopes: [],
        metadata: { uploads: [] },
      });
      await this.connectorRepository.save(connector);
    }

    try {
      let signals: InterestSignal[] = [];

      switch (request.fileType) {
        case 'csv':
          signals = await this.processCsv(userId, connector.id, request.content, request.dataCategory);
          break;
        case 'json':
          signals = await this.processJson(userId, connector.id, request.content, request.dataCategory);
          break;
        case 'text':
          signals = await this.processText(userId, connector.id, request.content, request.dataCategory);
          break;
        default:
          throw new BadRequestException('Unsupported file type');
      }

      if (signals.length > 0) {
        await this.signalRepository.save(signals);
        result.signalsCreated = signals.length;
      }

      // Update connector metadata
      connector.metadata = connector.metadata || { uploads: [] };
      connector.metadata.uploads.push({
        fileName: request.fileName,
        uploadedAt: new Date(),
        signalsCreated: signals.length,
      });
      connector.lastSyncAt = new Date();
      await this.connectorRepository.save(connector);

      result.success = true;
    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  private async processCsv(
    userId: string,
    connectorId: string,
    content: string,
    dataCategory: string,
  ): Promise<InterestSignal[]> {
    const signals: InterestSignal[] = [];

    try {
      const records = csvParse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      for (const record of records) {
        // Try to find relevant columns
        const topic = record.topic || record.interest || record.name || record.item || Object.values(record)[0];
        const weight = parseFloat(record.weight || record.score || record.rating || '1.0');
        const entity = record.entity || record.category || record.type;

        if (topic) {
          const signal = this.signalRepository.create({
            userId,
            source: ConnectorType.UPLOAD,
            connectorId,
            timestamp: new Date(),
            topic: String(topic).trim(),
            entity: entity ? String(entity).trim() : undefined,
            entityType: this.inferEntityType(dataCategory),
            weight: isNaN(weight) ? 1.0 : Math.min(Math.max(weight, 0), 1.0),
            confidence: 0.9,
            rawMetadata: {
              source: 'csv_upload',
              originalRecord: record,
              dataCategory,
            },
          });
          signals.push(signal);
        }
      }
    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }

    return signals;
  }

  private async processJson(
    userId: string,
    connectorId: string,
    content: string,
    dataCategory: string,
  ): Promise<InterestSignal[]> {
    const signals: InterestSignal[] = [];

    try {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : data.items || data.interests || data.data || [data];

      for (const item of items) {
        let topic: string;
        let weight = 1.0;
        let entity: string | undefined;

        if (typeof item === 'string') {
          topic = item;
        } else if (typeof item === 'object') {
          topic = item.topic || item.interest || item.name || item.title || JSON.stringify(item);
          weight = parseFloat(item.weight || item.score || '1.0');
          entity = item.entity || item.category;
        } else {
          continue;
        }

        if (topic) {
          const signal = this.signalRepository.create({
            userId,
            source: ConnectorType.UPLOAD,
            connectorId,
            timestamp: new Date(),
            topic: String(topic).trim(),
            entity: entity ? String(entity).trim() : undefined,
            entityType: this.inferEntityType(dataCategory),
            weight: isNaN(weight) ? 1.0 : Math.min(Math.max(weight, 0), 1.0),
            confidence: 0.9,
            rawMetadata: {
              source: 'json_upload',
              originalItem: item,
              dataCategory,
            },
          });
          signals.push(signal);
        }
      }
    } catch (error) {
      throw new BadRequestException(`Failed to parse JSON: ${error.message}`);
    }

    return signals;
  }

  private async processText(
    userId: string,
    connectorId: string,
    content: string,
    dataCategory: string,
  ): Promise<InterestSignal[]> {
    const signals: InterestSignal[] = [];

    // Split by newlines, commas, or semicolons
    const items = content
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item.length < 200);

    for (const item of items) {
      const signal = this.signalRepository.create({
        userId,
        source: ConnectorType.UPLOAD,
        connectorId,
        timestamp: new Date(),
        topic: item,
        entityType: this.inferEntityType(dataCategory),
        weight: 1.0,
        confidence: 0.8,
        rawMetadata: {
          source: 'text_upload',
          dataCategory,
        },
      });
      signals.push(signal);
    }

    return signals;
  }

  private inferEntityType(dataCategory: string): EntityType {
    const categoryMap: Record<string, EntityType> = {
      interests: EntityType.TOPIC,
      hobbies: EntityType.HOBBY,
      skills: EntityType.SKILL,
      careers: EntityType.CAREER,
      media: EntityType.MEDIA,
      people: EntityType.PERSON,
      organizations: EntityType.ORGANIZATION,
      places: EntityType.PLACE,
      events: EntityType.EVENT,
    };

    return categoryMap[dataCategory.toLowerCase()] || EntityType.TOPIC;
  }

  async getUploadHistory(userId: string): Promise<any[]> {
    const connector = await this.connectorRepository.findOne({
      where: { userId, type: ConnectorType.UPLOAD },
    });

    return connector?.metadata?.uploads || [];
  }
}
