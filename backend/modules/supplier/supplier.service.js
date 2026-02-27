const { where } = require("sequelize");
const {
  Products,
  SupplierTransactionDetails,
  SupplierTransactions,
  ProductStock,
  Suppliers,
  Op,
  sequelize,
  StockBatch,
} = require("../../models");
const AppError = require("../../utils/AppError");
const formatDate = require("../../utils/dateUtils");

const GetSupplierByQuery = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      throw new AppError("Query must be at least 2 characters long", 400);
    }

    const suppliers = await Suppliers.findAll({
      where: {
        name: {
          [Op.iLike]: `%${query}%`, // Kelimenin herhangi bir yerinde geçmesine izin ver
        },
      },
      include: {
        model: SupplierTransactions,
        as: "transactions",
        attributes: ["amount", "type", "payment_method"],
      },
      order: [["name", "ASC"]],
      limit: 50, // En fazla 20 ürün getir
    });

    if (suppliers.length > 0) {
      const suppliersWithDebt = suppliers.map((supplier) => {
        const transactions = supplier.transactions || [];

        const totalDebt = transactions.reduce((acc, transaction) => {
          const amount = Number(transaction.amount) || 0;
          const pm = transaction.payment_method;

          if (transaction.type === "purchase" && pm === "credit") {
            return acc + amount;
          } else if (transaction.type === "return") {
            return acc - amount;
          }
          return acc;
        }, 0);

        // Explicitly exclude transactions from the supplier data
        const { transactions: _, ...supplierData } = supplier.toJSON();

        return {
          ...supplierData,
          totalDebt,
        };
      });
      return suppliersWithDebt;
    } else {
      throw new AppError("No suppliers found for the given query", 404);
    }
  } catch (error) {
    throw error;
  }
};

