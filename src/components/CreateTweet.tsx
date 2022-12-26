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

  const { mutateAsync } = trpc.tweet.create.useMutation();

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
      <form onSubmit={handleSubmit}>
        <textarea onChange={(e) => setText(e.target.value)}></textarea>
        <div>
          <button type="submit">Tweet</button>
        </div>
      </form>
    </>
  );
};
