const RegisterUseCase = require("../useCases/registerUseCase");
const LoginUseCase = require("../useCases/loginUseCase");
const VerifiedEmailUseCase = require("../useCases/verifyEmailUseCase");
const ResendVerificationCodeUseCase = require("../useCases/resendVerificationCodeUseCase");
const ForgotPasswordUseCase = require("../useCases/forgotPasswordUseCase");
const ResetPasswordUseCase = require("../useCases/resetPasswordUseCase");
const AdminLoginUseCase = require("../useCases/adminLoginUseCase");
const ListUsersUseCase = require("../useCases/listUsersUseCase");
const GetUserDetailsUseCase = require("../useCases/getUserDetailsUseCase");
const ChangeUserStatusUseCase = require("../useCases/changeUserStatusUseCase");
const DeleteUserUseCase = require("../useCases/deleteUserUseCase");
const AddAdminUseCase = require("../useCases/addAdminUseCase");
const UpdateAdminGroupUseCase = require("../useCases/updateAdminGroupUseCase");
const DeleteAdminUseCase = require("../useCases/deleteAdminUseCase");
const GetMeUseCase = require("../useCases/getMeUseCase");
const ChangeInfoUseCase = require("../useCases/ChangeInfoUseCase");
const catchAsync = require("../../../shared/utils/catchAsync");

class UsersController {
  constructor() {
    this.registerUseCase = new RegisterUseCase();
    this.loginUseCase = new LoginUseCase();
    this.verifyEmailUseCase = new VerifiedEmailUseCase();
    this.resendVerificationCodeUseCase = new ResendVerificationCodeUseCase();
    this.forgotPasswordUseCase = new ForgotPasswordUseCase();
    this.resetPasswordUseCase = new ResetPasswordUseCase();
    this.adminLoginUseCase = new AdminLoginUseCase();
    this.listUsersUseCase = new ListUsersUseCase();
    this.getUserDetailsUseCase = new GetUserDetailsUseCase();
    this.changeUserStatusUseCase = new ChangeUserStatusUseCase();
    this.deleteUserUseCase = new DeleteUserUseCase();
    this.addAdminUseCase = new AddAdminUseCase();
    this.updateAdminGroupUseCase = new UpdateAdminGroupUseCase();
    this.deleteAdminUseCase = new DeleteAdminUseCase();
    this.getMeUseCase = new GetMeUseCase();
    this.changeInfoUseCase = new ChangeInfoUseCase();
  }

  register = catchAsync(async (req, res, next) => {
    const user = await this.registerUseCase.execute(req.body);
    res.status(201).json({
      message: "Your Signed Up Successfully Please Confirm Your Email",
      data: user,
    });
  });

  login = catchAsync(async (req, res, next) => {
    const user = await this.loginUseCase.execute(req.body);
    res.status(200).json({
      message: "Login Successfully",
      data: user,
    });
  });

  verifyEmail = catchAsync(async (req, res, next) => {
    await this.verifyEmailUseCase.execute(req.body);
    res.status(200).json({
      message: "Email Verified Successfully",
    });
  });

  resendVerificationCode = catchAsync(async (req, res, next) => {
    await this.resendVerificationCodeUseCase.execute(req.body);
    res.status(200).json({
      message: "Verification Code Was Send Successfully Check Your Email",
    });
  });

  forgotPassword = catchAsync(async (req, res, next) => {
    await this.forgotPasswordUseCase.execute(req.body);
    res.status(200).json({
      message: "Reset Password Link Was Send Successfully Check Your Email",
    });
  });

  ResetPassword = catchAsync(async (req, res, next) => {
    await this.resetPasswordUseCase.execute(req);
    res.status(200).json({
      message: "Password Changed Successfully",
    });
  });

  listAllUsers = catchAsync(async (req, res, next) => {
    const user = req.user;
    const filter = {
      role: "user",
      isDeleted: false,
      name: req.query.name,
      status: req.query.status,
      emailVerified: req.query.emailVerified,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };
    const result = await this.listUsersUseCase.execute(user, filter);
    res.status(200).json({
      users: result.users,
      meta: result.meta,
    });
  });

  getUserDetails = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { userId } = req.params;

    const result = await this.getUserDetailsUseCase.execute(user, userId);
    res.status(200).json({
      user: result,
    });
  });

  getMe = catchAsync(async (req, res, next) => {
    const user = req.user;

    const result = await this.getMeUseCase.execute(user);
    res.status(200).json({
      user: result,
    });
  });

  updateMyInfo = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const data = req.body;
    const image = req.file;
    const result = await this.changeInfoUseCase.execute(loggedInUser, data, image);
    res.status(200).json({
      message: "User Info Updated Successfully",
      user: result,
    });
  });

  changeUserStatus = catchAsync(async (req, res, nex) => {
    const user = req.user;
    const { userId } = req.params;
    const result = await this.changeUserStatusUseCase.execute(user, userId);
    res.status(200).json({
      message: "User Status Changed Successfully",
      user: result,
    });
  });

  deleteUser = catchAsync(async (req, res, nex) => {
    const user = req.user;
    const { customerId } = req.params;
    const result = await this.deleteUserUseCase.execute(user, customerId);
    res.status(200).json({
      message: "User Deleted Successfully",
      user: result,
    });
  });

  adminLogin = catchAsync(async (req, res, next) => {
    const admin = await this.adminLoginUseCase.execute(req.body);
    res.status(200).json({
      message: "Login Successfully",
      data: admin,
    });
  });

  listAllAdmins = catchAsync(async (req, res, next) => {
    const user = req.user;

    const filter = {
      role: "admin",
      isDeleted: false,
      name: req.query.name,
      status: req.query.status,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      sort: req.query.sort,
    };
    const result = await this.listUsersUseCase.execute(user, filter);
    res.status(200).json({
      users: result.users,
      meta: result.meta,
    });
  });

  addAdmin = catchAsync(async (req, res, next) => {
    const user = req.user;
    const body = req.body;

    const result = await this.addAdminUseCase.execute(user, body);
    res.status(200).json({
      message: "Admin Added Successfully",
      user: result,
    });
  });

  updateAdmin = catchAsync(async (req, res, next) => {
    const user = req.user;
    const body = req.body;
    const { adminId } = req.params;

    const result = await this.updateAdminGroupUseCase.execute(
      user,
      body.adminGroup,
      adminId,
    );
    res.status(200).json({
      message: "Admin Updated Successfully",
      user: result,
    });
  });

  deleteAdmin = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { adminId } = req.params;

    await this.deleteAdminUseCase.execute(user, adminId);
    res.status(200).json({
      message: "Admin Deleted Successfully",
    });
  });
}

module.exports = UsersController;
