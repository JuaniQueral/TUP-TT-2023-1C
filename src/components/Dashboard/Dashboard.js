import React, { useContext, useEffect, useState } from "react";

import NewBook from "../NewBook/NewBook";
import BooksFilter from "../BookFilter/BookFilter";
import Books from "../Books/Books";
import { useNavigate } from "react-router";
import { Button, Col, Row } from "react-bootstrap";
import { AuthenticationContext } from "../services/authentication/authentication.context";
import ToggleTheme from "../ui/ToggleTheme";
import { APIContext } from "../services/api/api.context";

const BOOKS = [
  {
    id: 1,
    title: "100 años de soledad",
    author: "Gabriel García Marquez",
    dateRead: new Date(2021, 8, 12),
    pageCount: 410,
  },
  {
    id: 2,
    title: "Todos los fuegos el fuego",
    author: "Julio Cortazar",
    dateRead: new Date(2020, 6, 11),
    pageCount: 197,
  },
  {
    id: 3,
    title: "Asesinato en el Orient Express",
    author: "Agatha Christie",
    dateRead: new Date(2021, 5, 9),
    pageCount: 256,
  },
  {
    id: 4,
    title: "Las dos torres",
    author: "J.R.R Tolkien",
    dateRead: new Date(2020, 3, 22),
    pageCount: 352,
  },
];

const Dashboard = () => {
  const { user, handleLogout } = useContext(AuthenticationContext);
  const { toggleLoading } = useContext(APIContext);

  const userName = user.email.split("@")[0];

  const [books, setBooks] = useState([]);
  const [filterYear, setFilterYear] = useState("2023");

  useEffect(() => {
    toggleLoading(true);

    fetch("http://localhost:8080/book/traertodoslosbook", {
      headers: {
        accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((bookData) => {
        const booksMapped = bookData.map((book) => ({
          title: book.bookTitle,
          author: book.author,
          pageCount: book.amountPages,
          dateRead: new Date(book.dateRead),
        }));
        setBooks(booksMapped);
        toggleLoading(false);
      })
      .catch((error) => {
        console.log(error);
        toggleLoading(false);
      });
  }, []);

  const navigation = useNavigate();

  const addBookHandler = (book) => {
    const dateString = book.dateRead.toISOString().slice(0, 10);
    const { authorName, authorLastName } = book.author;
    const newBooksArray = [book, ...books];
    setBooks(newBooksArray);
    localStorage.setItem("books", JSON.stringify(newBooksArray));
    fetch("http://localhost:8080/book/crear", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        author: { authorName: authorName, authorLastName: authorLastName },
        bookTitle: book.title,
        amountPages: parseInt(book.pageCount, 10),
        date: dateString,
      }),
    });
  };

  const filterYearChanged = (year) => {
    setFilterYear(year);
  };

  const onLogoutHandler = () => {
    handleLogout();
    navigation("/login");
  };

  return (
    <>
      <Row className="me-2 my-4">
        <Col>
          <h4 className="text-left m-3">Hola {userName}</h4>
        </Col>
        <Col md={3} className="d-flex justify-content-end">
          <ToggleTheme />
          <Button className="ms-4" variant="primary" onClick={onLogoutHandler}>
            Cerrar sesión
          </Button>
        </Col>
      </Row>
      <NewBook onBookAdded={addBookHandler} />
      <BooksFilter
        filterYear={filterYear}
        onFilterYearChange={filterYearChanged}
      />
      <Books filterYear={filterYear} books={books} />
    </>
  );
};

export default Dashboard;
