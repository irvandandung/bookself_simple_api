const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  let isSuccess = true;
  let statusCode = 500;
  let status = 'error';
  let message = 'Buku gagal ditambahkan';

  if (name === undefined) {
    statusCode = 400;
    status = 'fail';
    message = 'Gagal menambahkan buku. Mohon isi nama buku';
    isSuccess = false;
  }

  if (readPage > pageCount) {
    statusCode = 400;
    status = 'fail';
    message = 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount';
    isSuccess = false;
  }

  if (isSuccess) {
    books.push(newBook);
    isSuccess = books.filter((book) => book.id === id).length > 0;
  }

  let bodyResponse = {
    status,
    message,
  };

  if (isSuccess) {
    statusCode = 201;
    status = 'success';
    message = 'Buku berhasil ditambahkan';
    bodyResponse = {
      status,
      message,
      data: { bookId: id },
    };
  }

  const response = h.response(bodyResponse);
  response.code(statusCode);
  return response;
};

const getAllBooksHandler = (request) => {
  const { name, reading, finished } = request.query;
  const listBooks = [];
  let resultBook = books;

  if (name !== undefined) {
    resultBook = resultBook.filter(
      (bookItem) => bookItem.name.toLowerCase().indexOf(
        name.toString().toLowerCase(),
      ) > -1,
    );
  }

  if (reading === '1' || reading === '0') {
    const isReading = reading === '1';
    resultBook = resultBook.filter((bookItem) => bookItem.reading === isReading);
  }

  if (finished === '1' || finished === '0') {
    const isFinished = finished === '1';
    resultBook = resultBook.filter((bookItem) => bookItem.finished === isFinished);
  }

  resultBook.forEach((book) => {
    listBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    });
  });

  return ({
    status: 'success',
    data: {
      books: listBooks,
    },
  });
};

const getBookByBookIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((bookItem) => bookItem.id === bookId)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByBookIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();
  const finished = readPage === pageCount;

  const index = books.findIndex((book) => book.id === bookId);

  let isSuccess = true;
  let status = 'success';
  let statusCode = 200;
  let message = 'Buku berhasil diperbarui';

  if (name === undefined) {
    status = 'fail';
    message = 'Gagal memperbarui buku. Mohon isi nama buku';
    isSuccess = false;
    statusCode = 400;
  }

  if (readPage > pageCount) {
    status = 'fail';
    message = 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount';
    statusCode = 400;
    isSuccess = false;
  }

  if (index !== -1 && isSuccess) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
      finished,
    };
  } else if (isSuccess) {
    status = 'fail';
    message = 'Gagal memperbarui buku. Id tidak ditemukan';
    statusCode = 404;
  }

  const response = h.response({
    status,
    message,
  });
  response.code(statusCode);
  return response;
};

const deleteBookByBookIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    return ({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByBookIdHandler,
  editBookByBookIdHandler,
  deleteBookByBookIdHandler,
};
