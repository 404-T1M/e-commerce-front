const catchAsync = require("../../../shared/utils/catchAsync");
const AddBannerUseCase = require("../useCases/addBannerUseCase");
const ListAllBannersUseCase = require("../useCases/listAllBannersUseCase");
const GetBannerUseCase = require("../useCases/getBannerUseCase");
const UpdateBannerUseCase = require("../useCases/updateBannerUseCase");
const DeleteBannerUseCase = require("../useCases/deleteBannerUseCase");

class BannerController {
  constructor() {
    this.listAllBannersUseCase = new ListAllBannersUseCase();
    this.createBannerUseCase = new AddBannerUseCase();
    this.getBannerUseCase = new GetBannerUseCase();
    this.updateBannerUseCase = new UpdateBannerUseCase();
    this.deleteBannerUseCase = new DeleteBannerUseCase();
  }

  addBanner = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;
    const imageFile = req.file;

    const banner = await this.createBannerUseCase.execute(
      loggedInUser,
      body,
      imageFile,
    );

    res.status(201).json({
      message: "Banner Created Successfully",
      banner,
    });
  });

  listAllBanners = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      isActive: req.query.isActive,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
    };

    const result = await this.listAllBannersUseCase.execute(
      loggedInUser,
      filter,
    );
    res.status(200).json({
      banners: result.banners,
      meta: result.meta,
    });
  });

  updateBanner = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { bannerId } = req.params;
    const body = req.body;
    const imageFile = req.file;

    const banner = await this.updateBannerUseCase.execute(
      loggedInUser,
      bannerId,
      body,
      imageFile,
    );

    res.status(200).json({
      message: "Banner Updated Successfully",
      banner,
    });
  });

  getBanner = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { bannerId } = req.params;

    const banner = await this.getBannerUseCase.execute(loggedInUser, bannerId);

    res.status(200).json({
      message: "Banner Retrieved Successfully",
      banner,
    });
  });

  deleteBanner = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { bannerId } = req.params;

    await this.deleteBannerUseCase.execute(loggedInUser, bannerId);

    res.status(200).json({
      message: "Banner Deleted Successfully",
    });
  });
}

module.exports = BannerController;
