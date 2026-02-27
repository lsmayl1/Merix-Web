const {
  ShortCut,
  Products,
  ProductStock,
  StockBatch,
  Op,
} = require("../../models");
const AppError = require("../../utils/AppError");

const getAllShortCuts = async () => {
  try {
    const shortCuts = await ShortCut.findAll({
      include: [
        {
          model: Products,
          as: "product",
          attributes: ["product_id", "name", "barcode", "sellPrice"],
          include: [
            {
              model: StockBatch,
              as: "stockBatches",
              attributes: ["id", "remainingQuantity"],
              required: false,
              where: {
                remainingQuantity: {
                  [Op.ne]: 0,
                },
              },
            },
          ],
        },
      ],
    });
    if (!shortCuts) {
      return [];
    }
    const formattedShortCuts = shortCuts.map((shortcut) => {
      const product = shortcut.product;
      const totalStock = product?.stockBatches?.reduce(
        (total, batch) => total + Number(batch.remainingQuantity),
        0,
      );
      return {
        shortcut_id: shortcut.id,
        product_id: product.product_id,
        name: product.name,
        barcode: product.barcode,
        sellPrice: product.sellPrice,
        stock: totalStock.toFixed(2),
        position: shortcut.position,
      };
    });

    return formattedShortCuts;
  } catch (error) {
    throw error;
  }
};

const createShortCut = async (productId, position) => {
  try {
    if (!productId) {
      throw new AppError("Product ID is required to create a shortcut.", 400);
    }
    const existingShortCut = await ShortCut.findOne({
      where: { product_id: productId },
    });
    if (existingShortCut) {
      throw new AppError("Shortcut for this product already exists.", 400);
    }
    const newShortCut = await ShortCut.create({
      product_id: productId,
      position: position,
    });
    return newShortCut;
  } catch (error) {
    throw error;
  }
};
const getShortCutByProductId = async (productId) => {
  try {
    const shortCut = await ShortCut.findOne({
      where: { product_id: productId },
    });
    return shortCut;
  } catch (error) {
    throw error;
  }
};

const deleteShortCut = async (productId) => {
  try {
    if (!productId) {
      throw new AppError("Product ID is required to delete a shortcut.", 400);
    }
    const existingShortCut = await getShortCutByProductId(productId);
    if (!existingShortCut) {
      throw new AppError("Shortcut for this product does not exist.", 404);
    }
    await ShortCut.destroy({
      where: { product_id: productId },
    });
    return;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  getAllShortCuts,
  createShortCut,
  getShortCutByProductId,
  deleteShortCut,
};
