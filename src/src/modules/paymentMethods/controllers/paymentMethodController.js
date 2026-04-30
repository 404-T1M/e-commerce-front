const catchAsync = require("../../../shared/utils/catchAsync");
const CreatePaymentMethodUseCase = require("../useCases/createPaymentMethodUseCase");
const ListAdminPaymentMethodsUseCase = require("../useCases/listAdminPaymentMethodsUseCase");
const UpdatePaymentMethodUseCase = require("../useCases/updatePaymentMethodUseCase");
const DeletePaymentMethodUseCase = require("../useCases/deletePaymentMethodUseCase");
const ListPublicPaymentMethodsUseCase = require("../useCases/listPublicPaymentMethodsUseCase");

class PaymentMethodController {
  constructor() {
    this.createPaymentMethodUseCase = new CreatePaymentMethodUseCase();
    this.listAdminPaymentMethodsUseCase = new ListAdminPaymentMethodsUseCase();
    this.updatePaymentMethodUseCase = new UpdatePaymentMethodUseCase();
    this.deletePaymentMethodUseCase = new DeletePaymentMethodUseCase();
    this.listPublicPaymentMethodsUseCase = new ListPublicPaymentMethodsUseCase();
  }

  createPaymentMethod = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;
    const imageFile = req.file;

    const paymentMethod = await this.createPaymentMethodUseCase.execute(
      loggedInUser,
      body,
      imageFile,
    );

    res.status(201).json({
      message: "Payment Method Created Successfully",
      paymentMethod,
    });
  });

  listAdminPaymentMethods = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      name: req.query.name,
      isActive: req.query.isActive,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 15,
      sort: req.query.sort,
    };

    const result = await this.listAdminPaymentMethodsUseCase.execute(
      loggedInUser,
      filter,
    );

    res.status(200).json(result);
  });

  updatePaymentMethod = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { paymentMethodId } = req.params;
    const body = req.body;
    const imageFile = req.file;

    const paymentMethod = await this.updatePaymentMethodUseCase.execute(
      loggedInUser,
      paymentMethodId,
      body,
      imageFile,
    );

    res.status(200).json({
      message: "Payment Method Updated Successfully",
      paymentMethod,
    });
  });

  deletePaymentMethod = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { paymentMethodId } = req.params;

    await this.deletePaymentMethodUseCase.execute(loggedInUser, paymentMethodId);

    res.status(200).json({
      message: "Payment Method Deleted Successfully",
    });
  });

  listPublicPaymentMethods = catchAsync(async (req, res, next) => {
    const paymentMethods = await this.listPublicPaymentMethodsUseCase.execute();

    res.status(200).json({ paymentMethods });
  });
}

module.exports = PaymentMethodController;
