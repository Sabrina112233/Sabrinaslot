import { users, gifJobs, type User, type InsertUser, type GifJob, type InsertGifJob } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGifJob(job: InsertGifJob): Promise<GifJob>;
  getGifJob(id: number): Promise<GifJob | undefined>;
  updateGifJobStatus(id: number, status: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gifJobs: Map<number, GifJob>;
  private currentUserId: number;
  private currentGifJobId: number;

  constructor() {
    this.users = new Map();
    this.gifJobs = new Map();
    this.currentUserId = 1;
    this.currentGifJobId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGifJob(insertJob: InsertGifJob): Promise<GifJob> {
    const id = this.currentGifJobId++;
    const job: GifJob = { 
      ...insertJob, 
      id,
      status: insertJob.status || "processing",
      createdAt: new Date()
    };
    this.gifJobs.set(id, job);
    return job;
  }

  async getGifJob(id: number): Promise<GifJob | undefined> {
    return this.gifJobs.get(id);
  }

  async updateGifJobStatus(id: number, status: string): Promise<void> {
    const job = this.gifJobs.get(id);
    if (job) {
      job.status = status;
      this.gifJobs.set(id, job);
    }
  }
}

export const storage = new MemStorage();
