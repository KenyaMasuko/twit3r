import { signIn, useSession } from "next-auth/react";
import { Container } from "./Container";

export const LoggedOut = () => {
  const { data: session } = useSession();
  if (session) {
    return null;
  }
  return (
    <div className="bg-primary fixed bottom-0 w-full p-4">
      <Container classNames="bg-transparent flex justify-between">
        <p className="text-white">Do not miss out</p>

        <div>
          <button
            className="px-4 py-2 text-white shadow-md"
            onClick={() => signIn()}
          >
            Login
          </button>
        </div>
      </Container>
    </div>
  );
};
