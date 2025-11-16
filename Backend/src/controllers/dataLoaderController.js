const dataLoaderModel = require("../models/dataLoaderModel");

const dataLoaderController = {
  async getVehicleOptions(req, res, next) {
    try {
      const [brands, colors] = await Promise.all([
        dataLoaderModel.getBrands(),
        dataLoaderModel.getColors(),
      ]);

      res.status(200).json({ brands, colors });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dataLoaderController;
