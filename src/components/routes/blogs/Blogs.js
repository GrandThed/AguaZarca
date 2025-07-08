import React, { useEffect, useState } from "react";
import { firestore } from "../../../firebase";
import { PageTitle } from "../../pageTitle/PageTitle";
import { Link } from "react-router-dom";
import * as ROUTES from "../../../routes";
import "./blogs.css";

const Blogs = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    firestore
      .collection("blogs")
      .orderBy("created", "desc")
      .get()
      .then((snap) => {
        const arr = [];
        snap.docs.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
        setPosts(arr);
      });
  }, []);

  const summary = (html) => html.replace(/<[^>]+>/g, "").slice(0, 100) + (html.length > 100 ? "..." : "");

  return (
    <div>
      <PageTitle title="Blog" />
      <div className="blog-card-container">
        {posts.map((post) => (
          <Link to={ROUTES.BLOG_VIEW.replace(":id", post.id)} key={post.id} className="blog-card">
            {post.image && <div className="blog-card-image" style={{ backgroundImage: `url(${post.image})` }} />}
            <div className="blog-card-content">
              <h2>{post.title}</h2>
              <p>{summary(post.content)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
