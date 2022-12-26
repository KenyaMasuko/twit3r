import Image from "next/image";
import type { RouterInputs, RouterOutputs } from "../utils/trpc";
import { trpc } from "../utils/trpc";
import { CreateTweet } from "./CreateTweet";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { useEffect, useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

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

type updateCacheProps = {
  client: QueryClient;
  input: RouterInputs["tweet"]["getTimeline"];
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
};
const updateCache = ({
  client,
  input,
  variables,
  data,
  action,
}: updateCacheProps) => {
  client.setQueryData(
    [
      ["tweet", "getTimeline"],
      {
        input,
        type: "infinite",
      },
    ],
    (oldDate) => {
      const newData = oldDate as InfiniteData<
        RouterOutputs["tweet"]["getTimeline"]
      >;

      const value = action === "like" ? 1 : -1;

      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                likes: action === "like" ? [data.userId] : [],
                _count: {
                  likes: tweet._count.likes + value,
                },
              };
            }
            return tweet;
          }),
        };
      });
      return {
        ...newData,
        pages: newTweets,
      };
    }
  );
};

const Tweet = ({
  tweet,
  client,
  input,
}: {
  tweet: RouterOutputs["tweet"]["getTimeline"]["tweets"][number];
  client: QueryClient;
  input: RouterInputs["tweet"]["getTimeline"];
}) => {
  const likeMutation = trpc.tweet.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, input, action: "like" });
    },
  }).mutateAsync;
  const unlikeMutation = trpc.tweet.unlike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, input, action: "unlike" });
    },
  }).mutateAsync;
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
              - {dayjs(tweet.createdAt).fromNow()}
            </time>
          </div>
          <p>{tweet.text}</p>
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
        <span className="text-sm text-gray-500">{tweet._count.likes}</span>
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

export const Timeline = ({
  where = {},
}: {
  where?: RouterInputs["tweet"]["getTimeline"]["where"];
}) => {
  const scrollPosition = useScrollPosition();
  const [isLoading, setIsLoading] = useState(false);
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.getTimeline.useInfiniteQuery(
      { limit: 10, where },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const client = useQueryClient();

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      setIsLoading(true);
      new Promise((resolve) => setTimeout(resolve, 3000)).then(() => {
        setIsLoading(false);
        console.log("called");
        fetchNextPage();
      });
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <div className="mx-auto max-w-xl pt-12 pb-12">
      <CreateTweet />

      <div className="border-l-2 border-t-2 border-r-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet
            key={tweet.id}
            tweet={tweet}
            client={client}
            input={{
              where,
              limit: 10,
            }}
          />
        ))}
      </div>
      {isLoading && (
        <div className="flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}
      {!hasNextPage && <p>No More Tweet</p>}
    </div>
  );
};
