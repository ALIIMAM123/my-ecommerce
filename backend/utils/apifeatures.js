class ApiFeatures {
	constructor(query, queryStr) {
		this.query = query; //product.find()
		this.queryStr = queryStr; //keyword
	}

	// search feature
	search() {
		const keyword = this.queryStr.keyword
			? {
					name: {
						$regex: this.queryStr.keyword,
						$options: "i",
					},
			  }
			: {};
		// console.log(keyword);
		this.query = this.query.find({ ...keyword }); //changing product.find() method
		return this;
	}

	// filter products feature
	filter() {
		const queryCopy = { ...this.queryStr };
		// console.log(queryCopy);
		// Removing some fields for category
		const removeField = ["keyword", "page", "limit"];
		removeField.forEach((key) => delete queryCopy[key]);
		// console.log(queryCopy);

		// Filter for Price and Rating
		// console.log(queryCopy);
		let queryStr = JSON.stringify(queryCopy);
		// console.log(queryStr);
		queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

		//  this.query = this.query.find(queryCopy);                  //this.query means Product.find() method
		this.query = this.query.find(JSON.parse(queryStr));
		// console.log(queryStr);
		return this;
	}
	pagination(resultPerPage) {
		const currentPage = Number(this.queryStr.page) || 1; //50-10
		const skip = resultPerPage * (currentPage - 1);
		this.query = this.query.limit(resultPerPage).skip(skip);
		return this;
	}
}

module.exports = ApiFeatures;
