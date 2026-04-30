const AppError = require("../../../core/errors/appError");
const SectionRepository = require("../repository/sectionRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
class DeleteSectionUseCase {
  constructor() {
    this.sectionRepository = new SectionRepository();
  }

  async execute(loggedInUser, sectionId) {
    await assertAdminPermission(loggedInUser, "sections.delete");

    const section = await this.sectionRepository.findOne({ _id: sectionId });
    if (!section) {
      throw new AppError("Section not found", 404);
    }

    await this.sectionRepository.deleteOne({ _id: sectionId });
  }
}

module.exports = DeleteSectionUseCase;
