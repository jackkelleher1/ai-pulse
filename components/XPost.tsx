"use client";

import { formatDistanceToNow } from "date-fns";
import type { ContentItem } from "@/types/database";

// Chamath's known profile image from Twitter CDN
const CHAMATH_AVATAR = "https://pbs.twimg.com/profile_images/1883600182165848064/-9LbG3md_400x400.jpg";

const CREATOR_META: Record<string, { name: string; handle: string; avatar: string }> = {
  chamath: {
    name: "Chamath Palihapitiya",
    handle: "@chamath",
    avatar: CHAMATH_AVATAR,
  },
};

function CheckBadge() {
  return (
    <svg viewBox="0 0 22 22" width="16" height="16" aria-label="Verified account">
      <path
        fill="#1d9bf0"
        d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
      />
    </svg>
  );
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function XPost({ item }: { item: ContentItem }) {
  const handle = (item.tags as string[]).find((t) => t !== "x" && t !== "twitter") ?? "chamath";
  const meta = CREATOR_META[handle] ?? {
    name: item.author ?? handle,
    handle: `@${handle}`,
    avatar: null,
  };

  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block px-4 py-3.5 hover:bg-white/[0.03] border-b border-[#2f3336] last:border-0 transition-colors"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {meta.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={meta.avatar}
              alt={meta.name}
              className="w-9 h-9 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {meta.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-sm font-bold text-white leading-tight">{meta.name}</span>
              <CheckBadge />
              <span className="text-sm text-[#71767b]">{meta.handle}</span>
              <span className="text-[#71767b] text-sm">·</span>
              <span className="text-sm text-[#71767b]">{timeAgo}</span>
            </div>
            <div className="text-[#71767b] group-hover:text-sky-400 transition-colors shrink-0 mt-0.5">
              <XLogo />
            </div>
          </div>

          {/* Tweet body */}
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">
            {item.summary ?? item.title}
          </p>
        </div>
      </div>
    </a>
  );
}
