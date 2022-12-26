import type { FormEvent } from "react";
import { useState } from "react";
import { object, z } from "zod";
import { trpc } from "../utils/trpc";

export const tweetSchema = object({
  text: z
    .string({
      required_error: "Tweet text is required",
    })
    .min(10)
    .max(280),
});

export const CreateTweet = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const utils = trpc.useContext();

  const { mutateAsync } = trpc.tweet.create.useMutation({
    onSuccess: () => {
      setText("");
      utils.tweet.getTimeline.invalidate();
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await tweetSchema.parse({ text });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      }
      return;
    }

    mutateAsync({ text });
  };

  return (
    <>
      {error && JSON.stringify(error)}
      <form
        onSubmit={handleSubmit}
        className="mb-4 flex w-full flex-col rounded-md border-2 p-4"
      >
        <textarea
          className="w-full p-4 shadow"
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <div className="mt-4 flex justify-end">
          <button
            className="rounded-md bg-primary px-4 py-2 text-white"
            type="submit"
          >
            Tweet
          </button>
        </div>
      </form>
    </>
  );
};
