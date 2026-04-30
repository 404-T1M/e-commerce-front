const catchAsync = require("../../../shared/utils/catchAsync");
const GetAllAttributesUseCase = require("../useCases/getAllAttributesUseCase");
const CreateAttributeUseCase = require("../useCases/createAttributeUseCase");
const DeleteAttributeUseCase = require("../useCases/deleteAttributeUseCase");

class AttributeController {
  constructor() {
    this.getAllAttributesUseCase = new GetAllAttributesUseCase();
    this.createAttributeUseCase = new CreateAttributeUseCase();
    this.deleteAttributeUseCase = new DeleteAttributeUseCase();
  }

  createAttribute = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;

    const attribute = await this.createAttributeUseCase.execute(
      loggedInUser,
      body,
    );

    res.status(201).json({
      message: "Attribute Created Successfully",
      attribute,
    });
  });

  ListAllAttribute = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      name: req.query.name,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 15,
      sort: req.query.sort,
    };

    const attributes = await this.getAllAttributesUseCase.execute(
      loggedInUser,
      filter,
    );
    const result = await this.getAllAttributesUseCase.execute(
      loggedInUser,
      filter,
    );
    res.status(200).json({
      attributes: result.data,
      meta: result.meta,
    });
  });

  deleteAttribute = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { attributeId } = req.params;

    await this.deleteAttributeUseCase.execute(loggedInUser, attributeId);

    res.status(200).json({
      message: "Attribute Deleted Successfully",
    });
  });
}

module.exports = AttributeController;
