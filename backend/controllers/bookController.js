import bookModel from "../models/bookModel.js";
import cloudinary from "../config/cloudinary.js";

const uploadBook = async (req, res) => {
  const { title, caption, image, rating } = req.body;
  if (!title || !caption || !image || !rating) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    //upload image to cloudinary
    const result = await cloudinary.uploader.upload(image);
    const uploadUrl = result.secure_url;

    const book = new bookModel({
      title,
      caption,
      image: uploadUrl,
      rating,
      user: req.user._id,
    });
    await book.save();

    return res
      .status(201)
      .json({ success: true, book, message: "Book uploaded successfully" });
  } catch (error) {
    console.error("Error uploading book: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getBooks = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  const skip = (page - 1) * limit;
  try {
    const books = await bookModel
      .find({})
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBooks = await bookModel.countDocuments();
    const totalPages = Math.ceil(totalBooks / limit);

    return res.status(200).json({
      success: true,
      books,
      currentPage: page,
      totalBooks,
      totalPages,
    });
  } catch (error) {
    console.error("Error getting books: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await bookModel.findById(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    if (book.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "You are not authorized" });
    }
    //delete image from cloudinary
    if (book.image?.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from cloudinary: ", error);
      }
    }

    await book.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const recommendBook = async (req, res) => {
  try {
    const books = await bookModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, books });
  } catch (error) {
    console.error("Error getting books: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export { uploadBook, getBooks, deleteBook, recommendBook };
