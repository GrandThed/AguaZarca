import React, { useState } from "react";
import { firestore, auth } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Redirect } from "react-router-dom";
import { PageTitle } from "../../pageTitle/PageTitle";
import * as ROUTES from "../../../routes";
import "./blogs.css";

const BlogCreate = () => {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = () => {
    firestore
      .collection("blogs")
      .add({
        title,
        content,
        created: new Date(),
        author: user.email,
      })
      .then(() => setRedirect(true));
  };

  if (!user) {
    return <Redirect to={ROUTES.HOME} />;
  }
  if (redirect) {
    return <Redirect to={ROUTES.BLOGS} />;
  }

  return (
    <div>
      <PageTitle title="Crear Blog" />
      <form className="blog-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          required
          placeholder="Titulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          required
          placeholder="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <button type="button" onClick={handleSubmit}>
          Crear
        </button>
      </form>
    </div>
  );
};

export default BlogCreate;
