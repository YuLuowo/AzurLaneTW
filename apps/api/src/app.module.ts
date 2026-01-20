import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShipsModule } from "@/ships/ships.module";

@Module({
    imports: [ShipsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
