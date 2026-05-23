import { ServerError } from "@/components/auth/ServerError";

interface Props {
  serverError?: string | null;
}

function GoogleIcon() {
  return (
    <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6c-2 1.5-4.6 2.5-7.7 2.5-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.8-3.6 5.2l6.6 5.6c-.5.4 7.7-5.6 7.7-14.8 0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export default function SignInForm({ serverError }: Props) {
  return (
    <div className="space-y-4">
      <form method="POST" action="/api/auth/signin">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-100 active:bg-gray-200"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      <ServerError message={serverError} />
    </div>
  );
}
