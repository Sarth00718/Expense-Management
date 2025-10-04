/**
 * Pagination utility for MongoDB queries
 * @param {Object} query - Mongoose query object
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Paginated results
 */
export const paginate = async (query, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    populate = null
  } = options;

  const skip = (page - 1) * limit;

  // Execute query with pagination
  let queryBuilder = query
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Add population if specified
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(pop => {
        queryBuilder = queryBuilder.populate(pop);
      });
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }

  const [results, total] = await Promise.all([
    queryBuilder.exec(),
    query.model.countDocuments(query.getFilter())
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: results,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Extract pagination parameters from request query
 * @param {Object} req - Express request object
 * @returns {Object} Pagination parameters
 */
export const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // Limit max items per page
  const maxLimit = 100;
  const validLimit = Math.min(limit, maxLimit);

  return {
    page: Math.max(1, page),
    limit: validLimit,
    sort: { [sortBy]: sortOrder }
  };
};
