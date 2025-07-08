import React, { useRef, useState } from "react";
import { firestore, auth, storage } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Redirect } from "react-router-dom";
import { PageTitle } from "../../pageTitle/PageTitle";
import * as ROUTES from "../../../routes";
import { compressImage } from "../../../utils/imageOptim";
import "./blogs.css";

const BlogCreate = () => {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [image, setImage] = useState(null);
  const editorRef = useRef(null);

  const handleSubmit = async () => {
    let imageUrl = "";
    if (image) {
      const compressed = await compressImage(image);
      const ref = storage.ref(`blogImages/${title.slice(0, 20).replace(/\W/g, "-")}/${compressed.name}`);
      await ref.put(compressed);
      imageUrl = await ref.getDownloadURL();
    }
    firestore
      .collection("blogs")
      .add({
        title,
        content,
        image: imageUrl,
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
        <input type="text" required placeholder="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <div className="text-editor">
          <div className="editor-toolbar">
            <button type="button" onClick={() => document.execCommand("bold", false, null)}>
              B
            </button>
            <button type="button" onClick={() => document.execCommand("formatBlock", false, "h2")}>
              H2
            </button>
          </div>
          <div
            ref={editorRef}
            className="editor-area"
            contentEditable
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
          />
        </div>
        <button type="button" onClick={handleSubmit}>
          Crear
        </button>
      </form>
    </div>
  );
};

export default BlogCreate;
