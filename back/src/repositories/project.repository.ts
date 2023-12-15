import { IRepoProject } from '@app/domain/IRepository/IRepoProject';
import { Inject, Injectable } from '@nestjs/common';
import { Project } from '@app/domain/model/Project';
import { MongoClientWrapper } from '@app/mongo/mongo.client.wrapper';
import { ProjectStatus } from '@app/domain/model/projetStatus.enum';
import { EnhancedOmit, InferIdType } from 'mongodb';
import { ProjectCode } from '@app/domain/model/project.code';
import { CollabEmail } from '@app/domain/model/collab.email';
import { USER_COLLECTION } from '@app/repositories/collab.repository';
import { ProjectError } from '@app/domain/model/errors/project.error';

export const PROJECT_COLLECTION = 'projects';

export type IdType = { _id: string };

@Injectable()
export class ProjectRepository implements IRepoProject {
  constructor(
    @Inject(MongoClientWrapper)
    private wrapper: MongoClientWrapper,
  ) {}

  async delete(id: ProjectCode): Promise<void> {
    const collection = this.wrapper.getCollection(PROJECT_COLLECTION);
    await collection.deleteOne({
      _id: id.value,
    });
  }

  async findAll(): Promise<Project[]> {
    const collection = this.wrapper.getCollection(PROJECT_COLLECTION);

    const docs = [];
    for await (const doc of collection.find({})) {
      docs.push(doc);
    }
    return docs.map(this.mapProject);
  }

  async findById(id: ProjectCode): Promise<Project> {
    const collection = this.wrapper.getCollection(PROJECT_COLLECTION);
    const projectDoc = await collection.findOne({
      _id: id.value,
    });

    if (!projectDoc) {
      throw new ProjectError('Project not found');
    }

    return this.mapProject(projectDoc);
  }

  async findByUser(idUser: CollabEmail): Promise<Project[]> {
    const collection = this.wrapper.getCollection(PROJECT_COLLECTION);
    await collection.find({});

    const docs = [];
    for await (const doc of collection.find({
      _collabs: [idUser],
    })) {
      docs.push(doc);
    }

    return docs.map(this.mapProject);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  findLikeById(id: ProjectCode): Promise<Project[]> {
    throw new ProjectError('Operation not implemented');
  }

  async save(project: Project): Promise<void> {
    const collection = this.wrapper.db.collection<IdType>(PROJECT_COLLECTION);

    const collabsCollection =
      this.wrapper.db.collection<IdType>(USER_COLLECTION);

    const foundCollabs = await collabsCollection
      .find(
        {
          _id: {
            $in: project.collabs.map((collab) => collab.value),
          },
        },
        {
          projection: {
            _id: true,
          },
        },
      )
      .toArray();

    if (foundCollabs.length !== project.collabs.length) {
      throw new ProjectError(
        'Trying to assign a user that is not registered in the system',
      );
    }

    const count = await collection.countDocuments({
      _id: project.code.value,
    });

    if (count === 0) {
      await collection.insertOne({
        _id: project.code.value,
        ...project,
      });
    } else {
      await collection.replaceOne(
        {
          _id: project.code.value,
        },
        {
          _id: project.code.value,
          ...project,
        },
      );
    }
  }

  async update(updatedProject: Project): Promise<void> {
    const projectsCollection =
      this.wrapper.db.collection<IdType>(PROJECT_COLLECTION);

    await projectsCollection.updateOne(
      {
        _id: updatedProject.code,
      },
      updatedProject,
      { upsert: true },
    );
  }

  private mapProject(
    projectDoc: EnhancedOmit<IdType, '_id'> & {
      _id: InferIdType<IdType>;
    },
  ): Project {
    return new Project(
      new ProjectCode(projectDoc._id),
      projectDoc['_collabs'].map(
        (collabDoc) => new CollabEmail(collabDoc._value),
      ),
      projectDoc['_name'],
      projectDoc['_client'],
      projectDoc['_date'] ? projectDoc['_date'].$date : undefined,
      ProjectStatus[projectDoc['_status']],
    );
  }
}
