import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { firestore } from "../../../firebase";
import { PageTitle } from "../../pageTitle/PageTitle";
import "./blogs.css";

const BlogView = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    firestore
      .collection("blogs")
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setPost({ id: doc.id, ...doc.data() });
        }
      });
  }, [id]);

  if (!post) return null;

  return (
    <div className="blog-view">
      <PageTitle title={post.title} />
      {post.image && <img src={post.image} alt={post.title} className="blog-cover" />}
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default BlogView;
