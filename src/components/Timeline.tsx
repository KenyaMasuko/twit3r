import Image from "next/image";
import type { RouterOutputs } from "../utils/trpc";
import { trpc } from "../utils/trpc";
import { CreateTweet } from "./CreateTweet";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

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
  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        {tweet.author.image && (
          <Image
            src={tweet.author.image}
            alt={`${tweet.author.name} profile picture`}
            height={48}
            width={48}
            className="rounded-full"
          />
        )}
        <div className="ml-2">
          <div className="flex items-center">
            <p className="font-bold">{tweet.author.name}</p>
            <time className="text-sm text-gray-500">
              {" "}
              - {dayjs(tweet.createdAt).fromNow()} ago
            </time>
          </div>
          <p>{tweet.text}</p>
          <p>{tweet.id}</p>
        </div>
      </div>
    </div>
  );
};

export const Timeline = () => {
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.getTimeline.useInfiniteQuery(
      { limit: 10 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];
  return (
    <>
      <CreateTweet />

      <div className="border-l-2 border-t-2 border-r-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} tweet={tweet} />
        ))}
      </div>

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetching}
      >
        To NextPage
      </button>
    </>
  );
};
