class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          $or: [
            { name: { $regex: this.queryStr.keyword, $options: 'i' } },
            { description: { $regex: this.queryStr.keyword, $options: 'i' } },
            { brand: { $regex: this.queryStr.keyword, $options: 'i' } },
            { tags: { $regex: this.queryStr.keyword, $options: 'i' } },
            { 'specifications.value': { $regex: this.queryStr.keyword, $options: 'i' } },
          ],
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Advanced filtering for price, ratings etc
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  category(categoryId) {
    if (categoryId) {
      this.query = this.query.find({ category: categoryId });
    }
    return this;
  }

  priceRange(min, max) {
    if (min || max) {
      const priceFilter = {};
      if (min) priceFilter.$gte = Number(min);
      if (max) priceFilter.$lte = Number(max);
      this.query = this.query.find({ price: priceFilter });
    }
    return this;
  }

  rating(minRating) {
    if (minRating) {
      this.query = this.query.find({ ratings: { $gte: Number(minRating) } });
    }
    return this;
  }

  discount(minDiscount) {
    if (minDiscount) {
      this.query = this.query.find({ discount: { $gte: Number(minDiscount) } });
    }
    return this;
  }

  filterByBrand(brands) {
    if (brands) {
      const brandArray = brands.split(',').map((b) => b.trim());
      this.query = this.query.find({ brand: { $in: brandArray } });
    }
    return this;
  }

  filterByColor(colors) {
    if (colors) {
      const colorArray = colors.split(',').map((c) => c.trim());
      this.query = this.query.find({ 'colors.name': { $in: colorArray } });
    }
    return this;
  }

  filterBySize(sizes) {
    if (sizes) {
      const sizeArray = sizes.split(',').map((s) => s.trim());
      this.query = this.query.find({ 'sizes.name': { $in: sizeArray } });
    }
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }

  // Get total count for pagination
  async getTotalCount() {
    const countQuery = this.query.model.find(this.query.getFilter());
    return await countQuery.countDocuments();
  }

  // Select specific fields
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
}

module.exports = APIFeatures;