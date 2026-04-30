const CategoryRepository = require("../repositories/categoryRepository");
const CategoryDataResponseDTO = require("../DTO/categoryDataResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class ListAllCategoriesUseCase {
  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  async execute(loggedInUser, filter) {
    if (loggedInUser && loggedInUser.role === "admin") {
      await assertAdminPermission(loggedInUser, "categories.list");
    }

    const query = {};

    if (filter.published !== undefined && filter.published !== "") {
      query.published = filter.published === "true" || filter.published === true;
    }

    if (filter.isDeleted !== undefined && filter.isDeleted !== "") {
      query.isDeleted = filter.isDeleted === "true" || filter.isDeleted === true;
    }

    if (filter.name) {
      query.$or = [
        { "name.en": { $regex: filter.name, $options: "i" } },
        { "name.ar": { $regex: filter.name, $options: "i" } },
      ];
    }

    if (filter.parent) {
      query.parent = filter.parent;
    }

    if (filter.fromDate || filter.toDate) {
      query.createdAt = {};
      if (filter.fromDate) query.createdAt.$gte = new Date(filter.fromDate);
      if (filter.toDate) query.createdAt.$lte = new Date(filter.toDate);
    }

    const sortMap = {
      name_asc: { "name.en": 1 },
      name_desc: { "name.en": -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };
    const sort = sortMap[filter.sort] || { createdAt: -1 };

    const pagination = {
      page: Number(filter.page) || 1,
      limit: Number(filter.limit) || 10,
    };

    const [categories, total] = await Promise.all([
      this.categoryRepo.find(query, pagination, sort, {
        populateParent: true,
        populateCreatedBy: true,
        populateAttributes: true,
      }),
      this.categoryRepo.count(query),
    ]);

    return {
      categories: categories.map((category) => new CategoryDataResponseDTO(category)),
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }
}

module.exports = ListAllCategoriesUseCase;
