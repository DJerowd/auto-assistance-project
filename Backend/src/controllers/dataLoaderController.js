const dataLoaderModel = require("../models/dataLoaderModel");

const dataLoaderController = {
  async getVehicleOptions(req, res, next) {
    try {
      const [brands, colors, features, serviceTypes] = await Promise.all([
        dataLoaderModel.getBrands(),
        dataLoaderModel.getColors(),
        dataLoaderModel.getFeatures(),
        dataLoaderModel.getServiceTypes(),
      ]);
      res.status(200).json({ brands, colors, features, serviceTypes });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dataLoaderController;
