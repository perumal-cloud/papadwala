import mongoose from 'mongoose';

// Generic repository class for common database operations
export class BaseRepository<T extends mongoose.Document> {
  private model: mongoose.Model<T>;

  constructor(model: mongoose.Model<T>) {
    this.model = model;
  }

  // Create a new document
  async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Find by ID
  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Find one document by query
  async findOne(query: object): Promise<T | null> {
    try {
      return await this.model.findOne(query);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Find multiple documents with pagination
  async findMany(
    query: object = {},
    options: {
      page?: number;
      limit?: number;
      sort?: object;
      populate?: string | object;
      select?: string;
    } = {}
  ): Promise<{
    documents: T[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 }, populate, select } = options;
      const skip = (page - 1) * limit;

      let queryBuilder = this.model.find(query).skip(skip).limit(limit).sort(sort as any);

      if (select) {
        queryBuilder = queryBuilder.select(select);
      }

      if (populate) {
        queryBuilder = queryBuilder.populate(populate as any);
      }

      const [documents, total] = await Promise.all([
        queryBuilder.exec(),
        this.model.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        documents,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update by ID
  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update one document by query
  async updateOne(query: object, data: Partial<T>): Promise<T | null> {
    try {
      return await this.model.findOneAndUpdate(
        query,
        { $set: data },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete by ID
  async deleteById(id: string): Promise<T | null> {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete one document by query
  async deleteOne(query: object): Promise<T | null> {
    try {
      return await this.model.findOneAndDelete(query);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Count documents
  async count(query: object = {}): Promise<number> {
    try {
      return await this.model.countDocuments(query);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check if document exists
  async exists(query: object): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(query).limit(1);
      return count > 0;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Aggregate query
  async aggregate(pipeline: object[]): Promise<any[]> {
    try {
      return await this.model.aggregate(pipeline as any);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bulk operations
  async bulkWrite(operations: any[]): Promise<any> {
    try {
      return await this.model.bulkWrite(operations);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Text search (requires text index)
  async searchText(
    searchTerm: string,
    additionalQuery: object = {},
    options: {
      page?: number;
      limit?: number;
      sort?: object;
    } = {}
  ): Promise<{
    documents: T[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, sort = { score: { $meta: 'textScore' } } } = options;
      const skip = (page - 1) * limit;

      const query = {
        $text: { $search: searchTerm },
        ...additionalQuery
      };

      const [documents, total] = await Promise.all([
        this.model
          .find(query, { score: { $meta: 'textScore' } })
          .sort(sort as any)
          .skip(skip)
          .limit(limit),
        this.model.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        documents,
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Private method to handle errors
  private handleError(error: any): Error {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return new Error(`Validation Error: ${messages.join(', ')}`);
    }

    if (error.name === 'CastError') {
      return new Error(`Invalid ID format: ${error.value}`);
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return new Error(`Duplicate value for field: ${field}`);
    }

    return error;
  }
}

// Utility functions for common query operations
export const QueryUtils = {
  // Build search query with multiple fields
  buildSearchQuery(searchTerm: string, fields: string[]): object {
    if (!searchTerm || !fields.length) return {};

    const regex = new RegExp(searchTerm, 'i');
    return {
      $or: fields.map(field => ({ [field]: regex }))
    };
  },

  // Build date range query
  buildDateRangeQuery(startDate?: Date, endDate?: Date, field = 'createdAt'): object {
    const query: any = {};
    
    if (startDate || endDate) {
      query[field] = {};
      if (startDate) query[field].$gte = startDate;
      if (endDate) query[field].$lte = endDate;
    }
    
    return query;
  },

  // Build price range query
  buildPriceRangeQuery(minPrice?: number, maxPrice?: number, field = 'price'): object {
    const query: any = {};
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query[field] = {};
      if (minPrice !== undefined) query[field].$gte = minPrice;
      if (maxPrice !== undefined) query[field].$lte = maxPrice;
    }
    
    return query;
  },

  // Build pagination options
  buildPaginationOptions(page?: number, limit?: number) {
    const pageNum = Math.max(1, page || 1);
    const limitNum = Math.min(100, Math.max(1, limit || 10)); // Max 100 items per page
    
    return {
      page: pageNum,
      limit: limitNum,
      skip: (pageNum - 1) * limitNum
    };
  },

  // Build sort options
  buildSortOptions(sortBy?: string, sortOrder?: 'asc' | 'desc'): object {
    if (!sortBy) return { createdAt: -1 };
    
    const order = sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: order };
  }
};

// Validation utilities
export const ValidationUtils = {
  // Validate MongoDB ObjectId
  isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (Indian format)
  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
    return phoneRegex.test(phone);
  },

  // Validate password strength
  isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Sanitize input string
  sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  },

  // Validate file type
  isValidFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    return extension ? allowedTypes.includes(extension) : false;
  }
};

// Transaction helper
export const TransactionUtils = {
  // Execute operations in a transaction
  async withTransaction<T>(operations: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      const result = await operations(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
};

export default BaseRepository;