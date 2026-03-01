import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Subscription = {
  unsubscribe: () => Promise<void>;
};

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    void this.configService;
  }

  async publish(channel: string, message: string) {
    void channel;
    void message;
  }

  async subscribe(channel: string, handler: (message: string) => void): Promise<Subscription> {
    void channel;
    void handler;
    return {
      unsubscribe: async () => {
        this.logger.log('Redis subscribe placeholder');
      },
    };
  }
}
