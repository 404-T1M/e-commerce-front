class adminGroupResponseDTO {
  constructor(adminGroupData) {
    this.id = adminGroupData._id;
    this.name = adminGroupData.name;
    this.permissions = adminGroupData.permissions;
    this.createdAt = adminGroupData.createdAt;
  }
}

module.exports = adminGroupResponseDTO;
