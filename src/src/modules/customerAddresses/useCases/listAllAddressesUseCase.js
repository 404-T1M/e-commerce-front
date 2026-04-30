const AddressRepository = require("../repositories/addressRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const AddressResponseDTO = require("../DTO/addressResponseDTO");

class ListAllAddressesUseCase {
  constructor() {
    this.addressRepo = new AddressRepository();
  }

  async execute(loggedInUser, filter) {
    await assertAdminPermission(loggedInUser, "customers.list");

    let query = {};

    if (filter.isPrimary != null) {
      query.isPrimary = filter.isPrimary;
    }

    if (filter.country) {
      query.country = filter.country;
    }

    if (filter.user) {
      query.user = filter.user;
    }

    if (filter.postalCode) {
      query.postalCode = { $regex: filter.postalCode, $options: "i" };
    }

    const [count, addresses] = await Promise.all([
      this.addressRepo.count(query),
      this.addressRepo.find(query, filter.sort, filter.page, filter.limit, {
        populateUsers: true,
      }),
    ]);

    return {
      data: addresses.map((address) => new AddressResponseDTO(address)),
      meta: {
        count,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(count / filter.limit),
      },
    };
  }
}

module.exports = ListAllAddressesUseCase;
