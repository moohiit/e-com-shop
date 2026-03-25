import { parse } from "csv-parse/sync";
import slugify from "slugify";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "CSV file is required" });
    }

    const csvContent = req.file.buffer.toString("utf-8");
    let records;

    try {
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (parseErr) {
      return res.status(400).json({ success: false, message: "Invalid CSV format: " + parseErr.message });
    }

    if (records.length === 0) {
      return res.status(400).json({ success: false, message: "CSV file is empty" });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 for header + 0-index

      try {
        const { name, description, brand, basePrice, discountPercentage, taxPercentage, stock, categories } = row;

        if (!name || !description || !basePrice || !stock || !categories) {
          results.errors.push({ row: rowNum, message: "Missing required fields (name, description, basePrice, stock, categories)" });
          results.skipped++;
          continue;
        }

        // Resolve category names to IDs
        const categoryNames = categories.split("|").map((c) => c.trim()).filter(Boolean);
        const categoryIds = [];

        for (const catName of categoryNames) {
          const cat = await Category.findOne({
            $or: [
              { name: new RegExp(`^${catName}$`, "i") },
              { slug: new RegExp(`^${catName}$`, "i") },
            ],
          });
          if (cat) categoryIds.push(cat._id);
        }

        if (categoryIds.length === 0) {
          results.errors.push({ row: rowNum, message: `No valid categories found: ${categories}` });
          results.skipped++;
          continue;
        }

        const slug = slugify(name, { lower: true, strict: true });
        const existing = await Product.findOne({ slug });
        if (existing) {
          results.errors.push({ row: rowNum, message: `Product "${name}" already exists (slug conflict)` });
          results.skipped++;
          continue;
        }

        await Product.create({
          name,
          slug,
          description,
          brand: brand || "",
          basePrice: Number(basePrice),
          discountPercentage: Number(discountPercentage) || 0,
          taxPercentage: Number(taxPercentage) || 0,
          stock: Number(stock),
          categories: categoryIds,
          images: [],
          seller: req.user._id,
        });

        results.created++;
      } catch (err) {
        results.errors.push({ row: rowNum, message: err.message });
        results.skipped++;
      }
    }

    res.json({
      success: true,
      message: `Bulk upload complete: ${results.created} created, ${results.skipped} skipped`,
      results,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download CSV template
export const downloadTemplate = (_req, res) => {
  const header = "name,description,brand,basePrice,discountPercentage,taxPercentage,stock,categories";
  const example = '"Sample Product","A great product description","BrandName",999,10,18,50,"Electronics|Gadgets"';
  const csv = `${header}\n${example}`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=product-upload-template.csv");
  res.send(csv);
};
