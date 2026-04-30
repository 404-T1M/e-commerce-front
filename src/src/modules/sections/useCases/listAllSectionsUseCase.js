const SectionRepository = require("../repository/sectionRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const SectionResponseDTO = require("../DTO/sectionResponseDTO");
class ListAllSectionsUseCase {
  constructor() {
    this.sectionRepository = new SectionRepository();
  }

  async execute(loggedInUser, filter) {
    await assertAdminPermission(loggedInUser, "sections.list");

    const queryFilter = {};

    if (filter.isActive !== undefined) {
      queryFilter.isActive = filter.isActive === "true";
    }
    if (filter.type) {
      queryFilter.type = filter.type;
    }
    if (filter.title) {
      queryFilter["title.en"] = { $regex: filter.title, $options: "i" };
    }

    const section = await this.sectionRepository.find(queryFilter);

    return section.map((sec) => new SectionResponseDTO(sec));
  }
}

module.exports = ListAllSectionsUseCase;