const CreateTransaction = async (data) => {
  const {
    date,
    supplier_id,
    products,
    transaction_date,
    transaction_type,
    payment_method,
  } = data;

  if (!products || products.length === 0) {
    throw new AppError("Products list cannot be empty", 400);
  }

  const t = await Products.sequelize.transaction();

  try {
    const isPurchase = transaction_type === "purchase";
    const barcodes = products.map((p) => p.barcode);

    // ─── 1) Batch-fetch existing products (1 query) ───────────────────────────
    const existingProducts = await Products.findAll({
      where: { barcode: barcodes },
      transaction: t,
    });

    const productByBarcode = new Map(
      existingProducts.map((p) => [p.barcode, p]),
    );

    // ─── 2) Separate new vs existing products ────────────────────────────────
    const productsToCreate = products.filter(
      (p) => !productByBarcode.has(p.barcode),
    );
    const productsToUpdate = products.filter((p) =>
      productByBarcode.has(p.barcode),
    );

    // ─── 3) Bulk-create new products (1 query) ───────────────────────────────
    if (productsToCreate.length > 0) {
      const created = await Products.bulkCreate(
        productsToCreate.map((p) => ({
          name: p.name,
          barcode: p.barcode,
          buyPrice: p.buyPrice,
          sellPrice: p.sellPrice || 0,
          unit: p.unit,
        })),
        { transaction: t, returning: true },
      );
      created.forEach((cp) => productByBarcode.set(cp.barcode, cp));
    }

    // ─── 4) Bulk-update existing products (parallel, 1 query each) ───────────
    if (productsToUpdate.length > 0) {
      await Promise.all(
        productsToUpdate.map((p) => {
          const existing = productByBarcode.get(p.barcode);
          return existing.update(
            {
              name: p.name || existing.name,
              buyPrice: p.buyPrice || existing.buyPrice,
              sellPrice: p.sellPrice || existing.sellPrice,
            },
            { transaction: t },
          );
        }),
      );
    }

    // ─── 5) Compute totals & build batch/detail payloads ─────────────────────
    let totalAmount = 0;
    const batchesToCreate = [];

    for (const p of products) {
      const product = productByBarcode.get(p.barcode);
      p.product_id = product.product_id;
      p.total_price = p.quantity * p.buyPrice;
      totalAmount += p.total_price;

      if (isPurchase) {
        batchesToCreate.push({
          productId: product.product_id,
          remainingQuantity: p.quantity,
          unitCost: p.buyPrice,
          _barcode: product.barcode, // temp key to map back
        });
      }
    }

    // ─── 6) Create StockBatches first to get their IDs ───────────────────────
    const batchByBarcode = new Map();

    if (isPurchase && batchesToCreate.length > 0) {
      const createdBatches = await StockBatch.bulkCreate(
        batchesToCreate.map(({ _barcode, ...b }) => b), // strip temp key
        { transaction: t, returning: true },
      );

      // Map barcode → batch_id using the temp key
      batchesToCreate.forEach((b, i) => {
        batchByBarcode.set(b._barcode, createdBatches[i].id);
      });
    }

    // ─── 7) Create SupplierTransaction ───────────────────────────────────────
    const supplierTransaction = await SupplierTransactions.create(
      {
        date: date || new Date(),
        supplier_id,
        transaction_date: transaction_date || new Date(),
        amount: totalAmount,
        type: transaction_type,
        payment_method,
      },
      { transaction: t },
    );

    // ─── 8) Bulk-create transaction details with batch_id ─────────────────────
    await SupplierTransactionDetails.bulkCreate(
      products.map((p) => ({
        transaction_id: supplierTransaction.id,
        supplier_id,
        product_id: p.product_id,
        quantity: p.quantity,
        unit_price: p.buyPrice,
        total_price: p.total_price,
        batch_id: batchByBarcode.get(p.barcode) ?? null, // null for non-purchases
      })),
      { transaction: t },
    );

    await t.commit();
    return { success: true, message: "Transaction created successfully" };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const ReturnTransaction = async (transactionId) => {
  const t = await sequelize.transaction();
  try {
    if (!transactionId) {
      throw new AppError("Transaction ID is required", 404);
    }

    // ─── 1) Fetch & lock original transaction (no include to avoid LEFT JOIN issue) ──
    const orig = await SupplierTransactions.findOne({
      where: { id: transactionId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!orig) {
      throw new AppError("Original transaction not found", 404);
    }

    // Only allow returns for purchase transactions
    if (orig.type !== "purchase") {
      throw new AppError("Only purchase transactions can be returned", 400);
    }

    // ─── 2) Fetch details separately ─────────────────────────────────────────────
    const details = await SupplierTransactionDetails.findAll({
      where: { transaction_id: transactionId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (details.length === 0) {
      throw new AppError("No details found to return", 400);
    }

    // ─── 3) Validate stock & batches are sufficient to remove ──────────────────────
    for (const d of details) {
      if (d.batch_id) {
        const batch = await StockBatch.findByPk(d.batch_id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!batch) {
          throw new AppError("Stock batch not found", 500);
        }
        if (batch.remainingQuantity < d.quantity) {
          throw new AppError("Insufficient batch quantity to return", 400);
        }
      }
    }

    // ─── 4) Create return transaction ──────────────────────────────────────────────
    const returnTxn = await SupplierTransactions.create(
      {
        date: new Date(),
        supplier_id: orig.supplier_id,
        transaction_date: new Date(),
        amount: orig.amount,
        type: "return",
        payment_method: orig.payment_method,
        reference_no: orig.id,
      },
      { transaction: t },
    );

    // ─── 5) Build return details & apply stock/batch decrements ────────────────────
    const returnDetails = [];
    for (const d of details) {
      returnDetails.push({
        transaction_id: returnTxn.id,
        supplier_id: orig.supplier_id,
        product_id: d.product_id,
        quantity: d.quantity,
        unit_price: d.unit_price,
        total_price: d.total_price,
        batch_id: d.batch_id || null,
      });

      // Decrement batch remainingQuantity if applicable
      if (d.batch_id) {
        const batch = await StockBatch.findByPk(d.batch_id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        await batch.decrement("remainingQuantity", {
          by: d.quantity,
          transaction: t,
        });
      }
    }

    // ─── 6) Bulk-create return details ────────────────────────────────────────────
    await SupplierTransactionDetails.bulkCreate(returnDetails, {
      transaction: t,
    });

    // ─── 7) Commit ────────────────────────────────────────────────────────────────
    await t.commit();
    return {
      success: true,
      message: "Return transaction created successfully",
      id: returnTxn.id,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAllSupplierTransactions = async () => {
  try {
    const transactions = await SupplierTransactions.findAll({
      attributes: ["id", "amount", "date", "payment_method", "type"],
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: SupplierTransactionDetails,
          as: "details",
          attributes: ["quantity", "unit_price", "total_price"],
          include: {
            model: Products,
            as: "product",
            attributes: ["name", "barcode", "unit"],
          },
        },
        {
          model: Suppliers,
          as: "supplier",
          attributes: ["name"],
        },
      ],
    });
    return transactions;
  } catch (error) {
    throw error;
  }
};

const GetSupplierTransactionsWithDetails = async (id) => {
  try {
    if (!id) {
      throw new AppError("Id not reconized");
    }
    const Transactions = await SupplierTransactions.findAll({
      where: { supplier_id: id },
      include: {
        model: SupplierTransactionDetails,
        as: "details",
        include: {
          model: Products,
          as: "product",
        },
      },
    });

    if (Transactions.length > 0) {
      return Transactions;
    } else {
      return { transaction: [] };
    }
  } catch (error) {
    throw error;
  }
};

const GetSupplierInvoice = async (transaction_id) => {
  try {
    // Validation
    if (!transaction_id) {
      throw new AppError("Supplier ID veya Transaction ID gerekli", 404);
    }

    const transaction = await SupplierTransactions.findOne({
      where: { id: transaction_id },
    });
    // Transaction detaylarını getir
    const transactionDetails = await SupplierTransactionDetails.findAll({
      where: { transaction_id },
      attributes: ["quantity", "unit_price", "total_price"],
      include: {
        model: Products,
        as: "product",
        attributes: ["name", "barcode", "unit", "sellPrice", "product_id"],
      },
    });

    const formatedDetails = transactionDetails.map((dt) => ({
      name: dt.product?.name,
      barcode: dt.product?.barcode,
      unit: dt.product?.unit,
      id: dt.id,
      product_id: dt.product.product_id,
      price: dt.unit_price,
      quantity: dt.quantity,
      total: dt.total_price,
      buyPrice: dt.unit_price,
      sellPrice: dt.product.sellPrice,
    }));

    if (!transactionDetails.length) {
      throw new AppError("Bu işlem için detay bulunamadı  ", 404);
    }
    const formatedTransaction = {
      ...transaction.toJSON(),
      amount: transaction.amount + " ₼",
      date: formatDate(transaction.createdAt.toJSON()),
    };
    return {
      transaction: formatedTransaction,
      details: formatedDetails, // detayları ekle
    };
  } catch (error) {
    throw error;
  }
};

const GetSupplierDebt = async (id) => {
  try {
    if (!id) {
      throw new AppError("Supplier ID is required", 400);
    }
    const supplier = await Suppliers.findOne({
      where: { id },
      include: {
        model: SupplierTransactions,
        as: "transactions",
        attributes: ["amount", "type", "payment_method"],
      },
    });
    if (!supplier) {
      throw new AppError("Supplier not found", 404);
    }
    const transactions = supplier.transactions || [];
    const totalDebt = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount) || 0;

      if (
        transaction.type === "purchase" &&
        transaction.payment_method === "credit"
      ) {
        return acc + amount; // borca ekle
      } else if (
        transaction.type === "payment" ||
        transaction.type === "return"
      ) {
        return acc - amount; // borçtan düş
      }
      return acc;
    }, 0);

    return totalDebt.toFixed(2);
  } catch (error) {
    throw new AppError(
      "Error fetching supplier debt",
      500,
      error.message || "Internal server error",
    );
  }
};

const UpdateSupplierTransaction = async (id, data) => {
  const {
    date,
    supplier_id,
    transaction_date,
    transaction_type,
    payment_method,
  } = data;
  try {
    if (!id) {
      throw new AppError("Transaction ID is required", 400);
    }
    const transaction = await SupplierTransactions.findByPk(id);
    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }
    // 1) Transaction güncelle
    await transaction.update({
      date: date || transaction.date,
      supplier_id: supplier_id || transaction.supplier_id,
      transaction_date: transaction_date || transaction.transaction_date,
      type: transaction_type || transaction.type,
      payment_method: payment_method || transaction.payment_method,
    });

    return {
      success: true,
      message: "Transaction updated successfully",
    };
  } catch (error) {
    throw new AppError(error, 500);
  }
};

const resolveProduct = async (item, t) => {
  // 1️⃣ product_id varsa → birbaşa tap
  if (item.product_id) {
    const product = await Products.findByPk(item.product_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (product) return product;
  }

  // 2️⃣ barcode ilə tap
  if (!item.barcode) {
    throw new AppError("Product barcode is required", 400);
  }

  let product = await Products.findOne({
    where: { barcode: item.barcode },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  // 3️⃣ tapılmadı → yarat
  if (!product) {
    product = await Products.create(
      {
        barcode: item.barcode,
        name: item.name,
        unit: item.unit,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
      },
      { transaction: t },
    );

    await ProductStock.create(
      {
        product_id: product.product_id || product.id,
        current_stock: 0,
      },
      { transaction: t },
    );
  }

  // 🔴 FINAL GUARANTEE
  if (!product || !(product.product_id || product.id)) {
    throw new AppError("Product could not be resolved", 500);
  }

  return product;
};

const UpdateSupplierInvoice = async (transaction_id, data) => {
  const t = await sequelize.transaction();

  try {
    /* =========================
       1️⃣ TRANSACTION
    ========================== */
    const transaction = await SupplierTransactions.findOne({
      where: { id: transaction_id, supplier_id: data.supplier_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    /* =========================
       2️⃣ OLD DETAILS
    ========================== */
    const oldDetails = await SupplierTransactionDetails.findAll({
      where: { transaction_id, supplier_id: data.supplier_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    /* =========================
       3️⃣ OLD STOCK ROLLBACK
       purchase → -qty
       return   → +qty
    ========================== */
    const oldMultiplier = transaction.type === "purchase" ? -1 : 1;

    for (const detail of oldDetails) {
      const qty = Number(detail.quantity);
      if (Number.isNaN(qty)) {
        throw new AppError("Invalid quantity in old details", 500);
      }

      const stock = await ProductStock.findOne({
        where: { product_id: detail.product_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!stock) {
        throw new AppError(
          `Stock not found for product ${detail.product_id}`,
          500,
        );
      }

      await stock.increment("current_stock", {
        by: qty * oldMultiplier,
        transaction: t,
      });
    }

    /* =========================
       4️⃣ OLD DETAILS DELETE
    ========================== */
    await SupplierTransactionDetails.destroy({
      where: { transaction_id },
      transaction: t,
    });

    /* =========================
       5️⃣ TRANSACTION TOTAL
    ========================== */
    if (!data.products || data.products.length === 0) {
      throw new AppError("Products not found", 400);
    }

    let transactionTotal = 0;
    for (const p of data.products) {
      const qty = Number(p.quantity);
      const price = Number(p.buyPrice);

      if (Number.isNaN(qty) || Number.isNaN(price)) {
        throw new AppError("Invalid product quantity or price", 400);
      }

      transactionTotal += qty * price;
    }

    /* =========================
       6️⃣ TRANSACTION UPDATE
    ========================== */
    await transaction.update(
      {
        supplier_id: data.supplier_id ?? transaction.supplier_id,
        date: data.date ?? transaction.date,
        payment_method: data.payment_method ?? transaction.payment_method,
        type: data.transaction_type ?? transaction.type,
        amount: transactionTotal,
      },
      { transaction: t },
    );

    /* =========================
       7️⃣ NEW DETAILS
       + PRODUCT CREATE / UPDATE
    ========================== */
    const newDetails = [];

    for (const item of data.products) {
      const product = await resolveProduct(item, t);

      newDetails.push({
        supplier_id: data.supplier_id,
        transaction_id,
        product_id: product.product_id || product.id, // 🔥 ARTİQ HEÇ VAXT NULL DEYİL
        quantity: Number(item.quantity),
        unit_price: Number(item.buyPrice),
        total_price: Number(item.quantity) * Number(item.price),
      });
    }

    await SupplierTransactionDetails.bulkCreate(newDetails, {
      transaction: t,
    });

    /* =========================
       8️⃣ NEW STOCK APPLY
       purchase → +qty
       return   → -qty
    ========================== */
    const newMultiplier = data.transaction_type === "purchase" ? 1 : -1;

    for (const detail of newDetails) {
      const stock = await ProductStock.findOne({
        where: { product_id: detail.product_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!stock) {
        throw new AppError("Stock not found", 500);
      }

      if (newMultiplier === -1 && stock.current_stock < detail.quantity) {
        throw new AppError("Insufficient stock", 400);
      }

      await stock.increment("current_stock", {
        by: detail.quantity * newMultiplier,
        transaction: t,
      });
    }

    /* =========================
       9️⃣ COMMIT
    ========================== */
    await t.commit();
    return { success: true };
  } catch (error) {
    await t.rollback();
    throw new AppError(error.message || error, 500);
  }
};

module.exports = {
  CreateTransaction,
  ReturnTransaction,
  GetSupplierTransactionsWithDetails,
  GetSupplierInvoice,
  GetSupplierByQuery,
  GetSupplierDebt,
  UpdateSupplierTransaction,
  UpdateSupplierInvoice,
  getAllSupplierTransactions,
};
