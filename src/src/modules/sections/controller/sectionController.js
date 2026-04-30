const catchAsync = require("../../../shared/utils/catchAsync");
const AddSectionUseCase = require("../useCases/addSectionUseCase");
const DeleteSectionUseCase = require("../useCases/deleteSectionUseCase");
const GetHomePageUseCase = require("../useCases/getHomePageUseCase");
const GetSimilarProductsUseCase = require("../useCases/getSimilarProductsUseCase");
const ListAllSectionsUseCase = require("../useCases/listAllSectionsUseCase");
const UpdateSectionUseCase = require("../useCases/updateSectionUseCase");

class SectionController {
  constructor() {
    this.addSectionUseCase = new AddSectionUseCase();
    this.deleteSectionUseCase = new DeleteSectionUseCase();
    this.getHomePageUseCase = new GetHomePageUseCase();
    this.getSimilarProductsUseCase = new GetSimilarProductsUseCase();
    this.listAllSectionsUseCase = new ListAllSectionsUseCase();
    this.updateSectionUseCase = new UpdateSectionUseCase();
  }

  addSection = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;

    const section = await this.addSectionUseCase.execute(loggedInUser, body);

    res.status(201).json({
      message: "Section Created Successfully",
      section,
    });
  });

  listAllSections = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      ...req.query,
    };

    const sections = await this.listAllSectionsUseCase.execute(
      loggedInUser,
      filter,
    );

    res.status(200).json({
      sections,
    });
  });

  getHomePageSections = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;

    const sections = await this.getHomePageUseCase.execute(loggedInUser);

    res.status(200).json({
      sections,
    });
  });

  getSimilarProductsSection = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const section = await this.getSimilarProductsUseCase.execute(productId);

    res.status(200).json({
      section,
    });
  });

  deleteSection = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { sectionId } = req.params;

    await this.deleteSectionUseCase.execute(loggedInUser, sectionId);

    res.status(200).json({
      message: "Section Deleted Successfully",
    });
  });

  updateSection = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { sectionId } = req.params;
    const body = req.body;

    const section = await this.updateSectionUseCase.execute(
      loggedInUser,
      sectionId,
      body,
    );

    res.status(200).json({
      message: "Section Updated Successfully",
      section,
    });
  });
}

module.exports = SectionController;