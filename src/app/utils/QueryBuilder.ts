/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Query } from "mongoose";
import { excludeField } from "../constants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter = { ...this.query };

    for (const field of excludeField) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }

    this.modelQuery = this.modelQuery.find(filter); // Tour.find().find(filter)

    return this;
  }

  // search(searchableField: string[]): this {
  //   const searchTerm = this.query.searchTerm || "";
  //   const searchQuery = {
  //     $or: searchableField.map((field) => ({
  //       [field]: { $regex: searchTerm, $options: "i" },
  //     })),
  //   };
  //   this.modelQuery = this.modelQuery.find(searchQuery);
  //   return this;
  // }

  search(searchableField: string[]): this {
  const searchTerm = this.query.searchTerm;

  if (!searchTerm) return this; // no search

  const isObjectId = mongoose.Types.ObjectId.isValid(searchTerm);

  const conditions = searchableField.map((field) => {
    // If searching ObjectId fields (user, tour)
    if (["user", "tour", "payment"].includes(field) && isObjectId) {
      return { [field]: new mongoose.Types.ObjectId(searchTerm) };
    }

    // Otherwise use regex for string fields
    return {
      [field]: { $regex: searchTerm, $options: "i" },
    };
  });

  this.modelQuery = this.modelQuery.find({
    $or: conditions,
  });

  return this;
}

  sort(): this {
    const sort = this.query.sort || "-createdAt";

    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }
  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "";

    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }
  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  populate(
    path: string | string[] | { path: string; select?: string } | any
  ): this {
    this.modelQuery = this.modelQuery.populate(path);
    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    // Extract applied filter conditions
    const filterQuery = this.modelQuery.getFilter();

    const totalDocuments = await this.modelQuery.model.countDocuments(
      filterQuery
    );

    const totalPage = Math.ceil(totalDocuments / limit);

    return {
      page,
      limit,
      total: totalDocuments,
      totalPage,
    };
  }
}
