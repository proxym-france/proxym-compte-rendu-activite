import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CraApplication } from './domain/application/craApplication';
import { RepoCollab } from './data/Repository/RepoCollab';
import { UserDB } from './data/dataModel/user.entity';
import { AbsenceDB } from './data/dataModel/absence.entity';
import { ActivityDB } from './data/dataModel/activity.entity';
import { CRADB } from './data/dataModel/cra.entity';
import { HolidayDB } from './data/dataModel/holiday.entity';
import { ProjectDB } from './data/dataModel/project.entity';
import { CraService } from './domain/service/cra.service';
import { CraController } from './controllers/cra.controller';
import { RepoCra } from './data/Repository/RepoCra';
import { RepoHoliday } from './data/Repository/RepoHoliday';
import { ScheduleModule } from '@nestjs/schedule';
import { ProjectController } from './controllers/Project.controller';
import { DoaminModule } from './domain/domain.module';
import { RepoProject } from './data/Repository/RepoProject';
import { CollabController } from './controllers/Collab.controller';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { RegulDB } from './data/dataModel/regul.entity';
import { ExportService } from './domain/service/export.service';
import { HolidayController } from './controllers/Holiday.controller';

let dotEnvPath = '.env';

if (process.env.NODE_ENV) {
  dotEnvPath = `.env_${process.env.NODE_ENV}`;
}

console.log('env is ', dotEnvPath);

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: dotEnvPath }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_DATABASE || 'tests',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      dropSchema: true,
    }),
    TypeOrmModule.forFeature([
      UserDB,
      AbsenceDB,
      ActivityDB,
      CRADB,
      HolidayDB,
      ProjectDB,
      RegulDB,
    ]),
    DoaminModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    CraController,
    ProjectController,
    CollabController,
    HolidayController,
  ],
  providers: [
    AppService,
    CraApplication,
    CraService,
    ExportService,
    { provide: 'IRepoCollab', useClass: RepoCollab },
    { provide: 'IRepoCra', useClass: RepoCra },
    { provide: 'IRepoHoliday', useClass: RepoHoliday },
    { provide: 'IRepoProject', useClass: RepoProject },
  ],
})
export class TestModule {}