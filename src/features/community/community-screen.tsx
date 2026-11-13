"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import {
  demoAuthor,
  postText,
  searchPosts,
  topics,
  validPost,
  type Topic,
  type Post,
} from "./service";
function PostForm({ post, onClose }: { post?: Post; onClose: () => void }) {
  const { dispatchForum, notify } = useDemo();
  const { locale, f } = useLocale();
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [topic, setTopic] = useState<Topic>(post?.topic ?? "support");
  const [error, setError] = useState(false);
  return (
    <form
      className="profile-panel post-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!validPost(title, body, topic)) {
          setError(true);
          return;
        }
        if (post) {
          dispatchForum({
            type: "edit",
            id: post.id,
            title,
            body,
            topic,
            actorId: demoAuthor,
          });
          notify(f.postUpdated);
          onClose();
        } else {
          const id = crypto.randomUUID();
          dispatchForum({
            type: "create",
            post: {
              id,
              authorId: demoAuthor,
              title: title.trim(),
              body: body.trim(),
              topic,
              locale,
              createdAt: Date.now(),
              comments: [],
              reported: false,
            },
          });
          notify(f.postCreated);
          onClose();
          router.push(`/${locale}/community/${id}`);
        }
      }}
    >
      <h2>{post ? f.editPost : f.newPost}</h2>
      <label>
        {f.postTitle}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />
      </label>
      <label>
        {f.topic}
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value as Topic)}
        >
          {topics.map((code) => (
            <option value={code} key={code}>
              {f[code]}
            </option>
          ))}
        </select>
      </label>
      <label>
        {f.postBody}
        <textarea
          required
          rows={5}
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="form-error">
          {f.postError}
        </p>
      )}
      <div className="actions">
        <button className="button primary">
          {post ? f.saveEdit : f.publish}
        </button>
        <button type="button" className="button light" onClick={onClose}>
          {f.cancelEdit}
        </button>
      </div>
    </form>
  );
}
export function CommunityScreen() {
  const { posts } = useDemo();
  const { locale, t, f } = useLocale();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<Topic | "">("");
  const [sort, setSort] = useState<"recent" | "discussed">("recent");
  const [compose, setCompose] = useState(false);
  const results = searchPosts(posts, query, topic, sort);
  return (
    <>
      <div className="page-heading">
        <h1>{f.community}</h1>
        <p className="lead">{f.communityLead}</p>
        <button className="button primary" onClick={() => setCompose(!compose)}>
          {compose ? f.cancelEdit : f.newPost}
        </button>
      </div>
      <p className="notice">{f.communityDemo}</p>
      <details className="trust-box">
        <summary>{f.communityRules}</summary>
        <p>{f.demoPrivacy}</p>
      </details>
      {compose && <PostForm onClose={() => setCompose(false)} />}
      <div className="forum-filters">
        <label>
          {f.search}
          <input
            type="search"
            placeholder={f.forumQuery}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          {f.topic}
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value as Topic | "")}
          >
            <option value="">{f.allTopics}</option>
            {topics.map((code) => (
              <option key={code} value={code}>
                {f[code]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {f.sort}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "recent" | "discussed")}
          >
            <option value="recent">{f.recent}</option>
            <option value="discussed">{f.discussed}</option>
          </select>
        </label>
        <button
          className="button light"
          onClick={() => {
            setQuery("");
            setTopic("");
            setSort("recent");
          }}
        >
          {f.reset}
        </button>
      </div>
      <p role="status">
        {t.resultCount}: {results.length}
      </p>
      {results.length === 0 ? (
        <div className="empty">
          <h2>{f.noPosts}</h2>
          <p>{f.noPostsBody}</p>
        </div>
      ) : (
        <div className="forum-list">
          {results.map((post) => {
            const text = postText(post, locale);
            return (
              <article className="offering-card forum-card" key={post.id}>
                <div className="card-top">
                  <span className="tag">{f[post.topic]}</span>
                  <span className="quiet">
                    {post.authorId === demoAuthor ? f.yourPost : f.demoAuthor}
                  </span>
                </div>
                <h2 lang={post.translations ? locale : post.locale}>
                  {text.title}
                </h2>
                <p
                  className="forum-excerpt"
                  lang={post.translations ? locale : post.locale}
                >
                  {text.body}
                </p>
                <div className="card-bottom">
                  <span>
                    {f.comments}: {post.comments.length}
                  </span>
                  <Link
                    className="button light"
                    href={`/${locale}/community/${post.id}`}
                  >
                    {f.readTopic}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
export function CommunityThread({ id }: { id: string }) {
  const { posts, dispatchForum, notify } = useDemo();
  const { locale, t, f } = useLocale();
  const router = useRouter();
  const post = posts.find((p) => p.id === id);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(false);
  if (!post)
    return (
      <div className="empty">
        <h1>{f.threadMissing}</h1>
        <p>{f.communityDemo}</p>
        <Link className="button primary" href={`/${locale}/community`}>
          {f.backCommunity}
        </Link>
      </div>
    );
  const text = postText(post, locale);
  const own = post.authorId === demoAuthor;
  return (
    <div className="thread-page">
      <div className="page-heading">
        <Link href={`/${locale}/community`}>{f.backCommunity}</Link>
      </div>
      <p className="notice">{f.communityDemo}</p>
      {editing ? (
        <PostForm post={post} onClose={() => setEditing(false)} />
      ) : (
        <article className="profile-panel forum-thread">
          <span className="tag">{f[post.topic]}</span>
          <h1 lang={post.translations ? locale : post.locale}>{text.title}</h1>
          <p className="quiet">{own ? f.yourPost : f.demoAuthor}</p>
          <p
            className="post-content"
            lang={post.translations ? locale : post.locale}
          >
            {text.body}
          </p>
          <div className="actions">
            {own ? (
              <>
                <button
                  className="button light"
                  onClick={() => setEditing(true)}
                >
                  {f.editPost}
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    dispatchForum({ type: "delete", id, actorId: demoAuthor });
                    notify(f.deletedPost);
                    router.push(`/${locale}/community`);
                  }}
                >
                  {f.deletePost}
                </button>
              </>
            ) : (
              <button
                className="text-button"
                disabled={post.reported}
                onClick={() => {
                  dispatchForum({ type: "report", id, actorId: demoAuthor });
                  notify(f.reportNotice);
                }}
              >
                {post.reported ? f.reported : f.report}
              </button>
            )}
          </div>
        </article>
      )}
      <section className="thread-comments">
        <h2>
          {f.comments} ({post.comments.length})
        </h2>
        {post.comments.length === 0 && <p className="quiet">{f.noComments}</p>}
        {post.comments.map((c) => (
          <article className="comment-card" key={c.id}>
            <b>{c.authorId === demoAuthor ? f.yourPost : f.demoAuthor}</b>
            <p className="post-content" lang={c.locale}>
              {c.body}
            </p>
            {c.authorId === demoAuthor && (
              <button
                className="text-button"
                onClick={() =>
                  dispatchForum({
                    type: "deleteComment",
                    postId: id,
                    commentId: c.id,
                    actorId: demoAuthor,
                  })
                }
              >
                {f.deleteComment}
              </button>
            )}
          </article>
        ))}
        <form
          className="profile-panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (!comment.trim() || comment.trim().length > 1000) {
              setError(true);
              return;
            }
            dispatchForum({
              type: "comment",
              postId: id,
              comment: {
                id: crypto.randomUUID(),
                authorId: demoAuthor,
                body: comment.trim(),
                locale,
                createdAt: Date.now(),
              },
            });
            setComment("");
            setError(false);
            notify(f.commentCreated);
          }}
        >
          <label>
            {f.commentLabel}
            <textarea
              required
              maxLength={1000}
              rows={3}
              placeholder={f.commentPlaceholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>
          <p className="quiet">{f.communityRules}</p>
          {error && (
            <p role="alert" className="form-error">
              {f.commentError}
            </p>
          )}
          <button className="button primary">{f.addComment}</button>
        </form>
      </section>
      <p className="quiet">{t.session}</p>
    </div>
  );
}
