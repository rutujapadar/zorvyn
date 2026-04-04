const Record = require("../models/Record");

exports.createRecord = async (req, res) => {
  try {
    const { amount, type, category, date } = req.body;

    if (!amount || !type || !category || !date) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        error: "Invalid type"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: "Amount must be > 0"
      });
    }

    const record = await Record.create(req.body);

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getRecords = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;

    let filter = {};

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({ error: "Invalid type filter" });
      }
      filter.type = type;
    }

    if (category) filter.category = category;

    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({
          error: "Start date cannot be greater than end date"
        });
      }

      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Record.find(filter).sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    const updated = await Record.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    await Record.findByIdAndDelete(req.params.id);

    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.getSummary = async (req, res) => {
  try {
    const income = await Record.aggregate([
      { $match: { type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const expense = await Record.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const categoryTotals = await Record.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const recent = await Record.find().sort({ createdAt: -1 }).limit(5);

    const monthlyTrends = await Record.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          }
        }
      }
    ]);

    res.json({
      totalIncome: income[0]?.total || 0,
      totalExpense: expense[0]?.total || 0,
      netBalance:
        (income[0]?.total || 0) -
        (expense[0]?.total || 0),

      categoryTotals,
      recentActivity: recent,
      monthlyTrends
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
