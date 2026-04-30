const AddAdminGroupUseCase = require("../useCases/createAdminGroup");
const ListAdminGroupsUseCase = require("../useCases/listAdminGroupsUseCase");
const UpdateAdminGroupUseCase = require("../useCases/updateAdminGroupUseCase");
const DeleteAdminGroupUseCase = require("../useCases/deleteAdminGroupUseCase");
const ListAllPermissionsUseCase = require("../useCases/listAllPermissionsUseCase");
const catchAsync = require("../../../shared/utils/catchAsync");

class administratorsGroupController {
  constructor() {
    this.addAdminGroupUseCase = new AddAdminGroupUseCase();
    this.listAdminGroupsUseCase = new ListAdminGroupsUseCase();
    this.updateAdminGroupUseCase = new UpdateAdminGroupUseCase();
    this.deleteAdminGroupUseCase = new DeleteAdminGroupUseCase();
    this.listAllPermissionsUseCase = new ListAllPermissionsUseCase();
  }

  listAllPermissions = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const result = await this.listAllPermissionsUseCase.execute(loggedInUser);
    res.status(200).json({
      permissions: result.permissions,
    });
  });

  addAdminGroup = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const data = req.body;
    const adminGroup = await this.addAdminGroupUseCase.execute(
      loggedInUser,
      data,
    );
    res.status(201).json({
      message: "Admin Group Created Successfully",
      data: adminGroup,
    });
  });

  listAllAdminGroups = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      name: req.query.name,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      sort: req.query.sort,
    };
    const result = await this.listAdminGroupsUseCase.execute(
      loggedInUser,
      filter,
    );
    res.status(200).json({
      adminGroups: result.adminGroups,
      meta: result.meta,
    });
  });

  updateAdminGroups = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;
    const { adminGroupId } = req.params;
    const result = await this.updateAdminGroupUseCase.execute(
      loggedInUser,
      body,
      adminGroupId,
    );
    res.status(200).json({
      message: "Admin Group Updating Successfully",
      adminGroup: result,
    });
  });

  deleteAdminGroups = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { adminGroupId } = req.params;
    await this.deleteAdminGroupUseCase.execute(loggedInUser, adminGroupId);
    res.status(200).json({
      message: "Admin Group Deleted Successfully",
    });
  });
}

module.exports = administratorsGroupController;
