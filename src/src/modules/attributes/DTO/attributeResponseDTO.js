class AttributeResponseDTO {
  constructor(attribute) {
    this.id = attribute._id;
    this.name = attribute.name;
    this.type = attribute.type;
    this.options = attribute.options;
    this.createdBy = attribute.createdBy;
    this.createdAt = attribute.createdAt;
  }
}

module.exports = AttributeResponseDTO;
