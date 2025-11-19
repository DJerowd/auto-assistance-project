const dataLoaderModel = require("../models/dataLoaderModel");

const dataLoaderController = {
  async getVehicleOptions(req, res, next) {
    try {
      const [brands, colors, features] = await Promise.all([
        dataLoaderModel.getBrands(),
        dataLoaderModel.getColors(),
        dataLoaderModel.getFeatures(),
      ]);

      res.status(200).json({ brands, colors, features });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dataLoaderController;
