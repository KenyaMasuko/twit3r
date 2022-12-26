import Image from "next/image";
import type { RouterOutputs } from "../utils/trpc";
import { trpc } from "../utils/trpc";
import { CreateTweet } from "./CreateTweet";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { useEffect, useState } from "react";
import { AiFillHeart } from "react-icons/ai";

dayjs.extend(relativeTime).locale("ja");
dayjs.extend(updateLocale).locale("ja");

dayjs.updateLocale("ja", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

const Tweet = ({
  tweet,
}: {
  tweet: RouterOutputs["tweet"]["getTimeline"]["tweets"][number];
}) => {
  const likeMutation = trpc.tweet.like.useMutation().mutateAsync;
  const unlikeMutation = trpc.tweet.unlike.useMutation().mutateAsync;
  const hasLiked = tweet.likes.length > 0;
  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex  p-2">
        {tweet.author.image && (
          <Image
            src={tweet.author.image}
            alt={`${tweet.author.name} profile picture`}
            height={48}
            width={48}
            className="h-12 w-12 rounded-full"
          />
        )}
        <div className="ml-2">
          <div className="flex items-center">
            <p className="font-bold">{tweet.author.name}</p>
            <time className="text-sm text-gray-500">
              - {dayjs(tweet.createdAt).fromNow()} ago
            </time>
          </div>
          <p>{tweet.text}</p>
          <p>{tweet.id}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center p-2">
        <AiFillHeart
          color={hasLiked ? "red" : "gray"}
          size="1.5rem"
          onClick={() => {
            if (hasLiked) {
              unlikeMutation({
                tweetId: tweet.id,
              });
              return;
            }
            likeMutation({
              tweetId: tweet.id,
            });
          }}
        />
        <span className="text-sm text-gray-500">{tweet.likes.length}</span>
      </div>
    </div>
  );
};

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const scrolled = (winScroll / height) * 100;
    setScrollPosition(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
};

export const Timeline = () => {
  const scrollPosition = useScrollPosition();
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.getTimeline.useInfiniteQuery(
      { limit: 10 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      new Promise((resolve) => setTimeout(resolve, 3000)).then(() => {
        fetchNextPage();
      });
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <>
      <CreateTweet />

      <div className="border-l-2 border-t-2 border-r-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} tweet={tweet} />
        ))}
      </div>
      {!hasNextPage && <p>No More Tweet</p>}
    </>
  );
};
