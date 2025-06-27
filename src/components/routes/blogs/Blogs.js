import React, { useEffect, useState } from "react";
import { firestore } from "../../../firebase";
import { PageTitle } from "../../pageTitle/PageTitle";
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

  return (
    <div>
      <PageTitle title="Blog" />
      <div className="blog-list">
        {posts.map((post) => (
          <div key={post.id} className="blog-post">
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
